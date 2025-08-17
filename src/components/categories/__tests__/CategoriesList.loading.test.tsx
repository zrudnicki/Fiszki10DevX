import { describe, it, expect, vi } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";
import { AuthProviderMock } from "./mocks/AuthProviderMock";

vi.mock("@/db/supabase", () => ({ supabase: {} }));

// Mock service to return a promise that never resolves to keep loading state
const getCategoriesMock = vi
  .fn()
  .mockImplementation(() => new Promise(() => { /* keep pending */ void 0; }));
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
    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <AuthProviderWithLoading>
          <CategoriesList />
        </AuthProviderWithLoading>
      );
      container = result.container;
    });

    // Should show spinner because authLoading is true
    expect(container?.querySelector(".animate-spin")).not.toBeNull();

    // Now test with authLoading=false but isLoading=true
    await act(async () => {
      const result = render(
        <AuthProviderMock>
          <CategoriesList />
        </AuthProviderMock>
      );
      container = result.container;
    });

    // Should show spinner because getCategories never resolves
    expect(container?.querySelector(".animate-spin")).not.toBeNull();
  });
});