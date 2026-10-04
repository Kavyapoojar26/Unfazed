import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedTherapist = localStorage.getItem("unfazed_therapist");

    if (storedTherapist) {
      try {
        setTherapist(JSON.parse(storedTherapist));
      } catch {
        localStorage.removeItem("unfazed_therapist");
        localStorage.removeItem("unfazed_token");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password
    });

    const { token, therapist } = response.data;

    localStorage.setItem("unfazed_token", token);
    localStorage.setItem(
      "unfazed_therapist",
      JSON.stringify(therapist)
    );

    setTherapist(therapist);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("unfazed_token");
    localStorage.removeItem("unfazed_therapist");
    setTherapist(null);
  };

  return (
    <AuthContext.Provider
      value={{
        therapist,
        loading,
        isAuthenticated: Boolean(therapist),
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};