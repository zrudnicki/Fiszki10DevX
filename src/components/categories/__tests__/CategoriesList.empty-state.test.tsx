import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const getCategoriesMock = vi.fn();
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    getCategories: getCategoriesMock,
  })),
}));

describe("CategoriesList - empty state", () => {
  beforeEach(() => {
    getCategoriesMock.mockReset();
    vi.resetModules();
  });

  it("pokazuje pusty stan przy braku kategorii", async () => {
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: false }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: false }) }));

    const { CategoriesList } = await import("../CategoriesList");

    getCategoriesMock.mockResolvedValueOnce({ data: [] });

    render(<CategoriesList />);

    expect(await screen.findByText("Brak kategorii")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dodaj kategorię" })).toHaveAttribute("href", "/dashboard/categories/new");
  });
});



