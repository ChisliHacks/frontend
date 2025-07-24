import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authApi, tokenUtils } from "../utils/api";
import type { UserProfile } from "../utils/api";
import { AuthContext } from "./authContextDefinition";
import type { AuthContextType } from "./authContextDefinition";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (tokenUtils.isAuthenticated()) {
          const userProfile = await authApi.getProfile();
          setUser(userProfile);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        tokenUtils.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const result = await authApi.login({ username, password });
    tokenUtils.setToken(result.access_token, result.token_type);

    const userProfile = await authApi.getProfile();
    setUser(userProfile);
  };

  const signup = async (email: string, username: string, password: string) => {
    const result = await authApi.signup({ email, username, password });
    tokenUtils.setToken(result.access_token, result.token_type);

    const userProfile = await authApi.getProfile();
    setUser(userProfile);
  };

  const logout = () => {
    tokenUtils.removeToken();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      if (tokenUtils.isAuthenticated()) {
        const userProfile = await authApi.getProfile();
        setUser(userProfile);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
