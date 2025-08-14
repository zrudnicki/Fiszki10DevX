import React, { useState, useEffect } from "react";
import { AIGenerateForm } from "./AIGenerateForm";
import { AuthProvider } from "../../lib/AuthContext";

export const AIGenerateFormWrapper: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AuthProvider>
      <AIGenerateForm />
    </AuthProvider>
  );
};
