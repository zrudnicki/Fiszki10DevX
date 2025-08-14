import React, { useState, useEffect } from "react";
import { CollectionForm } from "./CollectionForm";
import { AuthProvider } from "../../lib/AuthContext";

interface CollectionFormWrapperProps {
  collectionId?: string;
}

export const CollectionFormWrapper: React.FC<CollectionFormWrapperProps> = ({ collectionId }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AuthProvider>
      <CollectionForm collectionId={collectionId} />
    </AuthProvider>
  );
};
