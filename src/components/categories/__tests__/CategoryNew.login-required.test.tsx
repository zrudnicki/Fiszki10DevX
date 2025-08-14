import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/db/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: "t" } } }),
    },
  },
}));

const createCategoryMock = vi.fn();
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    createCategory: createCategoryMock,
  })),
}));

describe("CategoryNew - login required", () => {
  it("pokazuje ekran logowania gdy brak użytkownika", async () => {
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));

    const { CategoryNew } = await import("../CategoryNew");
    render(<CategoryNew />);

    expect(screen.getByText("Wymagane logowanie")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Zaloguj się" })).toHaveAttribute("href", "/login");
  });
});
