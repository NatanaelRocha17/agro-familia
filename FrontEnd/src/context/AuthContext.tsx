// AuthContext.tsx

import { createContext, useContext, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (token: string, user: unknown) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("farmer_token");
    const user = localStorage.getItem("user");

    return !!token && !!user;
  });

  function login(token: string, user: unknown) {
    localStorage.setItem("farmer_token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem("farmer_token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
