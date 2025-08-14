import React, { useState, useCallback, useEffect } from "react";
import type { CollectionDTO } from "@/types/dto.types";
import { CollectionTableRowWrapper } from "./CollectionTableRowWrapper";
import { CollectionsService } from "@/lib/services/collections.service";
import { supabase } from "@/db/supabase";
import { useAuth } from "../hooks/useAuth";

export const CollectionsList: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const collectionsService = new CollectionsService(supabase);
        const response = await collectionsService.getCollections(user.id, {
          limit: 50,
          offset: 0,
          sort: "created_at",
          order: "desc",
        });

        setCollections(response.data);
      } catch (error) {
        console.error("Failed to fetch collections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, [user]);

  const handleDelete = useCallback((id: string) => {
    setCollections((prev) => prev.filter((col) => col.id !== id));
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
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

  if (!collections?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Kolekcje</h1>
            <a
              href="/dashboard/collections/new"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2"
            >
              Nowa kolekcja
            </a>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-white/5 rounded-lg p-8 shadow-md text-center">
              <h2 className="text-xl font-semibold mb-2 text-white">Brak kolekcji</h2>
              <p className="mb-4 text-gray-200">
                Nie masz jeszcze żadnych kolekcji. Dodaj pierwszą, aby zacząć grupować fiszki!
              </p>
              <a
                href="/dashboard/collections/new"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2"
              >
                Dodaj kolekcję
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Kolekcje</h1>
          <a
            href="/dashboard/collections/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2"
          >
            Nowa kolekcja
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nazwa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Fiszki
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-gray-700">
              {collections.map((collection) => (
                <CollectionTableRowWrapper key={collection.id} collection={collection} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
