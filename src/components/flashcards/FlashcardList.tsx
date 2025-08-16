import React, { useState, useEffect } from "react";
import { supabase } from "../../db/supabase";
import { useAuth } from "../hooks/useAuth";
import type { FlashcardDTO } from "../../types/dto.types";

export const FlashcardList: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchFlashcards = async () => {
      try {
        const { data, error } = await supabase
          .from("flashcards")
          .select(`id, front, back, collection_id, category_id, source, easiness_factor, interval, repetitions, next_review_date, created_at, updated_at`)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setFlashcards(data || []);
      } catch (err) {
        setError("Failed to load flashcards");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) return;

    try {
      const { error } = await supabase.from("flashcards").delete().eq("id", id);

      if (error) throw error;

      setFlashcards(flashcards.filter((flashcard) => flashcard.id !== id));
    } catch (err) {
      setError("Failed to delete flashcard");
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">You must be logged in to view flashcards</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Flashcards</h1>
          <a
            href="/dashboard/flashcards/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New Flashcard
          </a>
        </div>

        {flashcards.length === 0 ? (
          <div className="text-center text-white py-12">
            <p className="text-xl">No flashcards found. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {flashcards.map((flashcard) => (
              <div key={flashcard.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{flashcard.front}</h3>
                      <p className="mt-1 text-sm text-gray-500">{flashcard.back}</p>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`/dashboard/flashcards/${flashcard.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </a>
                      <button onClick={() => handleDelete(flashcard.id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span className="mr-4">Collection: {flashcard.collection_id}</span>
                    <span>Category: {flashcard.category_id || "None"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
