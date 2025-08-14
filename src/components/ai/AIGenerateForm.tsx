import React, { useState, useEffect } from "react";
import { GenerateService } from "@/lib/services/generate.service";
import { CollectionsService } from "@/lib/services/collections.service";
import { supabase } from "@/db/supabase";
import { useAuth } from "../hooks/useAuth";
import { z } from "zod";
import type { CollectionDTO } from "@/types/dto.types";

const textSchema = z
  .string()
  .min(1000, "Tekst musi mieć minimum 1000 znaków")
  .max(10000, "Tekst nie może przekraczać 10000 znaków");

export const AIGenerateForm: React.FC = () => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);

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
        setError("Nie udało się pobrać listy kolekcji");
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchCollections();
  }, [user]);

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
      setError(null);
      setIsSubmitting(true);

      // Validate text
      const validationResult = textSchema.safeParse(text);
      if (!validationResult.success) {
        setError(validationResult.error.errors[0].message);
        return;
      }

      // Generate flashcards
      const generateService = new GenerateService(supabase);
      const response = await generateService.generateFlashcards(user.id, {
        text,
        collection_id: selectedCollectionId,
      });

      console.log("Generate response:", response);
      console.log("Generation ID:", response.generationId);

      if (!response.generationId) {
        throw new Error("Nie otrzymano identyfikatora generowania");
      }

      // Store generated flashcards in localStorage
      localStorage.setItem(
        "generatedFlashcards",
        JSON.stringify({
          generationId: response.generationId,
          flashcards: response.candidates,
          collectionId: selectedCollectionId,
          originalText: text,
        })
      );

      // Navigate to review page
      window.location.href = `/dashboard/ai/review/${response.generationId}`;
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      if (error instanceof Error) {
        if (error.message === "Authentication required") {
          setError("Sesja wygasła. Odśwież stronę i spróbuj ponownie.");
        } else {
          setError(error.message);
        }
      } else {
        setError("Wystąpił nieoczekiwany błąd");
      }
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
            <p className="mb-6 text-gray-200">Aby generować fiszki, musisz się zalogować.</p>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white/5 rounded-lg p-8 shadow-md">
          <h1 className="text-2xl font-bold mb-2 text-white">Wygeneruj fiszki z tekstu</h1>
          <p className="mb-6 text-gray-300">
            Wklej tekst, z którego chcesz wygenerować fiszki. Tekst powinien mieć od 1000 do 10000 znaków.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="collection" className="block text-sm font-medium text-gray-300 mb-2">
                Kolekcja
              </label>
              <select
                id="collection"
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                disabled={isLoadingCollections}
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {isLoadingCollections ? (
                  <option value="">Ładowanie kolekcji...</option>
                ) : collections.length === 0 ? (
                  <option value="">Brak kolekcji</option>
                ) : (
                  collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-300 mb-2">
                Tekst źródłowy
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Wklej tutaj tekst..."
              />
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingCollections || collections.length === 0}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2"
              >
                {isSubmitting ? "Generowanie..." : "Generuj"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
