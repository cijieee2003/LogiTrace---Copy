
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

  const setToken = (newToken) => {
    _setToken(newToken);

    if (newToken) {
      localStorage.setItem("token", newToken);
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
      console.error("Failed to get user:", {
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });

      setUser({});
      setToken(null);

      return null;
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REFRESH USER
  |--------------------------------------------------------------------------
  */

  const refreshUser = async () => {
    try {
      const { data } = await axiosClient.get("/user");

      setUser(data);

      return data;
    } catch (error) {
      console.error("Failed to refresh user:", {
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });

      return null;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const login = async (credentials) => {
    setBtnLoading(true);

    try {
      const response = await axiosClient.post(
        "/login",
        credentials
      );

      const newToken = response.data?.token;

      if (!newToken) {
        throw new Error(
          "Login response does not contain an authentication token."
        );
      }

      // Save token before requesting the authenticated user.
      setToken(newToken);

      const { data } = await axiosClient.get("/user");

      setUser(data);

      return true;
    } catch (error) {
      console.error("Login failed:", {
        url: error.config?.baseURL
          ? `${error.config.baseURL}${error.config.url || ""}`
          : error.config?.url,
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });

      setToken(null);
      setUser({});

      throw error;
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
      console.error("Logout request failed:", {
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });
    } finally {
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
        login,
        logout,
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
