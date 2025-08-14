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

describe("CollectionTableRow delete - error", () => {
  it("pokazuje alert i nie wywołuje onDelete przy błędzie serwisu", async () => {
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" } }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" } }) }));

    const user = userEvent.setup();
    const { CollectionTableRow } = await import("../CollectionTableRow");

    vi.spyOn(window, "confirm").mockImplementation(() => true);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => void 0);

    const col: CollectionDTO = {
      id: "col-2",
      name: "Kolekcja Y",
      description: "",
      flashcard_count: 1,
      created_at: "",
      updated_at: "",
    };
    const onDelete = vi.fn();

    deleteCollectionMock.mockRejectedValueOnce(new Error("delete failed"));

    render(
      <table>
        <tbody>
          <CollectionTableRow collection={col} onDelete={onDelete} />
        </tbody>
      </table>
    );

    const row = screen.getByRole("row");
    await user.click(within(row).getByRole("button", { name: "Usuń" }));

    expect(deleteCollectionMock).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
  });
});
