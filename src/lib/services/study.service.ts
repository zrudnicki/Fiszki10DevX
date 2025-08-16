import type { SupabaseClient } from "../../db/supabase";
import type { Database } from "../../db/database.types";
import type {
  StudySessionDTO,
  StartStudySessionRequest,
  ReviewFlashcardRequest,
  BatchReviewRequest,
  CompleteSessionRequest,
  NextFlashcardDTO,
} from "../../types/dto.types";
import {
  calculateNextReview,
  getCardsForReview,
  getNewCardsForLearning,
  getMixedCardsForStudy,
  getAnyAvailableCards,
  type SpacedRepetitionParams,
} from "../utils/spaced-repetition";

type DatabaseStudySessionInsert = Database["public"]["Tables"]["study_sessions"]["Insert"];
type DatabaseStudySessionUpdate = Database["public"]["Tables"]["study_sessions"]["Update"];
type DatabaseFlashcardUpdate = Database["public"]["Tables"]["flashcards"]["Update"];

/**
 * Study Service
 * Handles study sessions, spaced repetition, and learning progress
 */
export class StudyService {
  constructor(private supabase: SupabaseClient, private userId: string) {}

  /**
   * Start a new study session
   */
  async startStudySession(request: StartStudySessionRequest): Promise<StudySessionDTO> {
    try {
      // Validate collection exists and belongs to user
      const { data: collection, error: collectionError } = await this.supabase
        .from("collections")
        .select("id, name")
        .eq("id", request.collection_id)
        .eq("user_id", this.userId)
        .single();

      if (collectionError || !collection) {
        throw new Error("Collection not found or access denied");
      }

      // Get flashcards from the collection with spaced repetition data
      const { data: flashcards, error: flashcardsError } = await this.supabase
        .from("flashcards")
        .select(
          `
          id,
          front,
          back,
          collection_id,
          category_id,
          repetitions,
          easiness_factor,
          interval,
          next_review_date
        `
        )
        .eq("collection_id", request.collection_id);

      if (flashcardsError) {
        throw new Error(`Failed to fetch flashcards: ${flashcardsError.message}`);
      }

      if (!flashcards || flashcards.length === 0) {
        throw new Error("No flashcards found in this collection");
      }

      // Select cards based on session type
      const maxCards = request.max_cards || 20;
      let selectedCards: typeof flashcards;

      switch (request.session_type) {
        case "review":
          selectedCards = getCardsForReview(flashcards, maxCards);
          break;
        case "learn":
          selectedCards = getNewCardsForLearning(flashcards, maxCards);
          break;
        case "mixed":
        default:
          selectedCards = getMixedCardsForStudy(flashcards, maxCards);
          break;
      }

      // If no cards found with the selected strategy, try fallback
      if (selectedCards.length === 0) {
        console.log(`No cards found for ${request.session_type} session, trying fallback strategy`);
        selectedCards = getAnyAvailableCards(flashcards, maxCards);
      }

      if (selectedCards.length === 0) {
        throw new Error(`No flashcards available for study in this collection`);
      }

      // Create new study session
      const sessionData: DatabaseStudySessionInsert = {
        user_id: this.userId,
        collection_id: request.collection_id,
        status: "active",
        started_at: new Date().toISOString(),
        flashcards_reviewed_count: 0,
      };

      const { data: session, error: sessionError } = await this.supabase
        .from("study_sessions")
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) {
        throw new Error(`Failed to create study session: ${sessionError.message}`);
      }

      // Transform cards to DTO format
      const nextFlashcards: NextFlashcardDTO[] = selectedCards.map((card: any) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        collection_id: card.collection_id,
        category_id: card.category_id ?? undefined,
        repetition_count: card.repetitions || 0,
        ease_factor: card.easiness_factor || 2.5,
        interval_days: card.interval || 1,
        next_review_date: card.next_review_date,
        last_reviewed: undefined, // This field doesn't exist in current schema
      }));

      return {
        id: session.id,
        user_id: session.user_id,
        collection_id: session.collection_id,
        session_type: (request.session_type || "mixed") as "review" | "learn" | "mixed",
        status: session.status as "active" | "completed" | "paused",
        started_at: session.started_at,
        completed_at: session.ended_at || undefined,
        session_duration_ms: undefined, // Not tracked in current schema
        cards_reviewed: session.flashcards_reviewed_count,
        cards_correct: 0, // Not tracked in current schema
        accuracy_rate: undefined, // Not tracked in current schema
        next_flashcards: [],
      };
    } catch (error) {
      console.error("StudyService.startStudySession error:", error);
      throw error;
    }
  }

  /**
   * Review a single flashcard and update spaced repetition parameters
   */
  async reviewFlashcard(
    sessionId: string,
    request: ReviewFlashcardRequest
  ): Promise<{ success: boolean; next_review_date: string }> {
    try {
      // Validate session exists and belongs to user
      const { data: session, error: sessionError } = await this.supabase
        .from("study_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", this.userId)
        .eq("status", "active")
        .single();

      if (sessionError || !session) {
        throw new Error("Active study session not found");
      }

      // Get current flashcard data
      const { data: flashcard, error: flashcardError } = await this.supabase
        .from("flashcards")
        .select("*")
        .eq("id", request.flashcard_id)
        .eq("collection_id", session.collection_id)
        .single();

      if (flashcardError || !flashcard) {
        throw new Error("Flashcard not found in current session collection");
      }

      // Calculate new spaced repetition parameters
      const spacedRepParams: SpacedRepetitionParams = {
        quality: request.quality,
        repetition_count: flashcard.repetitions || 0,
        ease_factor: flashcard.easiness_factor || 2.5,
        interval_days: flashcard.interval || 1,
      };

      const newParams = calculateNextReview(spacedRepParams);

      // Update flashcard with new parameters
      const flashcardUpdate: DatabaseFlashcardUpdate = {
        repetitions: newParams.repetition_count,
        easiness_factor: newParams.ease_factor,
        interval: newParams.interval_days,
        next_review_date: newParams.next_review_date.toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await this.supabase
        .from("flashcards")
        .update(flashcardUpdate)
        .eq("id", request.flashcard_id);

      if (updateError) {
        throw new Error(`Failed to update flashcard: ${updateError.message}`);
      }

      // Update session statistics
      const sessionUpdate: DatabaseStudySessionUpdate = {
        flashcards_reviewed_count: session.flashcards_reviewed_count + 1,
        updated_at: new Date().toISOString(),
      };

      await this.supabase.from("study_sessions").update(sessionUpdate).eq("id", sessionId);

      return {
        success: true,
        next_review_date: newParams.next_review_date.toISOString(),
      };
    } catch (error) {
      console.error("StudyService.reviewFlashcard error:", error);
      throw error;
    }
  }

  /**
   * Process multiple flashcard reviews in batch
   */
  async batchReviewFlashcards(
    sessionId: string,
    request: BatchReviewRequest
  ): Promise<{ success: boolean; processed_count: number }> {
    try {
      // Validate session exists once for the whole batch
      const { data: session, error: sessionError } = await this.supabase
        .from("study_sessions")
        .select("id, collection_id, flashcards_reviewed_count")
        .eq("id", sessionId)
        .eq("user_id", this.userId)
        .eq("status", "active")
        .single();

      if (sessionError || !session) {
        throw new Error("Active study session not found for batch processing");
      }

      let processedCount = 0;
      const flashcardUpdates: Array<
        {
          id: string;
          user_id: string;
          repetitions: number;
          easiness_factor: number;
          interval: number;
          next_review_date: string;
          updated_at: string;
          front: string;
          back: string;
          collection_id: string;
        }
      > = [];

      // First, fetch all flashcards to be reviewed to ensure they exist
      const flashcardIds = request.reviews.map((r) => r.flashcard_id);
      const { data: flashcards, error: flashcardsError } = await this.supabase
        .from("flashcards")
        .select("*")
        .in("id", flashcardIds)
        .eq("collection_id", session.collection_id);

      if (flashcardsError) {
        throw new Error(`Failed to fetch flashcards for batch review: ${flashcardsError.message}`);
      }

      const flashcardsMap = new Map((flashcards as any[]).map((f) => [f.id, f]));

      // Prepare all updates
      for (const review of request.reviews) {
        const flashcard = flashcardsMap.get(review.flashcard_id);
        if (!flashcard) {
          console.error(`Flashcard ${review.flashcard_id} not found for batch review, skipping.`);
          continue;
        }

        const spacedRepParams: SpacedRepetitionParams = {
          quality: review.quality,
          repetition_count: flashcard.repetitions || 0,
          ease_factor: flashcard.easiness_factor || 2.5,
          interval_days: flashcard.interval || 1,
        };
        const newParams = calculateNextReview(spacedRepParams);

        flashcardUpdates.push({
          id: review.flashcard_id,
          user_id: this.userId,
          repetitions: newParams.repetition_count,
          easiness_factor: newParams.ease_factor,
          interval: newParams.interval_days,
          next_review_date: newParams.next_review_date.toISOString(),
          updated_at: new Date().toISOString(),
          front: flashcard.front,
          back: flashcard.back,
          collection_id: flashcard.collection_id,
        });
        processedCount++;
      }

      // Execute all updates in a single transaction if possible, or sequentially
      if (flashcardUpdates.length > 0) {
        const { error: updateError } = await this.supabase.from("flashcards").upsert(flashcardUpdates);

        if (updateError) {
          throw new Error(`Batch update failed: ${updateError.message}`);
        }
      }

      // Finally, update session statistics
      const sessionUpdate: DatabaseStudySessionUpdate = {
        flashcards_reviewed_count: session.flashcards_reviewed_count + processedCount,
        updated_at: new Date().toISOString(),
      };
      await this.supabase.from("study_sessions").update(sessionUpdate).eq("id", sessionId);

      return {
        success: processedCount > 0,
        processed_count: processedCount,
      };
    } catch (error) {
      console.error("StudyService.batchReviewFlashcards error:", error);
      throw error;
    }
  }

  /**
   * Complete a study session
   */
  async completeStudySession(sessionId: string, request: CompleteSessionRequest): Promise<StudySessionDTO> {
    try {
      // Validate session exists and belongs to user
      const { data: session, error: sessionError } = await this.supabase
        .from("study_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", this.userId)
        .eq("status", "active")
        .single();

      if (sessionError || !session) {
        throw new Error("Active study session not found");
      }

      // Update session with completion data
      const sessionUpdate: DatabaseStudySessionUpdate = {
        status: "completed",
        ended_at: new Date().toISOString(),
        flashcards_reviewed_count: Math.max(session.flashcards_reviewed_count, request.cards_reviewed),
        updated_at: new Date().toISOString(),
      };

      const { data: updatedSession, error: updateError } = await this.supabase
        .from("study_sessions")
        .update(sessionUpdate)
        .eq("id", sessionId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to complete study session: ${updateError.message}`);
      }

      return {
        id: updatedSession.id,
        user_id: updatedSession.user_id,
        collection_id: updatedSession.collection_id,
        session_type: "mixed" as "review" | "learn" | "mixed", // Default as schema doesn't store this
        status: updatedSession.status as "active" | "completed" | "paused",
        started_at: updatedSession.started_at,
        completed_at: updatedSession.ended_at || undefined,
        session_duration_ms: request.session_duration_ms,
        cards_reviewed: updatedSession.flashcards_reviewed_count,
        cards_correct: 0, // Not tracked in current schema
        accuracy_rate: request.accuracy_rate,
        next_flashcards: [], // No next cards for completed session
      };
    } catch (error) {
      console.error("StudyService.completeStudySession error:", error);
      throw error;
    }
  }

  /**
   * Get active study session by ID
   */
  async getStudySession(sessionId: string): Promise<StudySessionDTO | null> {
    try {
      const { data: session, error } = await this.supabase
        .from("study_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", this.userId)
        .single();

      if (error || !session) {
        return null;
      }

      return {
        id: session.id,
        user_id: session.user_id,
        collection_id: session.collection_id,
        session_type: "mixed" as "review" | "learn" | "mixed", // Default as schema doesn't store this
        status: session.status as "active" | "completed" | "paused",
        started_at: session.started_at,
        completed_at: session.ended_at || undefined,
        session_duration_ms: undefined, // Not tracked in current schema
        cards_reviewed: session.flashcards_reviewed_count,
        cards_correct: 0, // Not tracked in current schema
        accuracy_rate: undefined, // Not tracked in current schema
        next_flashcards: [], // Would need separate query to get remaining cards
      };
    } catch (error) {
      console.error("StudyService.getStudySession error:", error);
      throw error;
    }
  }

  /**
   * Get user's recent study sessions
   */
  async getRecentStudySessions(limit = 10): Promise<StudySessionDTO[]> {
    try {
      const { data: sessions, error } = await this.supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", this.userId)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch study sessions: ${error.message}`);
      }

      return sessions.map((session: any) => ({
        id: session.id,
        user_id: session.user_id,
        collection_id: session.collection_id,
        session_type: "mixed" as "review" | "learn" | "mixed", // Default as schema doesn't store this
        status: session.status as "active" | "completed" | "paused",
        started_at: session.started_at,
        completed_at: session.ended_at || undefined,
        session_duration_ms: undefined, // Not tracked in current schema
        cards_reviewed: session.flashcards_reviewed_count,
        cards_correct: 0, // Not tracked in current schema
        accuracy_rate: undefined, // Not tracked in current schema
        next_flashcards: [],
      }));
    } catch (error) {
      console.error("StudyService.getRecentStudySessions error:", error);
      throw error;
    }
  }
}
