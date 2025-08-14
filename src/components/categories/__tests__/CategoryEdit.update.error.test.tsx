import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const getByIdMock = vi.fn();
const updateCategoryMock = vi.fn();
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    getCategoryById: getByIdMock,
    updateCategory: updateCategoryMock,
  })),
}));

describe("CategoryEdit - update error", () => {
  it("pokazuje błąd i nie nawiguję przy błędzie aktualizacji", async () => {
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" } }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" } }) }));

    const user = userEvent.setup();
    const { CategoryEdit } = await import("../CategoryEdit");

    getByIdMock.mockResolvedValue({ id: "cat-1", name: "Old" });
    updateCategoryMock.mockRejectedValueOnce(new Error("update failed"));

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

    render(<CategoryEdit categoryId="cat-1" />);

    const input = await screen.findByLabelText("Nazwa kategorii");
    await user.clear(input);
    await user.type(input, "New");
    const submit = await screen.findByRole("button", { name: /Zapisz zmiany|Zapisywanie/ });
    await user.click(submit);

    expect(updateCategoryMock).toHaveBeenCalled();
    expect(screen.getByText(/Wystąpił błąd podczas aktualizacji kategorii/i)).toBeInTheDocument();
    expect(navigatedTo).toBe("");

    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });
});
