import React, { useState, useEffect } from "react";
import { CollectionsList } from "./CollectionsList";
import { AuthProvider } from "../auth/AuthProvider";

export const CollectionsListWrapper: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AuthProvider>
      <CollectionsList />
    </AuthProvider>
  );
};
