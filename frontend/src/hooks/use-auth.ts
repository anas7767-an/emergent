import { useState, useEffect } from "react";
import { setAuthTokenGetter, type User } from "@workspace/api-client-react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("feri_token"));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("feri_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("feri_token"));
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("feri_token", newToken);
    localStorage.setItem("feri_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setAuthTokenGetter(() => newToken);
  };

  const logout = () => {
    localStorage.removeItem("feri_token");
    localStorage.removeItem("feri_user");
    setToken(null);
    setUser(null);
    setAuthTokenGetter(() => null);
  };

  return { token, user, login, logout, isAuthenticated: !!token };
}
