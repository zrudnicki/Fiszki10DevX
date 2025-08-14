import { useAuth } from "../hooks/useAuth";

export const UserMenu = () => {
  try {
    const { user, loading, signOut } = useAuth();

    if (loading) {
      return (
        <div className="text-white/50 w-5 h-5">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      );
    }

    return (
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-white">{user.user_metadata?.full_name || user.email}</span>
              {user.user_metadata?.full_name && <span className="text-xs text-white/60">{user.email}</span>}
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center px-3 py-1.5 border border-white/20 rounded-md text-sm font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Wyloguj
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Zaloguj się
          </a>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in UserMenu:", error);
    return null;
  }
};
