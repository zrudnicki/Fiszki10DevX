import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const getByIdMock = vi.fn();
const updateCollectionMock = vi.fn();
vi.mock("@/lib/services/collections.service", () => ({
  CollectionsService: vi.fn().mockImplementation(() => ({
    getCollectionById: getByIdMock,
    updateCollection: updateCollectionMock,
  })),
}));

describe("CollectionForm - update success", () => {
  it("aktualizuje kolekcję i nawiguję do listy", async () => {
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: false }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: false }) }));

    const user = userEvent.setup();
    const { CollectionForm } = await import("../CollectionForm");

    getByIdMock.mockResolvedValue({ id: "col-1", name: "Stara nazwa", description: "" });
    updateCollectionMock.mockResolvedValueOnce({ id: "col-1", name: "Nowa nazwa" });

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

    render(<CollectionForm collectionId="col-1" />);

    const nameInput = await screen.findByLabelText("Nazwa kolekcji");
    await user.clear(nameInput);
    await user.type(nameInput, "Nowa nazwa");
    const submit = await screen.findByRole("button", { name: /Zapisz zmiany|Zapisywanie/ });
    await user.click(submit);

    expect(updateCollectionMock).toHaveBeenCalledWith(
      "user-1",
      "col-1",
      expect.objectContaining({ name: "Nowa nazwa" })
    );
    expect(navigatedTo).toBe("/dashboard/collections");

    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });
});
