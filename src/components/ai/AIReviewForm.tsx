import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "@/db/supabase";
import type { FlashcardCandidate } from "@/types/dto.types";

interface AIReviewFormProps {
  generationId: string;
}

interface StoredFlashcards {
  generationId: string;
  flashcards: FlashcardCandidate[];
  collectionId: string;
  originalText: string;
}

interface BulkCreateFlashcardsRequest {
  flashcards: {
    front: string;
    back: string;
    collection_id: string;
    source: "ai_generated";
  }[];
}

export const AIReviewForm: React.FC<AIReviewFormProps> = ({ generationId }) => {
  const { user, loading: authLoading } = useAuth();
  const [flashcards, setFlashcards] = useState<FlashcardCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectionId, setCollectionId] = useState<string>("");
  const [originalText, setOriginalText] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) {
        return;
      }

      if (!user?.id) {
        setError("Musisz być zalogowany, aby przeglądać fiszki");
        return;
      }

      try {
        // Get flashcards from localStorage
        const storedData = localStorage.getItem("generatedFlashcards");
        if (!storedData) {
          throw new Error("Nie znaleziono wygenerowanych fiszek. Wróć do strony generowania i spróbuj ponownie.");
        }

        const data: StoredFlashcards = JSON.parse(storedData);
        console.log("Stored generationId:", data.generationId);
        console.log("Current generationId:", generationId);
        console.log("Are they equal?", data.generationId === generationId);

        // Verify generationId matches
        if (data.generationId !== generationId) {
          throw new Error("Nieprawidłowy identyfikator generowania. Wróć do strony generowania i spróbuj ponownie.");
        }

        setFlashcards(data.flashcards);
        setCollectionId(data.collectionId);
        setOriginalText(data.originalText);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Wystąpił nieoczekiwany błąd");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, generationId, authLoading]);

  const handleAccept = async () => {
    if (!user?.id) {
      setError("Musisz być zalogowany, aby zaakceptować fiszki");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Get session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sesja wygasła. Odśwież stronę i spróbuj ponownie.");
      }

      // Prepare flashcards for bulk creation
      const flashcardsToCreate = flashcards.map((card) => ({
        front: card.front,
        back: card.back,
        collection_id: collectionId,
        source: "ai_generated" as const,
      }));

      // Call bulk flashcards API with authentication
      const response = await fetch("/api/flashcards/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          flashcards: flashcardsToCreate,
        } as BulkCreateFlashcardsRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Nie udało się zapisać fiszek");
      }

      // Clear localStorage after successful acceptance
      localStorage.removeItem("generatedFlashcards");

      // Redirect to collection page
      window.location.href = `/dashboard/collections/${collectionId}`;
    } catch (error) {
      console.error("Failed to accept flashcards:", error);
      if (error instanceof Error) {
        setError(error.message);
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
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl max-w-md w-full">
          <h2 className="text-xl font-semibold mb-2 text-white">Wymagane logowanie</h2>
          <p className="mb-6 text-gray-200">Aby przeglądać i akceptować fiszki, musisz się zalogować.</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2 w-full"
          >
            Zaloguj się
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-200">Ładowanie fiszek...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-2 text-white">Błąd</h2>
          <p className="mb-6 text-gray-200">{error}</p>
          <a
            href="/dashboard/ai/generate"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2 w-full"
          >
            Wróć do generowania
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-white">Oryginalny tekst</h2>
          <p className="text-gray-200 whitespace-pre-wrap">{originalText}</p>
        </div>

        <div className="space-y-4">
          {flashcards.map((flashcard, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Pytanie</h3>
                  <p className="text-white">{flashcard.front}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Odpowiedź</h3>
                  <p className="text-white">{flashcard.back}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <a
            href="/dashboard/ai/generate"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white/10 text-white hover:bg-white/20 h-10 px-4 py-2"
          >
            Anuluj
          </a>
          <button
            onClick={handleAccept}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2"
          >
            {isSubmitting ? "Zapisywanie..." : "Zaakceptuj fiszki"}
          </button>
        </div>
      </div>
    </div>
  );
};
