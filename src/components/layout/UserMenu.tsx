import { useAuth } from "../hooks/useAuth";

export const UserMenu = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        <svg
          className="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm text-white/80">Ładowanie...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <a href="/login" className="text-sm text-white/90 hover:text-white">
        Zaloguj się
      </a>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="text-sm text-white/90">
        {user.user_metadata?.full_name || user.email}
        {user.email ? <span className="text-xs text-white/60">{user.email}</span> : null}
      </div>
    </div>
  );
};
