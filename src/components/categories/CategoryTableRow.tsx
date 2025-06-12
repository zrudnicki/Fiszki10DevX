import React, { useState } from "react";
import type { CategoryDTO } from "@/types/dto.types";

interface CategoryTableRowProps {
  category: CategoryDTO;
  onDelete: (id: string) => void;
}

export const CategoryTableRow: React.FC<CategoryTableRowProps> = ({ category, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete(category.id);
        setShowConfirm(false);
      } else {
        // TODO: show toast error
        alert("Nie udało się usunąć kategorii.");
      }
    } catch (e) {
      // TODO: show toast error
      alert("Wystąpił błąd podczas usuwania.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
        {category.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
        {category.flashcard_count}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <a
          href={`/dashboard/categories/${category.id}/edit`}
          className="text-indigo-400 hover:text-indigo-200 mr-2"
        >
          Edytuj
        </a>
        <button
          className="text-red-400 hover:text-red-200"
          onClick={() => setShowConfirm(true)}
        >
          Usuń
        </button>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg text-gray-900">
              <p>Czy na pewno chcesz usunąć tę kategorię?</p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                >
                  Anuluj
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Usuwanie..." : "Usuń"}
                </button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}; 