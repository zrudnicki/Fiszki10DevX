import type { SupabaseClient } from "../../db/supabase";
import type { Database } from "../../db/database.types";
import type { GenerateFlashcardsRequest, FlashcardCandidate } from "../../types/dto.types";

export class GenerateService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get generated flashcards by generation ID
   */
  async getFlashcards(generationId: string): Promise<Response> {
    try {
      // Get the session token
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      return await fetch(`/api/generate/flashcards/${generationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    } catch (error) {
      console.error("GenerateService.getFlashcards error:", error);
      throw error;
    }
  }

  /**
   * Generate flashcards from text and return generation ID
   */
  async generateFlashcards(
    userId: string,
    request: GenerateFlashcardsRequest
  ): Promise<{ generationId: string; candidates: FlashcardCandidate[] }> {
    try {
      // Get the session token
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/generate/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          text: request.text,
          user_id: userId,
          collection_id: request.collection_id,
          category_id: request.category_id,
          max_cards: request.max_cards,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate flashcards");
      }

      const data = await response.json();
      return {
        generationId: data.generation_id,
        candidates: data.candidates,
      };
    } catch (error) {
      console.error("GenerateService.generateFlashcards error:", error);
      throw error;
    }
  }

  /**
   * Accept and save generated flashcards
   */
  async acceptFlashcards(generationId: string, collectionId: string, categoryId: string): Promise<Response> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      return await fetch(`/api/generate/flashcards/${generationId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          collection_id: collectionId,
          category_id: categoryId,
        }),
      });
    } catch (error) {
      console.error("GenerateService.acceptFlashcards error:", error);
      throw error;
    }
  }
}
