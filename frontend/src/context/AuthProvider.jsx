
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

  // Save or remove the authentication token.
  const setToken = (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }

    setTokenState(newToken);
  };

  // Get the currently authenticated user.
  const getUser = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/user");
      setUser(data.user ?? data);
      return true;
    } catch (error) {
      console.error("Failed to get user:", error);

      // Clear authentication only when the token is invalid.
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setToken(null);
        setUser(null);
      }

      return false;
    }
  }, []);

  // Log in using the credentials returned by the login form.
  const login = async (credentials) => {
    setBtnLoading(true);

    try {
      const { data } = await axiosClient.post("/login", {
        username: credentials.username,
        password: credentials.password,
      });

      if (!data.token) {
        console.error("Login response did not contain a token.");
        return false;
      }

      setToken(data.token);

      // Your Laravel AuthController already returns the user.
      if (data.user) {
        setUser(data.user);
      } else {
        await getUser();
      }

      return true;
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data ?? error.message
      );

      return false;
    } finally {
      setBtnLoading(false);
    }
  };

  // Log out the authenticated user.
  const logout = async () => {
    try {
      if (token) {
        await axiosClient.post("/logout");
      }
    } catch (error) {
      console.error(
        "Logout request failed:",
        error.response?.data ?? error.message
      );
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  // Restore the session after refreshing the page.
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        await getUser();
      }

      setLoading(false);
    };

    restoreSession();
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
