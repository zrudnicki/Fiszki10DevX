import React from "react";
import type { CollectionDTO } from "@/types/dto.types";
import { CollectionTableRow } from "./CollectionTableRow";

interface CollectionTableRowWrapperProps {
  collection: CollectionDTO;
  onDelete: (id: string) => void;
}

export const CollectionTableRowWrapper: React.FC<CollectionTableRowWrapperProps> = (props) => {
  return <CollectionTableRow {...props} />;
}; 