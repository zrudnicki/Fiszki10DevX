import { useAuth } from "../hooks/useAuth";
import { Button } from "../ui/button";

export const AuthButton = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg w-full">
        <span className="font-mono bg-gray-900/50 px-3 py-1.5 rounded-lg text-gray-200 shadow-sm">...</span>
        <span className="text-gray-100/90">Ładowanie...</span>
      </div>
    );
  }

  if (user) {
    const handleLogout = async () => {
      try {
        await signOut();
        window.location.href = "/";
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    return (
      <Button
        variant="destructive"
        onClick={handleLogout}
        className="flex items-center space-x-3 p-3 rounded-lg w-full justify-start bg-red-900/50 hover:bg-red-900/70 border-none"
      >
        <span className="font-mono px-3 py-1.5 rounded-lg text-red-200 shadow-sm">Logout</span>
        <span className="text-red-100/90">Wyloguj się</span>
      </Button>
    );
  }

  return (
    <a
      href="/login"
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors w-full text-left"
    >
      <span className="font-mono bg-blue-900/50 px-3 py-1.5 rounded-lg text-blue-200 shadow-sm">Login</span>
      <span className="text-blue-100/90">Zaloguj się</span>
    </a>
  );
};
