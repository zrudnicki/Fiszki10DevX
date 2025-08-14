import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { CategoriesService } from "@/lib/services/categories.service";
import { supabase } from "@/db/supabase";
import type { CategoryDTO } from "@/types/dto.types";

interface CategoryEditProps {
  categoryId: string;
}

export const CategoryEdit: React.FC<CategoryEditProps> = ({ categoryId }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const categoriesService = new CategoriesService(supabase);
        const fetchedCategory = await categoriesService.getCategoryById(user.id, categoryId);
        setCategory(fetchedCategory);
      } catch (error) {
        console.error("Failed to fetch category:", error);
        setError("Nie udało się pobrać danych kategorii. Spróbuj ponownie.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [user, categoryId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id || !category) {
      setError("Musisz być zalogowany, aby edytować kategorię");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    try {
      const categoriesService = new CategoriesService(supabase);
      await categoriesService.updateCategory(user.id, category.id, {
        name,
      });

      // Redirect to categories list on success
      window.location.href = "/dashboard/categories";
    } catch (error) {
      console.error("Failed to update category:", error);
      setError("Wystąpił błąd podczas aktualizacji kategorii. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white/5 rounded-lg p-8 shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2 text-white">Wymagane logowanie</h2>
            <p className="mb-6 text-gray-200">Aby edytować kategorię, musisz się zalogować.</p>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2"
            >
              Zaloguj się
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white/10 rounded-lg p-8 shadow-md text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-white">Błąd</h2>
          <p className="mb-6 text-gray-200">Nie znaleziono kategorii.</p>
          <a
            href="/dashboard/categories"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Wróć do listy kategorii
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Edytuj kategorię</h1>
        </div>
        <div className="bg-white/5 rounded-lg p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-200">{error}</div>}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                Nazwa kategorii
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2 bg-white/5 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Wprowadź nazwę kategorii"
                defaultValue={category?.name}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <a
                href="/dashboard/categories"
                className="px-4 py-2 text-sm font-medium text-gray-200 hover:text-white transition-colors"
              >
                Anuluj
              </a>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2"
              >
                {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
