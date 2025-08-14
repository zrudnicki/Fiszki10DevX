import React, { useState, useEffect } from "react";
import type { CollectionDTO } from "@/types/dto.types";
import { CollectionsService } from "@/lib/services/collections.service";
import { supabase } from "@/db/supabase";
import { useAuth } from "../hooks/useAuth";

interface CollectionFormProps {
  collectionId?: string;
}

export const CollectionForm: React.FC<CollectionFormProps> = ({ collectionId }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<CollectionDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!user?.id || !collectionId) {
        setIsLoading(false);
        return;
      }

      try {
        const collectionsService = new CollectionsService(supabase);
        const fetchedCollection = await collectionsService.getCollectionById(user.id, collectionId);
        setCollection(fetchedCollection);
      } catch (error) {
        console.error("Failed to fetch collection:", error);
        setError("Nie udało się pobrać danych kolekcji. Spróbuj ponownie.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [user, collectionId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    setIsSubmitting(true);
    setError(null);

    try {
      const collectionsService = new CollectionsService(supabase);
      if (collection) {
        await collectionsService.updateCollection(user.id, collection.id, {
          name,
          description,
        });
      } else {
        await collectionsService.createCollection(user.id, {
          name,
          description,
        });
      }
      window.location.href = "/dashboard/collections";
    } catch (error) {
      console.error("Failed to save collection:", error);
      setError("Nie udało się zapisać kolekcji. Spróbuj ponownie później.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white/5 rounded-lg p-8 shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2 text-white">Wymagane logowanie</h2>
            <p className="mb-6 text-gray-200">Aby zarządzać kolekcjami, musisz się zalogować.</p>
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

  if (collectionId && !collection) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white/10 rounded-lg p-8 shadow-md text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-white">Błąd</h2>
          <p className="mb-6 text-gray-200">Nie znaleziono kolekcji.</p>
          <a
            href="/dashboard/collections"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Wróć do listy kolekcji
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">{collection ? "Edytuj kolekcję" : "Nowa kolekcja"}</h1>
        </div>
        <div className="bg-white/5 rounded-lg p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-200">{error}</div>}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                Nazwa kolekcji
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2 bg-white/5 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Wprowadź nazwę kolekcji"
                defaultValue={collection?.name}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
                Opis (opcjonalnie)
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Wprowadź opis kolekcji"
                defaultValue={collection?.description}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <a
                href="/dashboard/collections"
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
