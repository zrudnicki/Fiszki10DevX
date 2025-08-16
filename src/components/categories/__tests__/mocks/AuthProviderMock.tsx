import React from "react";
import { AuthContext } from "@/lib/AuthContext";
import { vi } from "vitest";

export const mockUser = {
  id: "user-1",
  email: "test@example.com",
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
        session: null,
        isLoading,
        signOut: vi.fn(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};