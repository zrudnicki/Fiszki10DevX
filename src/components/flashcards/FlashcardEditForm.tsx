import React, { useState, useEffect } from "react";
import { supabase } from "../../db/supabase";
import type { CollectionDTO, CategoryDTO } from "../../types/dto.types";
import { useAuth } from "../hooks/useAuth";

interface FlashcardEditFormProps {
  flashcardId: string;
}

export const FlashcardEditForm: React.FC<FlashcardEditFormProps> = ({ flashcardId }) => {
  const { user, loading: authLoading } = useAuth();
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch flashcard data
        const { data: flashcardData, error: flashcardError } = await supabase
          .from("flashcards")
          .select("*")
          .eq("id", flashcardId)
          .single();

        if (flashcardError) throw flashcardError;

        if (flashcardData) {
          setSelectedCollection(flashcardData.collection_id);
          setSelectedCategory(flashcardData.category_id || "");
          setQuestion(flashcardData.front);
          setAnswer(flashcardData.back);
        }

        // Fetch collections
        const { data: collectionsData, error: collectionsError } = await supabase
          .from("collections")
          .select("*")
          .eq("user_id", user.id);

        if (collectionsError) throw collectionsError;
        setCollections(
          (collectionsData || []).map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            flashcard_count: 0,
            created_at: c.created_at,
            updated_at: c.updated_at,
          }))
        );

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id);

        if (categoriesError) throw categoriesError;
        setCategories(
          (categoriesData || []).map((c) => ({
            id: c.id,
            name: c.name,
            flashcard_count: 0,
            created_at: c.created_at,
            updated_at: c.updated_at,
          }))
        );
      } catch (err) {
        setError("Failed to load flashcard data");
        console.error(err);
      }
    };

    fetchData();
  }, [user, flashcardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("flashcards")
        .update({
          collection_id: selectedCollection,
          category_id: selectedCategory,
          front: question,
          back: answer,
          updated_at: new Date().toISOString(),
        })
        .eq("id", flashcardId);

      if (updateError) throw updateError;

      // Redirect to flashcards list
      window.location.href = "/dashboard/flashcards";
    } catch (err) {
      setError("Failed to update flashcard");
      console.error(err);
    } finally {
      setLoading(false);
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
          <span className="block sm:inline">You must be logged in to edit flashcards</span>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Edit Flashcard</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="collection" className="block text-sm font-medium text-gray-700">
                Collection
              </label>
              <select
                id="collection"
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select a collection</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                Question
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
                Answer
              </label>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
