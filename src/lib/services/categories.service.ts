import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/supabase";
import type {
  CategoryDTO,
  CategoriesListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginationParams,
} from "../../types/dto.types";

// Database types
type DatabaseCategory = Database["public"]["Tables"]["categories"]["Row"];
type DatabaseCategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type DatabaseCategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export class CategoriesService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get categories list with pagination
   */
  async getCategories(userId: string, params: PaginationParams): Promise<CategoriesListResponse> {
    const { limit, offset, sort, order } = params;

    try {
      // Get total count
      const { count, error: countError } = await this.supabase
        .from("categories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) {
        throw new Error(`Failed to count categories: ${countError.message}`);
      }

      // Get categories without flashcard count for now (to avoid relationship issues)
      const query = this.supabase
        .from("categories")
        .select(
          `
          id,
          name,
          created_at,
          updated_at
        `
        )
        .eq("user_id", userId)
        .order(sort, { ascending: order === "asc" })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      // Transform data to DTOs (set flashcard_count to 0 for now)
      const categories: CategoryDTO[] = (data || []).map((category) => ({
        id: category.id,
        name: category.name,
        flashcard_count: 0, // TODO: Implement flashcard counting when flashcards table is ready
        created_at: category.created_at,
        updated_at: category.updated_at,
      }));

      return {
        data: categories,
        pagination: {
          total: count || 0,
          limit,
          offset,
        },
      };
    } catch (error) {
      console.error("CategoriesService.getCategories error:", error);
      throw error;
    }
  }

  /**
   * Get single category by ID
   */
  async getCategoryById(userId: string, categoryId: string): Promise<CategoryDTO | null> {
    try {
      const { data, error } = await this.supabase
        .from("categories")
        .select(
          `
          id,
          name,
          created_at,
          updated_at
        `
        )
        .eq("user_id", userId)
        .eq("id", categoryId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Category not found
        }
        throw new Error(`Failed to fetch category: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        flashcard_count: 0, // TODO: Implement flashcard counting when flashcards table is ready
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error("CategoriesService.getCategoryById error:", error);
      throw error;
    }
  }

  /**
   * Create new category
   */
  async createCategory(userId: string, request: CreateCategoryRequest): Promise<CategoryDTO> {
    try {
      const insertData: DatabaseCategoryInsert = {
        user_id: userId,
        name: request.name,
      };

      console.log("Attempting to insert category:", insertData);
      console.log("Using user ID:", userId);

      const { data, error } = await this.supabase.from("categories").insert(insertData).select().single();

      if (error) {
        console.error("Supabase insert error:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(`Failed to create category: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        flashcard_count: 0, // New category has no flashcards
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error("CategoriesService.createCategory error:", error);
      throw error;
    }
  }

  /**
   * Update existing category
   */
  async updateCategory(
    userId: string,
    categoryId: string,
    request: UpdateCategoryRequest
  ): Promise<CategoryDTO | null> {
    try {
      // First check if category exists and belongs to user
      const existing = await this.getCategoryById(userId, categoryId);
      if (!existing) {
        return null;
      }

      const updateData: DatabaseCategoryUpdate = {
        updated_at: new Date().toISOString(),
      };

      if (request.name !== undefined) {
        updateData.name = request.name;
      }
      // Categories table doesn't have description column, skip it

      const { data, error } = await this.supabase
        .from("categories")
        .update(updateData)
        .eq("user_id", userId)
        .eq("id", categoryId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update category: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        flashcard_count: existing.flashcard_count, // Keep existing count
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error("CategoriesService.updateCategory error:", error);
      throw error;
    }
  }

  /**
   * Delete category (sets flashcards category_id to NULL)
   */
  async deleteCategory(userId: string, categoryId: string): Promise<boolean> {
    try {
      // First check if category exists and belongs to user
      const existing = await this.getCategoryById(userId, categoryId);
      if (!existing) {
        return false;
      }

      // TODO: Update flashcards to set category_id to NULL when flashcards table is ready
      // For now, just delete the category directly

      const { error } = await this.supabase.from("categories").delete().eq("user_id", userId).eq("id", categoryId);

      if (error) {
        throw new Error(`Failed to delete category: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("CategoriesService.deleteCategory error:", error);
      throw error;
    }
  }
}
 