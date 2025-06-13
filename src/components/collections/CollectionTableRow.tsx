import React, { useState } from "react";
import type { CollectionDTO } from "@/types/dto.types";
import { CollectionsService } from "@/lib/services/collections.service";
import { supabase } from "@/db/supabase";
import { useAuth } from "../hooks/useAuth";

interface CollectionTableRowProps {
  collection: CollectionDTO;
  onDelete: (id: string) => void;
}

export const CollectionTableRow: React.FC<CollectionTableRowProps> = ({ collection, onDelete }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user?.id) return;

    if (!window.confirm("Czy na pewno chcesz usunąć tę kolekcję?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const collectionsService = new CollectionsService(supabase);
      const success = await collectionsService.deleteCollection(user.id, collection.id);
      if (success) {
        onDelete(collection.id);
      }
    } catch (error) {
      console.error("Failed to delete collection:", error);
      alert("Nie udało się usunąć kolekcji. Spróbuj ponownie później.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr className="hover:bg-white/10">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-white">{collection.name}</div>
        {collection.description && <div className="text-sm text-gray-300">{collection.description}</div>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-300">{collection.flashcard_count} fiszek</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <a href={`/dashboard/collections/${collection.id}/edit`} className="text-blue-400 hover:text-blue-300">
            Edytuj
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Usuwanie..." : "Usuń"}
          </button>
        </div>
      </td>
    </tr>
  );
};
