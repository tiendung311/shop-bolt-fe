"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const ws =
    typeof window !== "undefined" ? (window as any).__wsRefresh__ : null;

  const notifyWebSocket = () => {
    if (typeof ws === "function") ws();
  };

  const getTokenExpiry = () =>
    parseInt(localStorage.getItem("tokenExpiry") || "0");

  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    const params = new URLSearchParams();
    params.append("client_id", "api-gateway");
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    try {
      const res = await fetch(
        "http://localhost:8180/realms/microservice/protocol/openid-connect/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      if (!res.ok) return false;

      const data = await res.json();
      const { access_token, refresh_token, expires_in } = data;
      const payload = JSON.parse(atob(access_token.split(".")[1]));

      const authUser: AuthUser = {
        id: payload.sub,
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        username: payload.preferred_username,
      };

      localStorage.setItem("authUser", JSON.stringify(authUser));
      localStorage.setItem("token", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem(
        "tokenExpiry",
        (Date.now() + expires_in * 1000).toString()
      );

      setAuthState({
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (err) {
      console.error("Token refresh error:", err);
      return false;
    }
  };

  // Tự động refresh token trước khi hết hạn
  useEffect(() => {
    const interval = setInterval(() => {
      const expiry = getTokenExpiry();
      const now = Date.now();

      if (expiry - now < 60_000) {
        refreshAccessToken();
      }
    }, 30_000); // Kiểm tra mỗi 30s

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        logout();
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    const params = new URLSearchParams();
    params.append("client_id", "api-gateway");
    params.append("grant_type", "password");
    params.append("username", username);
    params.append("password", password);

    try {
      const response = await fetch(
        "http://localhost:8180/realms/microservice/protocol/openid-connect/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      if (!response.ok) return false;

      const data = await response.json();
      const { access_token, refresh_token, expires_in } = data;
      const payload = JSON.parse(atob(access_token.split(".")[1]));

      const authUser: AuthUser = {
        id: payload.sub,
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        username: payload.preferred_username,
      };

      localStorage.setItem("authUser", JSON.stringify(authUser));
      localStorage.setItem("token", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem(
        "tokenExpiry",
        (Date.now() + expires_in * 1000).toString()
      );

      setAuthState({
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
      });

      notifyWebSocket();

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:8080/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          username,
          password,
        }),
      });

      if (response.ok) {
        return await login(username, password);
      }

      return false;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    notifyWebSocket();
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
