import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const getByIdMock = vi.fn();
const updateCategoryMock = vi.fn();
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    getCategoryById: getByIdMock,
    updateCategory: updateCategoryMock,
  })),
}));

describe("CategoryEdit - get error", () => {
  it("pokazuje ekran błędu gdy pobranie kategorii nie powiedzie się", async () => {
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" } }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" } }) }));

    const { CategoryEdit } = await import("../CategoryEdit");

    getByIdMock.mockRejectedValueOnce(new Error("get failed"));

    render(<CategoryEdit categoryId="cat-1" />);

    expect(await screen.findByText("Błąd")).toBeInTheDocument();
    expect(screen.getByText("Nie znaleziono kategorii.")).toBeInTheDocument();
  });
});
