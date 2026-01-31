"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  isAuthenticated,
  getCurrentUser,
  hasRole,
  User,
  logout,
  logoutAsync,
} from "@/utils/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: User["role"][];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        // Save intended destination for redirect after login
        sessionStorage.setItem("redirectAfterLogin", pathname);
        router.replace("/login");
        return;
      }

      // Check role-based access if roles are specified
      if (allowedRoles && allowedRoles.length > 0) {
        if (!hasRole(allowedRoles)) {
          // User doesn't have required role - redirect to unauthorized or logout
          logout();
          router.replace("/login");
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname, allowedRoles]);

  if (isLoading) {
    return (
      <></>
      // <div className="min-h-screen flex items-center justify-center bg-gray-50">
      //   <div className="flex flex-col items-center gap-4">
      //     <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      //     <p className="text-gray-600">Memuat...</p>
      //   </div>
      // </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook to check authentication status
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const router = useRouter();

  useEffect(() => {
    // Re-sync user on storage changes
    const handleStorageChange = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = async () => {
    await logoutAsync();
    router.push("/login");
  };

  return {
    user,
    loading: !user,
    isAuthenticated: isAuthenticated(),
    logout: handleLogout,
  };
}
