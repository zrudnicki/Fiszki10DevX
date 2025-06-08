import { AuthProvider } from '../lib/AuthContext';
import { UserMenu } from './UserMenu';

export const Navigation = () => {
  return (
    <AuthProvider>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <a href="/" className="text-white font-bold text-xl">10xDevs Fiszki</a>
            </div>
            <div className="flex items-center">
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>
    </AuthProvider>
  );
}; 