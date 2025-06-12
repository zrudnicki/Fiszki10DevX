import { AuthProvider } from "../../lib/AuthContext";
import { AuthButton } from "../auth/AuthButton";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <div className="relative w-full mx-auto min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4 sm:p-8">
        <div className="relative max-w-4xl mx-auto backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 rounded-2xl shadow-2xl p-8 text-white border border-white/10">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 text-transparent bg-clip-text drop-shadow-lg">
                Fiszki
              </h1>
              <p className="text-xl text-blue-100/90 drop-shadow-md">
                Twój osobisty asystent do nauki z wykorzystaniem AI ee
              </p>
            </div>

            {/* Main content area */}
            <div className="mt-8">{children}</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Generowanie Fiszek */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                  Generowanie Fiszek
                </h2>
                <div className="space-y-3">
                  <a
                    href="/dashboard/ai/generate"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="font-mono bg-blue-900/50 px-3 py-1.5 rounded-lg text-blue-200 shadow-sm">AI</span>
                    <span className="text-blue-100/90">Generuj fiszki z tekstu</span>
                  </a>
                  <a
                    href="/dashboard/flashcards/new"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="font-mono bg-blue-900/50 px-3 py-1.5 rounded-lg text-blue-200 shadow-sm">
                      Manual
                    </span>
                    <span className="text-blue-100/90">Twórz fiszki ręcznie</span>
                  </a>
                </div>
              </div>

              {/* Nauka */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                  Nauka
                </h2>
                <div className="space-y-3">
                  <a
                    href="/dashboard/study/session"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="font-mono bg-blue-900/50 px-3 py-1.5 rounded-lg text-blue-200 shadow-sm">
                      Review
                    </span>
                    <span className="text-blue-100/90">Rozpocznij sesję nauki</span>
                  </a>
                  <a
                    href="/dashboard/collections"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="font-mono bg-blue-900/50 px-3 py-1.5 rounded-lg text-blue-200 shadow-sm">
                      Collections
                    </span>
                    <span className="text-blue-100/90">Zarządzaj kolekcjami</span>
                  </a>
                  <a
                    href="/dashboard/categories"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="font-mono bg-blue-900/50 px-3 py-1.5 rounded-lg text-blue-200 shadow-sm">
                      Collections
                    </span>
                    <span className="text-blue-100/90">Zarządzaj kategoriami</span>
                  </a>
                </div>
              </div>

              {/* Statystyki */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                  Statystyki
                </h2>
                <div className="space-y-3">
                  <a
                    href="/dashboard/stats"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="font-mono bg-blue-900/50 px-3 py-1.5 rounded-lg text-blue-200 shadow-sm">
                      Stats
                    </span>
                    <span className="text-blue-100/90">Postępy w nauce</span>
                  </a>
                  <a
                    href="/dashboard/ai/stats"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="font-mono bg-blue-900/50 px-3 py-1.5 rounded-lg text-blue-200 shadow-sm">
                      AI Stats
                    </span>
                    <span className="text-blue-100/90">Skuteczność AI</span>
                  </a>
                </div>
              </div>

              {/* Konto */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                  Konto
                </h2>
                <div className="space-y-3">
                  <a
                    href="/dashboard/account"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="font-mono bg-blue-900/50 px-3 py-1.5 rounded-lg text-blue-200 shadow-sm">
                      Settings
                    </span>
                    <span className="text-blue-100/90">Ustawienia konta</span>
                  </a>
                  <AuthButton />
                </div>
              </div>
            </div>

            <p className="text-sm text-center text-blue-100/70 mt-8">
              Wszystkie dane są przetwarzane zgodnie z RODO.{" "}
              <a href="/privacy" className="underline hover:text-blue-200">
                Polityka prywatności
              </a>
            </p>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default DashboardLayout;
