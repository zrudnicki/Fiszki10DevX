import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { GenerateService } from "@/lib/services/generate.service";
import { CollectionsService } from "@/lib/services/collections.service";
import { CategoriesService } from "@/lib/services/categories.service";
import { supabase } from "@/db/supabase";
import type { CollectionDTO, CategoryDTO } from "@/types/dto.types";

export const GenerateForm: React.FC = () => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [maxCards, setMaxCards] = useState(10);
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!user?.id) return;

      try {
        const collectionsService = new CollectionsService(supabase);
        const response = await collectionsService.getCollections(user.id, {
          limit: 50,
          offset: 0,
          sort: "created_at",
          order: "desc",
        });

        setCollections(response.data);
        if (response.data.length > 0) {
          setSelectedCollectionId(response.data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch collections:", error);
        setError("Nie udało się pobrać kolekcji. Odśwież stronę i spróbuj ponownie.");
      }
    };

    fetchCollections();
  }, [user]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.id || !selectedCollectionId) return;

      try {
        const categoriesService = new CategoriesService(supabase);
        const response = await categoriesService.getCategories(user.id, selectedCollectionId, {
          limit: 50,
          offset: 0,
          sort: "created_at",
          order: "desc",
        });

        setCategories(response.data);
        if (response.data.length > 0) {
          setSelectedCategoryId(response.data[0].id);
        } else {
          setSelectedCategoryId("");
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setError("Nie udało się pobrać kategorii. Odśwież stronę i spróbuj ponownie.");
      }
    };

    fetchCategories();
  }, [user, selectedCollectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError("Musisz być zalogowany, aby generować fiszki");
      return;
    }

    if (!selectedCollectionId) {
      setError("Wybierz kolekcję, do której chcesz dodać fiszki");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const generateService = new GenerateService(supabase);
      const { generationId } = await generateService.generateFlashcards(user.id, {
        text,
        max_cards: maxCards,
        collection_id: selectedCollectionId,
        category_id: selectedCategoryId || undefined,
      });

      // Redirect to review page
      window.location.href = `/dashboard/ai/review/${generationId}`;
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      setError("Nie udało się wygenerować fiszek. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white/5 rounded-lg p-8 shadow-md text-center">
        <h2 className="text-xl font-semibold mb-2 text-white">Wymagane logowanie</h2>
        <p className="mb-6 text-gray-200">Aby generować fiszki, musisz się zalogować.</p>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2"
        >
          Zaloguj się
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="collection" className="block text-sm font-medium text-gray-200 mb-2">
          Wybierz kolekcję
        </label>
        <select
          id="collection"
          value={selectedCollectionId}
          onChange={(e) => setSelectedCollectionId(e.target.value)}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Wybierz kolekcję...</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCollectionId && (
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-200 mb-2">
            Wybierz kategorię (opcjonalnie)
          </label>
          <select
            id="category"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Bez kategorii</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-200 mb-2">
          Wklej tekst do wygenerowania fiszek
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-48 px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszki..."
          required
        />
      </div>

      <div>
        <label htmlFor="maxCards" className="block text-sm font-medium text-gray-200 mb-2">
          Maksymalna liczba fiszek
        </label>
        <input
          type="number"
          id="maxCards"
          value={maxCards}
          onChange={(e) => setMaxCards(parseInt(e.target.value))}
          min="1"
          max="50"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {error && <p className="text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2"
      >
        {isLoading ? "Generowanie..." : "Generuj fiszki"}
      </button>
    </form>
  );
};
