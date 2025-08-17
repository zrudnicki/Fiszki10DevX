import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { CategoryDTO } from "@/types/dto.types";
import { AuthProviderMock, mockUser } from "./mocks/AuthProviderMock";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const deleteCategoryMock = vi.fn();
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    deleteCategory: deleteCategoryMock,
  })),
}));

// Mock window.alert
const alertMock = vi.fn();
vi.spyOn(window, "alert").mockImplementation(alertMock);

describe("CategoryTableRow delete - error", () => {
  it("pokazuje alert i nie wywołuje onDelete przy błędzie serwisu", async () => {
    const user = userEvent.setup();
    const { CategoryTableRow } = await import("../CategoryTableRow");

    // Mock confirm dialog to return true
    vi.spyOn(window, "confirm").mockReturnValue(true);

    // Mock service to throw error
    deleteCategoryMock.mockRejectedValue(new Error("delete failed"));

    const cat: CategoryDTO = {
      id: "c1",
      name: "Kategoria X",
      flashcard_count: 0,
      created_at: "",
      updated_at: "",
    };
    const onDelete = vi.fn();

    render(
      <AuthProviderMock>
        <table>
          <tbody>
            <CategoryTableRow category={cat} onDelete={onDelete} />
          </tbody>
        </table>
      </AuthProviderMock>
    );

    const row = screen.getByRole("row");
    await user.click(within(row).getByRole("button", { name: "Usuń" }));

    expect(deleteCategoryMock).toHaveBeenCalledWith(mockUser.id, "c1");
    expect(alertMock).toHaveBeenCalledWith("Nie udało się usunąć kategorii. Spróbuj ponownie później.");
    expect(onDelete).not.toHaveBeenCalled();
  });
});
