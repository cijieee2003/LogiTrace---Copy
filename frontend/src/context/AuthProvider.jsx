
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import axiosClient from "../api/axiosClient";

const stateContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(
    () => localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  // Save token in React state and localStorage.
  const setToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }

    setTokenState(newToken || null);
  }, []);

  // Clear authentication information.
  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    setTokenState(null);
    setUser(null);
  }, []);

  // Get the currently authenticated user.
  const getUser = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setUser(null);
      setLoading(false);
      return false;
    }

    try {
      const response = await axiosClient.get("/user");

      setUser(response.data.user ?? response.data);
      return true;
    } catch (error) {
      console.error(
        "Failed to fetch authenticated user:",
        error.response?.status,
        error.response?.data ?? error.message
      );

      // Only clear authentication when the server rejects
      // the credentials, not for every network/server error.
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        clearAuth();
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  // Login.
  const login = async (credentials) => {
    setBtnLoading(true);

    try {
      const response = await axiosClient.post(
        "/login",
        credentials
      );

      // Supports common Laravel token response formats.
      const newToken =
        response.data?.token ??
        response.data?.access_token ??
        response.data?.data?.token;

      if (!newToken) {
        console.error(
          "Login response did not contain a token:",
          response.data
        );

        return {
          success: false,
          message:
            response.data?.message ??
            "Login succeeded without a recognized token. Check the API response.",
        };
      }

      // Save the token BEFORE requesting /user.
      setToken(newToken);

      // Use the user returned by login if available.
      const returnedUser =
        response.data?.user ?? response.data?.data?.user;

      if (returnedUser) {
        setUser(returnedUser);
        setLoading(false);

        return { success: true };
      }

      // Otherwise fetch the authenticated user.
      const userLoaded = await getUser();

      if (!userLoaded) {
        clearAuth();

        return {
          success: false,
          message:
            "Login returned a token, but the user profile could not be loaded. Check the /user endpoint.",
        };
      }

      return { success: true };
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.status,
        error.response?.data ?? error.message
      );

      return {
        success: false,
        message:
          error.response?.data?.message ??
          "Unable to log in. Please check your credentials and try again.",
      };
    } finally {
      setBtnLoading(false);
    }
  };

  // Logout.
  const logout = async () => {
    try {
      if (localStorage.getItem("token")) {
        await axiosClient.post("/logout");
      }
    } catch (error) {
      console.error(
        "Logout API request failed:",
        error.response?.status,
        error.response?.data ?? error.message
      );
    } finally {
      clearAuth();
      setLoading(false);
    }
  };

  // Restore the session when the application starts.
  useEffect(() => {
    if (localStorage.getItem("token")) {
      getUser();
    } else {
      setLoading(false);
    }
  }, [getUser]);

  return (
    <stateContext.Provider
      value={{
        user,
        token,
        loading,
        btnLoading,
        login,
        logout,
        getUser,
      }}
    >
      {children}
    </stateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(stateContext);

  if (!context) {
    throw new Error(
      "useStateContext must be used inside an AuthProvider"
    );
  }

  return context;
};
