
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useState, useContext, useEffect } from "react";
import { User } from "@/lib/models/User";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored auth token on component mount
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        apiClient.getCurrentUser().then(({ user }) => {
          setUser(user);
        }).catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('auth-token');
          apiClient.clearToken();
        }).finally(() => {
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Failed to get current user:", error);
        localStorage.removeItem('auth-token');
        apiClient.clearToken();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user, token } = await apiClient.login(email, password);
      
      if (user) {
        apiClient.setToken(token);
        setUser(user);
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
      return user;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user, token } = await apiClient.register({
        name,
        email,
        password,
        role: "customer"
      });
      
      apiClient.setToken(token);
      setUser(user);
      toast({
        title: "Signup successful",
        description: `Welcome, ${name}!`,
      });
      return user;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
