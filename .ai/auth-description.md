```mermaid
flowchart TD
    subgraph ReactApp
        A[AuthProvider - src/lib/AuthContext.tsx]
        B[AuthContext - src/lib/AuthContext.tsx]
        C[useAuth Hook - src/components/hooks/useAuth.ts]
        D[UserMenu - src/components/layout/UserMenu.tsx]
        E[AuthButton - src/components/auth/AuthButton.tsx]
        F[AuthWrapper - src/components/auth/AuthWrapper.tsx]
        G[Auth - src/components/auth/Auth.tsx]
    end

    subgraph Supabase
        S[Supabase Client - src/db/supabase]
    end

    A --> B
    B --> C
    C --> D
    C --> E
    F --> G
    G --> S
    A --> S
    D --> C
    E --> C
    S --> A

    subgraph Server
        M[Middleware - src/middleware/index.ts]
        AH[API Helpers - src/lib/utils/api-helpers.ts]
    end
    M --> AH
    AH --> S