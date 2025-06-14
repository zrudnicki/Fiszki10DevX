import React, { useState, useEffect } from "react";
import { CollectionsList } from "./CollectionsList";
import { AuthProvider } from "@/lib/AuthContext";

interface CollectionsListWrapperProps {}

export const CollectionsListWrapper: React.FC<CollectionsListWrapperProps> = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <AuthProvider>
      <CollectionsList />
    </AuthProvider>
  );
};
