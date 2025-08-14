import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const getCollectionsMock = vi.fn();
vi.mock("@/lib/services/collections.service", () => ({
  CollectionsService: vi.fn().mockImplementation(() => ({
    getCollections: getCollectionsMock,
  })),
}));

describe("CollectionsList - empty state", () => {
  beforeEach(() => {
    getCollectionsMock.mockReset();
    vi.resetModules();
  });

  it("pokazuje pusty stan przy braku kolekcji", async () => {
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: false }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: false }) }));

    const { CollectionsList } = await import("../CollectionsList");

    getCollectionsMock.mockResolvedValueOnce({ data: [] });

    render(<CollectionsList />);

    expect(await screen.findByText("Brak kolekcji")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dodaj kolekcję" })).toHaveAttribute("href", "/dashboard/collections/new");
  });
});


