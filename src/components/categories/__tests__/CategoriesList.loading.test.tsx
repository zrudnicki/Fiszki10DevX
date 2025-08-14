import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

const getCategoriesMock = vi.fn();
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    getCategories: getCategoriesMock,
  })),
}));

describe("CategoriesList - loading", () => {
  it("pokazuje spinner ładowania gdy authLoading lub isLoading", async () => {
    // authLoading = true
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: true }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" }, isLoading: true }) }));
    const { CategoriesList } = await import("../CategoriesList");
    const { container } = render(<CategoriesList />);
    expect(container.querySelector(".animate-spin")).not.toBeNull();
  });
});
