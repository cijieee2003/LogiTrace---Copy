import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axiosClient from "../api/axiosClient";

const stateContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [token, _setToken] = useState(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  // Save or remove token
  const setToken = (token) => {
    _setToken(token);

    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  };

  // Get authenticated user
  const getUser = async () => {
    try {
      const { data } = await axiosClient.get("/user");

      setUser(data);
    } catch (error) {
      console.error("Failed to get user:", error);

      // Token is invalid or expired
      setToken(null);
      setUser({});
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (data) => {
    setBtnLoading(true);

    try {
      const response = await axiosClient.post("/login", data);

      const newToken = response.data.token;

      // Save token
      setToken(newToken);

      // Get user information
      await getUser();

      return true;
    } catch (error) {
      console.error("Login failed:", error);

      return false;
    } finally {
      setBtnLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Clear authentication even if API request fails
      setToken(null);
      setUser({});
    }
  };

  // Check authentication when app starts
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      getUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <stateContext.Provider
      value={{
        user,
        token,
        loading,
        btnLoading,
        login,
        logout,
      }}
    >
      {children}
    </stateContext.Provider>
  );
};

// Custom authentication hook
export const useStateContext = () => {
  const context = useContext(stateContext);

  if (!context) {
    throw new Error(
      "useStateContext must be used inside an AuthProvider"
    );
  }

  return context;
};