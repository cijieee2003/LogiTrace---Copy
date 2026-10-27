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

  /*
  |--------------------------------------------------------------------------
  | SAVE OR REMOVE TOKEN
  |--------------------------------------------------------------------------
  */

  const setToken = (token) => {
    _setToken(token);

    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | GET AUTHENTICATED USER
  |--------------------------------------------------------------------------
  */

  const getUser = async () => {
    try {
      const { data } = await axiosClient.get("/user");

      setUser(data);

      return data;
    } catch (error) {
      console.error("Failed to get user:", error);

      // Token is invalid or expired
      setToken(null);
      setUser({});

      return null;
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REFRESH USER
  |--------------------------------------------------------------------------
  |
  | Used after the driver:
  |
  | 1. Completes their profile
  | 2. Changes their password
  |
  */

  const refreshUser = async () => {
    try {
      const { data } = await axiosClient.get("/user");

      setUser(data);

      return data;
    } catch (error) {
      console.error("Failed to refresh user:", error);

      return null;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const login = async (data) => {
    setBtnLoading(true);

    try {
      const response = await axiosClient.post(
        "/login",
        data
      );

      const newToken = response.data.token;

      // Save token
      setToken(newToken);

      /*
      |--------------------------------------------------------------------------
      | Get Fresh User Information
      |--------------------------------------------------------------------------
      |
      | This gets:
      |
      | profile_completed
      | password_changed
      |
      */

      await getUser();

      return true;
    } catch (error) {
      console.error("Login failed:", error);

      return false;
    } finally {
      setBtnLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      // Clear authentication even if API request fails
      setToken(null);
      setUser({});
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CHECK AUTHENTICATION WHEN APP STARTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      getUser();
    } else {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | AUTH CONTEXT
  |--------------------------------------------------------------------------
  */

  return (
    <stateContext.Provider
      value={{
        user,
        token,
        loading,
        btnLoading,

        // Authentication
        login,
        logout,

        // Refresh authenticated user
        refreshUser,
      }}
    >
      {children}
    </stateContext.Provider>
  );
};

/*
|--------------------------------------------------------------------------
| CUSTOM AUTHENTICATION HOOK
|--------------------------------------------------------------------------
*/

export const useStateContext = () => {
  const context = useContext(stateContext);

  if (!context) {
    throw new Error(
      "useStateContext must be used inside an AuthProvider"
    );
  }

  return context;
};