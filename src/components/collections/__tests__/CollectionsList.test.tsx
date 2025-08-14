import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import React from "react";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const getCollectionsMock = vi.fn();
vi.mock("@/lib/services/collections.service", () => ({
  CollectionsService: vi.fn().mockImplementation(() => ({
    getCollections: getCollectionsMock,
  })),
}));

describe("CollectionsList - happy path", () => {
  beforeEach(() => {
    getCollectionsMock.mockReset();
    vi.resetModules();
  });

  it("renders list of user's collections with counts", async () => {
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: false }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: false }) }));

    const { CollectionsList } = await import("../CollectionsList");

    getCollectionsMock.mockResolvedValueOnce({
      data: [
        { id: "col1", name: "Kolekcja A", description: "", flashcard_count: 3, created_at: "", updated_at: "" },
        { id: "col2", name: "Kolekcja B", description: "", flashcard_count: 0, created_at: "", updated_at: "" },
      ],
    });

    render(<CollectionsList />);

    await waitFor(() => {
      expect(screen.getByText("Kolekcja A")).toBeInTheDocument();
      expect(screen.getByText("Kolekcja B")).toBeInTheDocument();
    });

    const rows = screen.getAllByRole("row");
    const bodyRows = rows.slice(1);
    const firstRow = bodyRows[0];
    const secondRow = bodyRows[1];
    expect(within(firstRow).getByText("3 fiszek")).toBeInTheDocument();
    expect(within(secondRow).getByText("0 fiszek")).toBeInTheDocument();

    expect(getCollectionsMock).toHaveBeenCalledWith("user-1", expect.any(Object));
  });
});
