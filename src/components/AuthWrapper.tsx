import { useEffect, useState } from 'react';
import { Auth } from './Auth';
import { AuthProvider } from '../lib/AuthContext';

export const AuthWrapper = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white/5 backdrop-blur-lg rounded-lg shadow-xl border border-white/10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-white/10 rounded"></div>
          <div className="h-10 bg-white/10 rounded"></div>
          <div className="h-10 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Auth />
    </AuthProvider>
  );
}; 