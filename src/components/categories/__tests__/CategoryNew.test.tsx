import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock auth to simulate logged-in user (cover multiple import specifiers)
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));
vi.mock("@/components/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

// Mock Supabase client to avoid env usage
vi.mock("@/db/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: "t" } } }),
    },
  },
}));

// Mock CategoriesService to capture createCategory calls
const createCategoryMock = vi.fn();
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    createCategory: createCategoryMock,
  })),
}));

describe("CategoryNew (SC-CAT-01)", () => {
  beforeEach(() => {
    createCategoryMock.mockReset();
  });

  it("creates a category when name provided and redirects to list", async () => {
    const user = userEvent.setup();
    const { CategoryNew } = await import("../CategoryNew");

    // Stub window.location.href setter
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

    render(<CategoryNew />);

    // Fill name
    await user.type(screen.getByLabelText("Nazwa kategorii"), "Moja Kategoria");

    // Mock successful create
    createCategoryMock.mockResolvedValueOnce({ id: "cat-1", name: "Moja Kategoria" });

    // Submit
    await user.click(screen.getByRole("button", { name: "Utwórz kategorię" }));

    expect(createCategoryMock).toHaveBeenCalledWith({ name: "Moja Kategoria", user_id: "user-1" });
    expect(navigatedTo).toBe("/dashboard/categories");

    // Restore location
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });
});
