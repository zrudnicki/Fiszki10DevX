import type { SupabaseClient } from "../../db/supabase";
import type { Database } from "../../db/database.types";
import type {
  CollectionDTO,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  CollectionsListResponse,
  PaginationParams,
} from "../../types/dto.types";

type DatabaseCollectionInsert = Database["public"]["Tables"]["collections"]["Insert"];
type DatabaseCollectionUpdate = Database["public"]["Tables"]["collections"]["Update"];

export class CollectionsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all collections for authenticated user with pagination
   */
  async getCollections(userId: string, params: PaginationParams): Promise<CollectionsListResponse> {
    const { limit, offset, sort, order } = params;

    try {
      // Get total count
      const { count, error: countError } = await this.supabase
        .from("collections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) {
        throw new Error(`Failed to count collections: ${countError.message}`);
      }

      // Get collections with flashcard count
      const query = this.supabase
        .from("collections")
        .select(
          `
          id,
          name,
          description,
          created_at,
          updated_at,
          flashcards:flashcards(count)
        `
        )
        .eq("user_id", userId)
        .order(sort, { ascending: order === "asc" })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch collections: ${error.message}`);
      }

      // Transform data to DTOs
      const collections: CollectionDTO[] = (data || []).map((collection: any) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        flashcard_count: collection.flashcards?.[0]?.count || 0,
        created_at: collection.created_at,
        updated_at: collection.updated_at,
      }));

      return {
        data: collections,
        pagination: {
          total: count || 0,
          limit,
          offset,
        },
      };
    } catch (error) {
      console.error("CollectionsService.getCollections error:", error);
      throw error;
    }
  }

  /**
   * Get single collection by ID
   */
  async getCollectionById(userId: string, collectionId: string): Promise<CollectionDTO | null> {
    try {
      const { data, error } = await this.supabase
        .from("collections")
        .select(
          `
          id,
          name,
          description,
          created_at,
          updated_at,
          flashcards:flashcards(count)
        `
        )
        .eq("user_id", userId)
        .eq("id", collectionId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Collection not found
        }
        throw new Error(`Failed to fetch collection: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        flashcard_count: data.flashcards?.[0]?.count || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error("CollectionsService.getCollectionById error:", error);
      throw error;
    }
  }

  /**
   * Create new collection
   */
  async createCollection(userId: string, request: CreateCollectionRequest): Promise<CollectionDTO> {
    try {
      const insertData: DatabaseCollectionInsert = {
        user_id: userId,
        name: request.name,
        description: request.description || null,
      };

      console.log("Attempting to insert collection:", insertData);
      console.log("Using user ID:", userId);

      const { data, error } = await this.supabase.from("collections").insert(insertData).select().single();

      if (error) {
        console.error("Supabase insert error:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(`Failed to create collection: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        flashcard_count: 0, // New collection has no flashcards
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error("CollectionsService.createCollection error:", error);
      throw error;
    }
  }

  /**
   * Update existing collection
   */
  async updateCollection(
    userId: string,
    collectionId: string,
    request: UpdateCollectionRequest
  ): Promise<CollectionDTO | null> {
    try {
      // First check if collection exists and belongs to user
      const existing = await this.getCollectionById(userId, collectionId);
      if (!existing) {
        return null;
      }

      const updateData: DatabaseCollectionUpdate = {
        updated_at: new Date().toISOString(),
      };

      if (request.name !== undefined) {
        updateData.name = request.name;
      }
      if (request.description !== undefined) {
        updateData.description = request.description;
      }

      const { data, error } = await this.supabase
        .from("collections")
        .update(updateData)
        .eq("user_id", userId)
        .eq("id", collectionId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update collection: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        flashcard_count: existing.flashcard_count, // Keep existing count
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error("CollectionsService.updateCollection error:", error);
      throw error;
    }
  }

  /**
   * Delete collection (sets flashcards collection_id to NULL)
   */
  async deleteCollection(userId: string, collectionId: string): Promise<boolean> {
    try {
      // First check if collection exists and belongs to user
      const existing = await this.getCollectionById(userId, collectionId);
      if (!existing) {
        return false;
      }

      const { error } = await this.supabase.from("collections").delete().eq("user_id", userId).eq("id", collectionId);

      if (error) {
        throw new Error(`Failed to delete collection: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("CollectionsService.deleteCollection error:", error);
      throw error;
    }
  }
}
