import React, { useState, useEffect } from "react";
import { AuthProvider } from "../../lib/AuthContext";
import { AIReviewForm } from "./AIReviewForm";

interface AIReviewFormWrapperProps {
  generationId: string | undefined;
}

export const AIReviewFormWrapper: React.FC<AIReviewFormWrapperProps> = ({ generationId }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (!generationId) {
    return (
      <div className="bg-white/5 rounded-lg p-8 shadow-md text-center">
        <h2 className="text-xl font-semibold mb-2 text-white">Błąd</h2>
        <p className="mb-6 text-gray-200">
          Nie znaleziono identyfikatora generowania. Wróć do strony generowania i spróbuj ponownie.
        </p>
        <a
          href="/dashboard/ai/generate"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2"
        >
          Wróć do generowania
        </a>
      </div>
    );
  }

  return (
    <AuthProvider>
      <AIReviewForm generationId={generationId} />
    </AuthProvider>
  );
};
