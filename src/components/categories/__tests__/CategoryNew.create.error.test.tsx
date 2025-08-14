import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("CategoryNew - create error", () => {
  it("pokazuje błąd i nie nawiguję przy błędzie tworzenia", async () => {
    vi.doMock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" } }) }));
    vi.doMock("@/components/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-1" } }) }));

    const user = userEvent.setup();
    const { CategoryNew } = await import("../CategoryNew");

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
    await user.type(screen.getByLabelText("Nazwa kategorii"), "X");

    createCategoryMock.mockRejectedValueOnce(new Error("create failed"));
    await user.click(screen.getByRole("button", { name: "Utwórz kategorię" }));

    expect(createCategoryMock).toHaveBeenCalled();
    expect(screen.getByText(/Wystąpił błąd podczas tworzenia kategorii/i)).toBeInTheDocument();
    expect(navigatedTo).toBe("");

    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });
});



