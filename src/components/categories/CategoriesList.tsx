import React, { useState, useCallback, useEffect } from "react";
import type { CategoryDTO } from "@/types/dto.types";
// import { toast } from "sonner"; // Uncomment if using toast notifications
import { CategoryTableRow } from "./CategoryTableRow";
import { CategoriesService } from "@/lib/services/categories.service";
import { supabase } from "@/db/supabase";
import { useAuth } from "../hooks/useAuth";

interface CategoriesListProps {
  initialCategories?: CategoryDTO[];
}

export const CategoriesList: React.FC<CategoriesListProps> = ({ initialCategories = [] }) => {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<CategoryDTO[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const categoriesService = new CategoriesService(supabase);
        const response = await categoriesService.getCategories(user.id, {
          limit: 50,
          offset: 0,
          sort: "created_at",
          order: "desc",
        });

        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [user]);

  const handleDelete = useCallback((id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white/10 rounded-lg p-8 shadow-md text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-white">Wymagane logowanie</h2>
          <p className="mb-6 text-gray-200">Aby zarządzać kategoriami, musisz się zalogować.</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-900 text-white hover:from-blue-700 hover:to-blue-950 h-10 px-4 py-2"
          >
            Zaloguj się
          </a>
        </div>
      </div>
    );
  }

  if (!categories?.length) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kategorie</h1>
          <a
            href="/dashboard/categories/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Nowa kategoria
          </a>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-white/10 rounded-lg p-8 shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2 text-white">Brak kategorii</h2>
            <p className="mb-4 text-gray-200">
              Nie masz jeszcze żadnych kategorii. Dodaj pierwszą, aby zacząć grupować fiszki!
            </p>
            <a
              href="/dashboard/categories/new"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Dodaj kategorię
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kategorie</h1>
        <a
          href="/dashboard/categories/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Nowa kategoria
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nazwa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fiszki</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white/5 divide-y divide-gray-700">
            {categories.map((category) => (
              <CategoryTableRow key={category.id} category={category} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
