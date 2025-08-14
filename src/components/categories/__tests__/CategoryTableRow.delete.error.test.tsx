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

describe("CategoryTableRow delete - error", () => {
  it("pokazuje alert i nie wywołuje onDelete przy błędzie serwisu", async () => {
    const user = userEvent.setup();
    const { CategoryTableRow } = await import("../CategoryTableRow");

    vi.spyOn(window, "confirm").mockImplementation(() => true);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => void 0);

    const cat: CategoryDTO = {
      id: "c2",
      name: "Kategoria Y",
      flashcard_count: 1,
      created_at: "",
      updated_at: "",
    };
    const onDelete = vi.fn();

    deleteCategoryMock.mockRejectedValueOnce(new Error("delete failed"));

    render(
      <table>
        <tbody>
          <CategoryTableRow category={cat} onDelete={onDelete} />
        </tbody>
      </table>
    );

    const row = screen.getByRole("row");
    await user.click(within(row).getByRole("button", { name: "Usuń" }));

    expect(deleteCategoryMock).toHaveBeenCalledWith("c2");
    expect(onDelete).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
  });
});
