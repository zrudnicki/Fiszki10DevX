import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/supabase";
import type {
  FlashcardDTO,
  FlashcardsListResponse,
  CreateFlashcardRequest,
  UpdateFlashcardRequest,
  BulkCreateFlashcardsRequest,
  BulkCreateFlashcardsResponse,
  PaginationParams,
} from "../../types/dto.types";
import { getInitialSpacedRepetitionParams } from "../utils/spaced-repetition";

// Database types
type DatabaseFlashcard = Database["public"]["Tables"]["flashcards"]["Row"];
type DatabaseFlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
type DatabaseFlashcardUpdate = Database["public"]["Tables"]["flashcards"]["Update"];

export class FlashcardsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get flashcards list with pagination and filtering
   */
  async getFlashcards(
    userId: string,
    params: PaginationParams & { collection_id?: string; category_id?: string }
  ): Promise<FlashcardsListResponse> {
    const { limit, offset, sort, order, collection_id, category_id } = params;

    try {
      // Build query
      let countQuery = this.supabase
        .from("flashcards")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      let dataQuery = this.supabase
        .from("flashcards")
        .select(`
          id,
          front,
          back,
          collection_id,
          category_id,
          source,
          easiness_factor,
          interval,
          repetitions,
          next_review_date,
          created_at,
          updated_at
        `)
        .eq("user_id", userId);

      // Apply filters
      if (collection_id) {
        countQuery = countQuery.eq("collection_id", collection_id);
        dataQuery = dataQuery.eq("collection_id", collection_id);
      }

      if (category_id) {
        countQuery = countQuery.eq("category_id", category_id);
        dataQuery = dataQuery.eq("category_id", category_id);
      }

      // Get total count
      const { count, error: countError } = await countQuery;

      if (countError) {
        throw new Error(`Failed to count flashcards: ${countError.message}`);
      }

      // Get data with pagination
      const { data, error } = await dataQuery
        .order(sort, { ascending: order === "asc" })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch flashcards: ${error.message}`);
      }

      // Transform data to DTOs
      const flashcards: FlashcardDTO[] = (data || []).map((flashcard) => ({
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        collection_id: flashcard.collection_id,
        category_id: flashcard.category_id,
        source: flashcard.source as "manual" | "ai_generated",
        easiness_factor: flashcard.easiness_factor,
        interval: flashcard.interval,
        repetitions: flashcard.repetitions,
        next_review_date: flashcard.next_review_date,
        created_at: flashcard.created_at,
        updated_at: flashcard.updated_at,
      }));

      return {
        data: flashcards,
        pagination: {
          total: count || 0,
          limit,
          offset,
        },
      };
    } catch (error) {
      console.error("FlashcardsService.getFlashcards error:", error);
      throw error;
    }
  }

  /**
   * Get single flashcard by ID
   */
  async getFlashcardById(userId: string, flashcardId: string): Promise<FlashcardDTO | null> {
    try {
      const { data, error } = await this.supabase
        .from("flashcards")
        .select(`
          id,
          front,
          back,
          collection_id,
          category_id,
          source,
          easiness_factor,
          interval,
          repetitions,
          next_review_date,
          created_at,
          updated_at
        `)
        .eq("user_id", userId)
        .eq("id", flashcardId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Flashcard not found
        }
        throw new Error(`Failed to fetch flashcard: ${error.message}`);
      }

      return {
        id: data.id,
        front: data.front,
        back: data.back,
        collection_id: data.collection_id,
        category_id: data.category_id,
        source: data.source as "manual" | "ai_generated",
        easiness_factor: data.easiness_factor,
        interval: data.interval,
        repetitions: data.repetitions,
        next_review_date: data.next_review_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error("FlashcardsService.getFlashcardById error:", error);
      throw error;
    }
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

    if (error || !data) {
      return false;
    }
    return true;
  }

  /**
   * Validate that category exists and belongs to user (optional)
   */
  private async validateCategory(userId: string, categoryId?: string): Promise<boolean> {
    if (!categoryId) return true; // Category is optional

    const { data, error } = await this.supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("id", categoryId)
      .single();

    if (error || !data) {
      return false;
    }
    return true;
  }

  /**
   * Create new flashcard
   */
  async createFlashcard(userId: string, request: CreateFlashcardRequest): Promise<FlashcardDTO> {
    try {
      // Validate foreign keys
      const isValidCollection = await this.validateCollection(userId, request.collection_id);
      if (!isValidCollection) {
        throw new Error(`Collection not found or does not belong to user: ${request.collection_id}`);
      }

      const isValidCategory = await this.validateCategory(userId, request.category_id);
      if (!isValidCategory) {
        throw new Error(`Category not found or does not belong to user: ${request.category_id}`);
      }

      // Get initial spaced repetition parameters
      const initialParams = getInitialSpacedRepetitionParams();

      const insertData: DatabaseFlashcardInsert = {
        user_id: userId,
        front: request.front,
        back: request.back,
        collection_id: request.collection_id,
        category_id: request.category_id || null,
        source: request.source || "manual",
        easiness_factor: initialParams.ease_factor,
        interval: initialParams.interval_days,
        repetitions: initialParams.repetition_count,
        next_review_date: new Date().toISOString(), // Available for review immediately
      };

      console.log("Attempting to insert flashcard:", insertData);

      const { data, error } = await this.supabase
        .from("flashcards")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(`Failed to create flashcard: ${error.message}`);
      }

      return {
        id: data.id,
        front: data.front,
        back: data.back,
        collection_id: data.collection_id,
        category_id: data.category_id,
        source: data.source as "manual" | "ai_generated",
        easiness_factor: data.easiness_factor,
        interval: data.interval,
        repetitions: data.repetitions,
        next_review_date: data.next_review_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error("FlashcardsService.createFlashcard error:", error);
      throw error;
    }
  }

  /**
   * Create multiple flashcards in bulk
   */
  async createFlashcardsBulk(
    userId: string,
    request: BulkCreateFlashcardsRequest
  ): Promise<BulkCreateFlashcardsResponse> {
    try {
      // Validate all foreign keys before bulk insert
      const uniqueCollectionIds = [...new Set(request.flashcards.map(f => f.collection_id))];
      const uniqueCategoryIds = [...new Set(request.flashcards.map(f => f.category_id).filter(Boolean))];

      // Validate collections
      for (const collectionId of uniqueCollectionIds) {
        const isValid = await this.validateCollection(userId, collectionId);
        if (!isValid) {
          throw new Error(`Collection not found or does not belong to user: ${collectionId}`);
        }
      }

      // Validate categories
      for (const categoryId of uniqueCategoryIds) {
        const isValid = await this.validateCategory(userId, categoryId);
        if (!isValid) {
          throw new Error(`Category not found or does not belong to user: ${categoryId}`);
        }
      }

      // Prepare insert data
      const insertData: DatabaseFlashcardInsert[] = request.flashcards.map(flashcard => {
        const initialParams = getInitialSpacedRepetitionParams();
        return {
          user_id: userId,
          front: flashcard.front,
          back: flashcard.back,
          collection_id: flashcard.collection_id,
          category_id: flashcard.category_id || null,
          source: flashcard.source || "manual",
          easiness_factor: initialParams.ease_factor,
          interval: initialParams.interval_days,
          repetitions: initialParams.repetition_count,
          next_review_date: new Date().toISOString(), // Available for review immediately
        };
      });

      console.log(`Attempting to bulk insert ${insertData.length} flashcards`);

      const { data, error } = await this.supabase
        .from("flashcards")
        .insert(insertData)
        .select();

      if (error) {
        console.error("Supabase bulk insert error:", error);
        throw new Error(`Failed to create flashcards: ${error.message}`);
      }

      const flashcards: FlashcardDTO[] = (data || []).map((flashcard) => ({
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        collection_id: flashcard.collection_id,
        category_id: flashcard.category_id,
        source: flashcard.source as "manual" | "ai_generated",
        easiness_factor: flashcard.easiness_factor,
        interval: flashcard.interval,
        repetitions: flashcard.repetitions,
        next_review_date: flashcard.next_review_date,
        created_at: flashcard.created_at,
        updated_at: flashcard.updated_at,
      }));

      return {
        created: flashcards.length,
        flashcards,
      };
    } catch (error) {
      console.error("FlashcardsService.createFlashcardsBulk error:", error);
      throw error;
    }
  }

  /**
   * Update existing flashcard
   */
  async updateFlashcard(
    userId: string,
    flashcardId: string,
    request: UpdateFlashcardRequest
  ): Promise<FlashcardDTO | null> {
    try {
      // First check if flashcard exists and belongs to user
      const existing = await this.getFlashcardById(userId, flashcardId);
      if (!existing) {
        return null;
      }

      // Validate foreign keys if they're being updated
      if (request.collection_id) {
        const isValid = await this.validateCollection(userId, request.collection_id);
        if (!isValid) {
          throw new Error(`Collection not found or does not belong to user: ${request.collection_id}`);
        }
      }

      if (request.category_id !== undefined) {
        const isValid = await this.validateCategory(userId, request.category_id);
        if (!isValid) {
          throw new Error(`Category not found or does not belong to user: ${request.category_id}`);
        }
      }

      const updateData: DatabaseFlashcardUpdate = {
        updated_at: new Date().toISOString(),
      };

      if (request.front !== undefined) updateData.front = request.front;
      if (request.back !== undefined) updateData.back = request.back;
      if (request.collection_id !== undefined) updateData.collection_id = request.collection_id;
      if (request.category_id !== undefined) updateData.category_id = request.category_id || null;

      const { data, error } = await this.supabase
        .from("flashcards")
        .update(updateData)
        .eq("user_id", userId)
        .eq("id", flashcardId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update flashcard: ${error.message}`);
      }

      return {
        id: data.id,
        front: data.front,
        back: data.back,
        collection_id: data.collection_id,
        category_id: data.category_id,
        source: data.source as "manual" | "ai_generated",
        easiness_factor: data.easiness_factor,
        interval: data.interval,
        repetitions: data.repetitions,
        next_review_date: data.next_review_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error("FlashcardsService.updateFlashcard error:", error);
      throw error;
    }
  }

  /**
   * Delete flashcard
   */
  async deleteFlashcard(userId: string, flashcardId: string): Promise<boolean> {
    try {
      // First check if flashcard exists and belongs to user
      const existing = await this.getFlashcardById(userId, flashcardId);
      if (!existing) {
        return false;
      }

      const { error } = await this.supabase
        .from("flashcards")
        .delete()
        .eq("user_id", userId)
        .eq("id", flashcardId);

      if (error) {
        throw new Error(`Failed to delete flashcard: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("FlashcardsService.deleteFlashcard error:", error);
      throw error;
    }
  }
} 