import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/supabase";
import type {
  GenerateFlashcardsRequest,
  GenerateFlashcardsResponse,
  AcceptFlashcardsRequest,
  AcceptFlashcardsResponse,
  FlashcardCandidate,
} from "../../types/dto.types";
import { OpenRouterClient } from "../utils/openrouter";
import { FlashcardsService } from "./flashcards.service";

// In-memory storage for generation sessions (in production, use Redis or database)
interface GenerationSession {
  id: string;
  userId: string;
  candidates: FlashcardCandidate[];
  originalText: string;
  maxCards: number;
  collectionId: string;
  categoryId?: string;
  createdAt: Date;
  expiresAt: Date;
}

// Simple in-memory storage (replace with Redis in production)
const generationSessions = new Map<string, GenerationSession>();

// Simple rate limiting (replace with Redis in production)
const userRateLimit = new Map<string, { count: number; resetTime: number }>();

export class AIGenerationService {
  private openRouter: OpenRouterClient;
  private flashcardsService: FlashcardsService;

  constructor(private supabase: SupabaseClient<Database>) {
    this.openRouter = new OpenRouterClient();
    this.flashcardsService = new FlashcardsService(supabase);
  }

  /**
   * Check rate limit for user (10 requests per hour)
   */
  private checkRateLimit(userId: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;
    const maxRequests = 10;

    const userLimit = userRateLimit.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      // Reset or create new rate limit
      userRateLimit.set(userId, { count: 1, resetTime: now + hourInMs });
      return { allowed: true };
    }

    if (userLimit.count >= maxRequests) {
      return { allowed: false, resetTime: userLimit.resetTime };
    }

    // Increment count
    userLimit.count++;
    userRateLimit.set(userId, userLimit);
    return { allowed: true };
  }

  /**
   * Validate that collection exists and belongs to user
   */
  private async validateCollection(userId: string, collectionId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("collections")
      .select("id")
      .eq("user_id", userId)
      .eq("id", collectionId)
      .single();

    return !error && !!data;
  }

  /**
   * Validate that category exists and belongs to user (optional)
   */
  private async validateCategory(userId: string, categoryId?: string): Promise<boolean> {
    if (!categoryId) return true;

    const { data, error } = await this.supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("id", categoryId)
      .single();

    return !error && !!data;
  }

  /**
   * Update generation statistics
   */
  private async updateGenerationStats(
    userId: string,
    generated: number,
    acceptedDirect: number = 0,
    acceptedEdited: number = 0
  ): Promise<void> {
    try {
      // First try to get existing stats
      const { data: existingStats, error: fetchError } = await this.supabase
        .from("flashcard_generation_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching generation stats:", fetchError);
        return;
      }

      if (existingStats) {
        // Update existing stats
        const { error: updateError } = await this.supabase
          .from("flashcard_generation_stats")
          .update({
            total_generated: existingStats.total_generated + generated,
            total_accepted_direct: existingStats.total_accepted_direct + acceptedDirect,
            total_accepted_edited: existingStats.total_accepted_edited + acceptedEdited,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error updating generation stats:", updateError);
        }
      } else {
        // Create new stats record
        const { error: insertError } = await this.supabase
          .from("flashcard_generation_stats")
          .insert({
            user_id: userId,
            total_generated: generated,
            total_accepted_direct: acceptedDirect,
            total_accepted_edited: acceptedEdited,
          });

        if (insertError) {
          console.error("Error creating generation stats:", insertError);
        }
      }
    } catch (error) {
      console.error("Error in updateGenerationStats:", error);
    }
  }

  /**
   * Clean up expired generation sessions
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [id, session] of generationSessions.entries()) {
      if (session.expiresAt < now) {
        generationSessions.delete(id);
      }
    }
  }

  /**
   * Generate flashcards from text using AI
   */
  async generateFlashcards(
    userId: string,
    request: GenerateFlashcardsRequest
  ): Promise<GenerateFlashcardsResponse> {
    try {
      // Check rate limit
      const rateCheck = this.checkRateLimit(userId);
      if (!rateCheck.allowed) {
        const resetDate = new Date(rateCheck.resetTime!);
        throw new Error(`Rate limit exceeded. Try again after ${resetDate.toISOString()}`);
      }

      // Validate foreign keys
      const isValidCollection = await this.validateCollection(userId, request.collection_id);
      if (!isValidCollection) {
        throw new Error(`Collection not found or does not belong to user: ${request.collection_id}`);
      }

      const isValidCategory = await this.validateCategory(userId, request.category_id);
      if (!isValidCategory) {
        throw new Error(`Category not found or does not belong to user: ${request.category_id}`);
      }

      // Check if OpenRouter is configured
      if (!this.openRouter.isConfigured()) {
        throw new Error("AI generation is not configured. Please contact administrator.");
      }

      console.log(`Generating flashcards for user ${userId}, text length: ${request.text.length}`);

      // Generate flashcards using OpenRouter
      const candidates = await this.openRouter.generateFlashcards(
        request.text,
        request.max_cards || 10
      );

      // Create generation session
      const generationId = crypto.randomUUID();
      const session: GenerationSession = {
        id: generationId,
        userId,
        candidates,
        originalText: request.text,
        maxCards: request.max_cards || 10,
        collectionId: request.collection_id,
        categoryId: request.category_id,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };

      generationSessions.set(generationId, session);

      // Update generation statistics
      await this.updateGenerationStats(userId, candidates.length);

      // Clean up expired sessions
      this.cleanupExpiredSessions();

      return {
        candidates,
        generation_id: generationId,
        text_length: request.text.length,
        max_cards: request.max_cards || 10,
      };

    } catch (error) {
      console.error("AIGenerationService.generateFlashcards error:", error);
      throw error;
    }
  }

  /**
   * Accept AI-generated flashcards
   */
  async acceptFlashcards(
    userId: string,
    generationId: string,
    request: AcceptFlashcardsRequest
  ): Promise<AcceptFlashcardsResponse> {
    try {
      // Get generation session
      const session = generationSessions.get(generationId);
      if (!session) {
        throw new Error("Generation session not found or expired");
      }

      if (session.userId !== userId) {
        throw new Error("Generation session does not belong to user");
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        generationSessions.delete(generationId);
        throw new Error("Generation session has expired");
      }

      // Validate foreign keys (they might have changed since generation)
      const isValidCollection = await this.validateCollection(userId, request.collection_id);
      if (!isValidCollection) {
        throw new Error(`Collection not found or does not belong to user: ${request.collection_id}`);
      }

      const isValidCategory = await this.validateCategory(userId, request.category_id);
      if (!isValidCategory) {
        throw new Error(`Category not found or does not belong to user: ${request.category_id}`);
      }

      // Prepare flashcards for bulk creation
      const flashcardsToCreate = request.accepted_cards.map(card => ({
        front: card.front,
        back: card.back,
        collection_id: request.collection_id,
        category_id: request.category_id,
        source: "ai_generated" as const,
      }));

      // Create flashcards in bulk
      const result = await this.flashcardsService.createFlashcardsBulk(
        userId,
        { flashcards: flashcardsToCreate }
      );

      // Update statistics
      const directCount = request.accepted_cards.filter(card => !card.edited).length;
      const editedCount = request.accepted_cards.filter(card => card.edited).length;
      
      await this.updateGenerationStats(userId, 0, directCount, editedCount);

      // Clean up session
      generationSessions.delete(generationId);

      return {
        created: result.created,
        flashcards: result.flashcards,
        stats_updated: true,
      };

    } catch (error) {
      console.error("AIGenerationService.acceptFlashcards error:", error);
      throw error;
    }
  }

  /**
   * Get generation session info (for debugging)
   */
  async getGenerationSession(userId: string, generationId: string): Promise<GenerationSession | null> {
    const session = generationSessions.get(generationId);
    if (!session || session.userId !== userId) {
      return null;
    }
    return session;
  }

  /**
   * Get user's current rate limit status
   */
  getRateLimitStatus(userId: string): { requests: number; limit: number; resetTime: number } {
    const userLimit = userRateLimit.get(userId);
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;

    if (!userLimit || now > userLimit.resetTime) {
      return { requests: 0, limit: 10, resetTime: now + hourInMs };
    }

    return { requests: userLimit.count, limit: 10, resetTime: userLimit.resetTime };
  }
} 