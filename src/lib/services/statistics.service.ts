import type { SupabaseClient } from "../../db/supabase";
import type { Database } from "../../db/database.types";
import type {
  GenerationStatsDTO,
  UpdateGenerationStatsRequest,
  LearningStatsDTO,
  LearningStatsQuery,
} from "../../types/dto.types";

/**
 * Statistics Service
 * Handles generation and learning statistics operations
 */
export class StatisticsService {
  constructor(
    private supabase: SupabaseClient<Database>,
    private userId: string
  ) {}

  /**
   * Get AI generation statistics for the user
   */
  async getGenerationStats(): Promise<GenerationStatsDTO> {
    try {
      const { data, error } = await this.supabase
        .from("flashcard_generation_stats")
        .select("*")
        .eq("user_id", this.userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // Not found is ok
        console.error("Error fetching generation stats:", error);
        throw new Error("Failed to fetch generation statistics");
      }

      // If no stats exist, return default values
      if (!data) {
        return {
          total_generated: 0,
          total_accepted_direct: 0,
          total_accepted_edited: 0,
          acceptance_rate: 0,
          edit_rate: 0,
        };
      }

      // Calculate rates
      const totalAccepted = data.total_accepted_direct + data.total_accepted_edited;
      const acceptance_rate = data.total_generated > 0 ? (totalAccepted / data.total_generated) * 100 : 0;
      const edit_rate = totalAccepted > 0 ? (data.total_accepted_edited / totalAccepted) * 100 : 0;

      return {
        total_generated: data.total_generated,
        total_accepted_direct: data.total_accepted_direct,
        total_accepted_edited: data.total_accepted_edited,
        acceptance_rate: Math.round(acceptance_rate * 100) / 100, // Round to 2 decimal places
        edit_rate: Math.round(edit_rate * 100) / 100,
      };
    } catch (error) {
      console.error("Error in getGenerationStats:", error);
      throw new Error("Failed to fetch generation statistics");
    }
  }

  /**
   * Update AI generation statistics
   */
  async updateGenerationStats(updates: UpdateGenerationStatsRequest): Promise<GenerationStatsDTO> {
    try {
      // First, try to get existing stats
      const { data: existing } = await this.supabase
        .from("flashcard_generation_stats")
        .select("*")
        .eq("user_id", this.userId)
        .single();

      let result;

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from("flashcard_generation_stats")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", this.userId)
          .select()
          .single();

        if (error) {
          console.error("Error updating generation stats:", error);
          throw new Error("Failed to update generation statistics");
        }
        result = data;
      } else {
        // Create new record
        const { data, error } = await this.supabase
          .from("flashcard_generation_stats")
          .insert({
            user_id: this.userId,
            total_generated: updates.total_generated || 0,
            total_accepted_direct: updates.total_accepted_direct || 0,
            total_accepted_edited: updates.total_accepted_edited || 0,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating generation stats:", error);
          throw new Error("Failed to create generation statistics");
        }
        result = data;
      }

      // Calculate and return formatted stats
      const totalAccepted = result.total_accepted_direct + result.total_accepted_edited;
      const acceptance_rate = result.total_generated > 0 ? (totalAccepted / result.total_generated) * 100 : 0;
      const edit_rate = totalAccepted > 0 ? (result.total_accepted_edited / totalAccepted) * 100 : 0;

      return {
        total_generated: result.total_generated,
        total_accepted_direct: result.total_accepted_direct,
        total_accepted_edited: result.total_accepted_edited,
        acceptance_rate: Math.round(acceptance_rate * 100) / 100,
        edit_rate: Math.round(edit_rate * 100) / 100,
      };
    } catch (error) {
      console.error("Error in updateGenerationStats:", error);
      throw new Error("Failed to update generation statistics");
    }
  }

  /**
   * Get learning statistics for the user
   */
  async getLearningStats(query: LearningStatsQuery = {}): Promise<LearningStatsDTO> {
    try {
      const { collection_id, period = "all" } = query;

      // Get date range based on period
      const dateRange = this.getDateRange(period);

      // Base query for flashcards count
      let flashcardsQuery = this.supabase
        .from("flashcards")
        .select("id", { count: "exact" })
        .eq("user_id", this.userId);

      if (collection_id) {
        flashcardsQuery = flashcardsQuery.eq("collection_id", collection_id);
      }

      const { count: totalFlashcards, error: flashcardsError } = await flashcardsQuery;

      if (flashcardsError) {
        console.error("Error fetching flashcards count:", flashcardsError);
        throw new Error("Failed to fetch flashcards statistics");
      }

      // For now, return mock data since we don't have study_sessions table yet
      // TODO: Replace with real data when study sessions are implemented
      const mockReviewsByPeriod = this.generateMockReviewData(dateRange, period);

      return {
        total_flashcards: totalFlashcards || 0,
        total_reviews: mockReviewsByPeriod.reduce((sum, day) => sum + day.count, 0),
        accuracy_rate:
          mockReviewsByPeriod.length > 0
            ? mockReviewsByPeriod.reduce((sum, day) => sum + day.accuracy, 0) / mockReviewsByPeriod.length
            : 0,
        average_session_time: 120, // Mock: 2 minutes average
        reviews_by_period: mockReviewsByPeriod,
      };
    } catch (error) {
      console.error("Error in getLearningStats:", error);
      throw new Error("Failed to fetch learning statistics");
    }
  }

  /**
   * Get date range for statistics period
   */
  private getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
      default: // "all"
        start.setFullYear(2020); // Arbitrary start date
        break;
    }

    return { start, end };
  }

  /**
   * Generate mock review data for demonstration
   * TODO: Replace with real study session data
   */
  private generateMockReviewData(
    dateRange: { start: Date; end: Date },
    period: string
  ): { date: string; count: number; accuracy: number }[] {
    const reviews: { date: string; count: number; accuracy: number }[] = [];
    const { start, end } = dateRange;

    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const maxDays = Math.min(daysDiff, period === "week" ? 7 : period === "month" ? 30 : 365);

    for (let i = 0; i < maxDays; i += period === "week" ? 1 : period === "month" ? 1 : 7) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      reviews.push({
        date: date.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 20) + 1, // 1-20 reviews
        accuracy: Math.floor(Math.random() * 30) + 70, // 70-100% accuracy
      });
    }

    return reviews;
  }

  /**
   * Increment generation statistics (used by AI generation service)
   */
  async incrementGenerationStats(generated = 1, acceptedDirect = 0, acceptedEdited = 0): Promise<void> {
    try {
      const currentStats = await this.getGenerationStats();

      await this.updateGenerationStats({
        total_generated: currentStats.total_generated + generated,
        total_accepted_direct: currentStats.total_accepted_direct + acceptedDirect,
        total_accepted_edited: currentStats.total_accepted_edited + acceptedEdited,
      });
    } catch (error) {
      console.error("Error incrementing generation stats:", error);
      // Don't throw here to avoid breaking the main flow
    }
  }
}
