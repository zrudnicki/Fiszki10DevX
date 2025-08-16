import React from "react";
import { AuthContext } from "@/lib/AuthContext";
import type { User } from "@/db/supabase";
import { vi } from "vitest";

export const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

interface AuthProviderMockProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const AuthProviderMock: React.FC<AuthProviderMockProps> = ({ children, isLoading = false }) => {
  return (
    <AuthContext.Provider
      value={{
        user: mockUser,
        loading: isLoading,
        signOut: vi.fn().mockResolvedValue(undefined),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};