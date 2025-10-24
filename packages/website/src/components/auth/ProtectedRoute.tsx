'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
  fallbackPath?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for token in multiple places
      const token = 
        localStorage.getItem('token') || 
        localStorage.getItem('access_token') ||
        sessionStorage.getItem('token');

      if (!token) {
        console.log('❌ No token found, redirecting to login');
        router.push(fallbackPath);
        return;
      }

      // Verify token with backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const userInfo = userData.data || userData.user || userData;
        
        setUser(userInfo);
        
        // Check role permission
        if (requiredRole === 'admin' && userInfo.role !== 'admin') {
          console.log('❌ Insufficient permissions');
          router.push('/unauthorized');
          return;
        }

        setIsAuthenticated(true);
        console.log('✅ User authenticated:', userInfo.email);
      } else {
        console.log('❌ Token invalid, clearing and redirecting');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('token');
        router.push(fallbackPath);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push(fallbackPath);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Kimlik doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  // Authentication failed
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erişim Reddedildi
          </h2>
          <p className="text-gray-600">
            Bu sayfaya erişebilmek için giriş yapmalısınız.
          </p>
        </div>
      </div>
    );
  }

  // Success - render protected content
  return <>{children}</>;
}

// Hook for accessing user data in protected components
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData.data || userData.user || userData);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return { user, loading, logout, isAuthenticated: !!user };
}

export default ProtectedRoute;