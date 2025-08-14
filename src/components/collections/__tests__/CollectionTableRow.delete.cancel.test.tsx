import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import type { CollectionDTO } from "@/types/dto.types";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const deleteCollectionMock = vi.fn();
vi.mock("@/lib/services/collections.service", () => ({
  CollectionsService: vi.fn().mockImplementation(() => ({
    deleteCollection: deleteCollectionMock,
  })),
}));

describe("CollectionTableRow delete - cancel", () => {
  it("nie usuwa przy anulowaniu confirm", async () => {
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" } }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" } }) }));

    const user = userEvent.setup();
    const { CollectionTableRow } = await import("../CollectionTableRow");

    vi.spyOn(window, "confirm").mockImplementation(() => false);

    const col: CollectionDTO = {
      id: "col-1",
      name: "Kolekcja X",
      description: "",
      flashcard_count: 0,
      created_at: "",
      updated_at: "",
    };
    const onDelete = vi.fn();

    render(
      <table>
        <tbody>
          <CollectionTableRow collection={col} onDelete={onDelete} />
        </tbody>
      </table>
    );

    const row = screen.getByRole("row");
    await user.click(within(row).getByRole("button", { name: "Usuń" }));

    expect(deleteCollectionMock).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});


