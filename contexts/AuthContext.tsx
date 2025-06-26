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

  // Truy cập WebSocket để gọi refresh
  const ws =
    typeof window !== "undefined" ? (window as any).__wsRefresh__ : null;

  const notifyWebSocket = () => {
    if (typeof ws === "function") ws();
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem("authUser");
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const params = new URLSearchParams();
      params.append("client_id", "api-gateway");
      params.append("grant_type", "password");
      params.append("username", username);
      params.append("password", password);

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

      if (response.ok) {
        const data = await response.json();
        const accessToken = data.access_token;

        const payload = JSON.parse(atob(accessToken.split(".")[1]));

        const authUser: AuthUser = {
          id: payload.sub,
          firstName: payload.given_name,
          lastName: payload.family_name,
          email: payload.email,
          username: payload.preferred_username,
        };

        localStorage.setItem("authUser", JSON.stringify(authUser));
        localStorage.setItem("token", accessToken);

        setAuthState({
          user: authUser,
          isAuthenticated: true,
          isLoading: false,
        });

        notifyWebSocket(); // 🔔 thông báo WS connect lại

        return true;
      }

      return false;
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
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    notifyWebSocket(); // 🔔 disconnect WS khi logout
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
