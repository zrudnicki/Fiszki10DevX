import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { CategoriesService } from "@/lib/services/categories.service";
import { supabase } from "@/db/supabase";

export const CategoryNew: React.FC = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) {
      setError("Musisz być zalogowany, aby utworzyć kategorię");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    try {
      const categoriesService = new CategoriesService(supabase);
      await categoriesService.createCategory({
        name,
        user_id: user.id,
      });

      // Redirect to categories list on success
      window.location.href = "/dashboard/categories";
    } catch (error) {
      console.error("Failed to create category:", error);
      setError("Wystąpił błąd podczas tworzenia kategorii. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white/10 rounded-lg p-8 shadow-md text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-white">Wymagane logowanie</h2>
          <p className="mb-6 text-gray-200">Aby utworzyć kategorię, musisz się zalogować.</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Zaloguj się
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nowa kategoria</h1>
      </div>
      <div className="bg-white/10 rounded-lg p-8 shadow-md">
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
              className="w-full px-4 py-2 bg-white/5 border border-gray-600 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Wprowadź nazwę kategorii"
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
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {isSubmitting ? "Tworzenie..." : "Utwórz kategorię"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
