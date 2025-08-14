import React, { useState, useEffect } from "react";
import { CollectionsList } from "./CollectionsList";
import { AuthProvider } from "@/lib/AuthContext";

// Using a type alias for an object to avoid empty interface rule

type CollectionsListWrapperProps = object;

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
