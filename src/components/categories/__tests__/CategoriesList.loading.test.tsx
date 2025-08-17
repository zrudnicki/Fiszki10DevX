import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { AuthProviderMock } from "./mocks/AuthProviderMock";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

// Mock service to return a promise that never resolves to keep loading state
const getCategoriesMock = vi.fn().mockImplementation(
  () =>
    new Promise(() => {
      /* keep pending */ void 0;
    })
);
vi.mock("@/lib/services/categories.service", () => ({
  CategoriesService: vi.fn().mockImplementation(() => ({
    getCategories: getCategoriesMock,
  })),
}));

describe("CategoriesList - loading", () => {
  it("pokazuje spinner ładowania gdy authLoading lub isLoading", async () => {
    // Mock AuthProviderMock to show loading state
    const AuthProviderWithLoading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <AuthProviderMock isLoading={true}>{children}</AuthProviderMock>
    );

    const { CategoriesList } = await import("../CategoriesList");

    const first = render(
      <AuthProviderWithLoading>
        <CategoriesList />
      </AuthProviderWithLoading>
    );
    expect(first.container.querySelector(".animate-spin")).not.toBeNull();

    const second = render(
      <AuthProviderMock>
        <CategoriesList />
      </AuthProviderMock>
    );
    expect(second.container.querySelector(".animate-spin")).not.toBeNull();
  });
});
