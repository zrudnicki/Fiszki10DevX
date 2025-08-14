import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import type { CategoryDTO } from "@/types/dto.types";

// Auth not needed here as row uses only category prop and service
vi.mock("@/db/supabase", () => ({ supabase: {} }));

const deleteCategoryMock = vi.fn();
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    deleteCategory: deleteCategoryMock,
  })),
}));

// Confirm dialog mock
vi.spyOn(window, "confirm").mockImplementation(() => true);

describe("CategoryTableRow delete (SC-CAT-04)", () => {
  beforeEach(() => {
    deleteCategoryMock.mockReset();
    (window.confirm as unknown as jest.Mock | (() => boolean)).mockReturnValue?.(true);
  });

  it("calls service and onDelete on confirm", async () => {
    const user = userEvent.setup();
    const { CategoryTableRow } = await import("../CategoryTableRow");

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

    expect(deleteCategoryMock).toHaveBeenCalledWith("c1");
    expect(onDelete).toHaveBeenCalledWith("c1");
  });
});




