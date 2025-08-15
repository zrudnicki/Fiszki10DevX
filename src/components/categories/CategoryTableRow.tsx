import React, { useState } from "react";
import type { CategoryDTO } from "@/types/dto.types";
import { CategoriesService } from "@/lib/services/categories.service";
import { supabase } from "@/db/supabase";
import { useAuth } from "../hooks/useAuth";

interface CategoryTableRowProps {
  category: CategoryDTO;
  onDelete: (id: string) => void;
}

export const CategoryTableRow: React.FC<CategoryTableRowProps> = ({ category, onDelete }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user?.id) return;
    if (!window.confirm("Czy na pewno chcesz usunąć tę kategorię?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const categoriesService = new CategoriesService(supabase);
      await categoriesService.deleteCategory(user.id, category.id);
      onDelete(category.id);
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Nie udało się usunąć kategorii. Spróbuj ponownie później.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-white">{category.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-300">{category.flashcard_count}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <a href={`/dashboard/categories/${category.id}/edit`} className="text-blue-400 hover:text-blue-300">
            Edytuj
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            {isDeleting ? "Usuwanie..." : "Usuń"}
          </button>
        </div>
      </td>
    </tr>
  );
};
