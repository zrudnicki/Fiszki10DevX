import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock auth to simulate unauthenticated user
vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

// Mock Supabase module to avoid reading env vars during tests
vi.mock("@/db/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

describe("AIGenerateForm", () => {
  it("shows unauthenticated UI", async () => {
    const { AIGenerateForm } = await import("../ai/AIGenerateForm");
    render(<AIGenerateForm />);
    expect(screen.getByText("Wymagane logowanie")).toBeInTheDocument();
    expect(screen.getByText("Aby generować fiszki, musisz się zalogować.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Zaloguj się" })).toHaveAttribute("href", "/login");
  });
});
