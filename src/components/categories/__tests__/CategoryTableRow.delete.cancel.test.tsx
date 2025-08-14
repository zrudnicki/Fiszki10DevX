import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import type { CategoryDTO } from "@/types/dto.types";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const deleteCategoryMock = vi.fn();
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    deleteCategory: deleteCategoryMock,
  })),
}));

describe("CategoryTableRow delete - cancel", () => {
  it("nie usuwa przy anulowaniu confirm", async () => {
    const user = userEvent.setup();
    const { CategoryTableRow } = await import("../CategoryTableRow");

    vi.spyOn(window, "confirm").mockImplementation(() => false);

    const cat: CategoryDTO = {
      id: "c1",
      name: "Kategoria X",
      flashcard_count: 0,
      created_at: "",
      updated_at: "",
    };
    const onDelete = vi.fn();

    render(
      <table>
        <tbody>
          <CategoryTableRow category={cat} onDelete={onDelete} />
        </tbody>
      </table>
    );

    const row = screen.getByRole("row");
    await user.click(within(row).getByRole("button", { name: "Usuń" }));

    expect(deleteCategoryMock).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
