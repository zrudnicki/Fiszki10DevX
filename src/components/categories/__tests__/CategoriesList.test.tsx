import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import React from "react";

// Mock auth as logged-in
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, isLoading: false }),
}));
vi.mock("@/components/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, isLoading: false }),
}));

// Mock Supabase
vi.mock("@/db/supabase", () => ({
  supabase: {},
}));

// Mock CategoriesService
const getCategoriesMock = vi.fn();
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    getCategories: getCategoriesMock,
  })),
}));

describe("CategoriesList (SC-CAT-02)", () => {
  beforeEach(() => {
    getCategoriesMock.mockReset();
  });

  it("renders list of user's categories with counts", async () => {
    const { CategoriesList } = await import("../CategoriesList");

    getCategoriesMock.mockResolvedValueOnce({
      data: [
        { id: "c1", name: "Kategoria A", flashcard_count: 3, created_at: "", updated_at: "" },
        { id: "c2", name: "Kategoria B", flashcard_count: 0, created_at: "", updated_at: "" },
      ],
    });

    render(<CategoriesList />);

    await waitFor(() => {
      expect(screen.getByText("Kategoria A")).toBeInTheDocument();
      expect(screen.getByText("Kategoria B")).toBeInTheDocument();
    });

    // Validate counts present
    const rows = screen.getAllByRole("row");
    const bodyRows = rows.slice(1); // skip header
    const firstRow = bodyRows[0];
    const secondRow = bodyRows[1];
    expect(within(firstRow).getByText("3")).toBeInTheDocument();
    expect(within(secondRow).getByText("0")).toBeInTheDocument();

    // Service called with userId
    expect(getCategoriesMock).toHaveBeenCalledWith("user-1", expect.any(Object));
  });
});
