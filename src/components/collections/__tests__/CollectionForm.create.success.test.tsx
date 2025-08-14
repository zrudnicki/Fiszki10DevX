import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const createCollectionMock = vi.fn();
vi.mock("@/lib/services/collections.service", () => ({
  CollectionsService: vi.fn().mockImplementation(() => ({
    createCollection: createCollectionMock,
  })),
}));

describe("CollectionForm - create success", () => {
  it("tworzy kolekcję i nawiguję do listy", async () => {
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: false }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: false }) }));

    const user = userEvent.setup();
    const { CollectionForm } = await import("../CollectionForm");

    let navigatedTo = "";
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        get href() {
          return navigatedTo;
        },
        set href(v: string) {
          navigatedTo = v;
        },
      },
    });

    render(<CollectionForm />);

    await user.type(screen.getByLabelText("Nazwa kolekcji"), "Moja kolekcja");
    await user.type(screen.getByLabelText("Opis (opcjonalnie)"), "Opis testowy");

    createCollectionMock.mockResolvedValueOnce({ id: "col-1", name: "Moja kolekcja" });

    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    expect(createCollectionMock).toHaveBeenCalledWith("user-1", { name: "Moja kolekcja", description: "Opis testowy" });
    expect(navigatedTo).toBe("/dashboard/collections");

    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });
});
