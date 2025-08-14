import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const getCategoriesMock = vi.fn();
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    getCategories: getCategoriesMock,
  })),
}));

describe("CategoriesList - fetch error", () => {
  beforeEach(() => {
    getCategoriesMock.mockReset();
    vi.resetModules();
  });

  it("loguje błąd i pokazuje pusty stan przy błędzie serwisu", async () => {
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: false }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: false }) }));

    const { CategoriesList } = await import("../CategoriesList");

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => void 0);
    getCategoriesMock.mockRejectedValueOnce(new Error("get failed"));

    render(<CategoriesList />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(await screen.findByText("Brak kategorii")).toBeInTheDocument();
  });
});
