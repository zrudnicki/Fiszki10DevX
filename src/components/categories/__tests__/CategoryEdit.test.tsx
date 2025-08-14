import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Auth as logged-in
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));
vi.mock("@/components/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const getByIdMock = vi.fn();
const updateCategoryMock = vi.fn();
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    getCategoryById: getByIdMock,
    updateCategory: updateCategoryMock,
  })),
}));

describe("CategoryEdit (SC-CAT-03)", () => {
  beforeEach(() => {
    getByIdMock.mockReset();
    updateCategoryMock.mockReset();
  });

  it("loads category, updates name and redirects", async () => {
    const user = userEvent.setup();
    const { CategoryEdit } = await import("../CategoryEdit");

    getByIdMock.mockResolvedValue({ id: "cat-1", name: "Old Name" });
    updateCategoryMock.mockResolvedValue({ id: "cat-1", name: "New Name" });

    // Stub navigation
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

    // Wait for loaded form elements
    const input = await screen.findByLabelText("Nazwa kategorii");
    await user.clear(input);
    await user.type(input, "New Name");

    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    expect(updateCategoryMock).toHaveBeenCalledWith("user-1", "cat-1", { name: "New Name" });
    expect(navigatedTo).toBe("/dashboard/categories");

    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });
});


