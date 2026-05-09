import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem("smart_learning_auth");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem("smart_learning_auth", JSON.stringify(auth));
      localStorage.setItem("smart_learning_token", auth.token);
    } else {
      localStorage.removeItem("smart_learning_auth");
      localStorage.removeItem("smart_learning_token");
    }
  }, [auth]);

  const login = async (payload) => {
    const { data } = await client.post("/auth/login", payload);
    setAuth(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await client.post("/auth/register", payload);
    setAuth(data);
    return data;
  };

  const updateProfile = (patch) => {
    setAuth((current) => (current ? { ...current, ...patch } : current));
  };

  const logout = () => setAuth(null);

  return (
    <AuthContext.Provider value={{ auth, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
