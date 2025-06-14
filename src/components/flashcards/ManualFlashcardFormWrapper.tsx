import React, { useEffect, useState } from "react";
import { ManualFlashcardForm } from "./ManualFlashcardForm";
import { AuthProvider } from "../../lib/AuthContext";

export const ManualFlashcardFormWrapper: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ManualFlashcardForm />
    </AuthProvider>
  );
};
