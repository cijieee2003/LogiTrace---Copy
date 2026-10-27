
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, XCircle, AlertCircle } from "lucide-react";
import { useStateContext } from "../../../context/AuthProvider";
import SpinnerButton from "../../Components/SpinnerButton";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const { login, btnLoading } = useStateContext();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setShowPopup(false);

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      const success = await login({
        username: username.trim(),
        password,
      });

      if (success) {
        navigate("/dashboard");
      } else {
        setError("Your password is wrong.");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Login error:", error);

      const status = error.response?.status;
      const responseData = error.response?.data;

      if (status === 401 || status === 422) {
        setError(
          status === 422 &&
          responseData?.errors?.username?.[0]
            ? responseData.errors.username[0]
            : "Your password is wrong."
        );
        setShowPopup(true);
      } else if (status === 404) {
        setError(
          "Login endpoint not found. Please check your API URL and Laravel routes."
        );
        setShowPopup(true);
      } else if (!error.response) {
        setError("Unable to connect to the server. Please try again.");
        setShowPopup(true);
      } else {
        setError(
          responseData?.message || "Unable to log in. Please try again."
        );
        setShowPopup(true);
      }
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-[26px] font-bold leading-tight tracking-tight text-[#17243d] sm:text-[28px] landscape:text-[22px]">
        Sign in
      </h2>

      



      {error && !showPopup && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleLogin}
        className="mt-8 space-y-5 sm:mt-9 landscape:mt-4 landscape:space-y-3"
      >
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Username
          </label>

          <input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoComplete="username"
            disabled={btnLoading}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
                setShowPopup(false);
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={btnLoading}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 pr-11 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={btnLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#f5a623] px-4 text-[14px] font-semibold text-[#111827] shadow-sm transition hover:bg-[#efa01c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#f5a623] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 landscape:h-9 landscape:text-[13px]"
        >
          {btnLoading ? (
            <>
              <SpinnerButton />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="mt-20 sm:mt-24 landscape:mt-5 lg:mt-32">
        <p className="font-serif text-[11px] leading-5 text-[#d6b875] sm:text-[13px] sm:leading-6 landscape:text-[9px] landscape:leading-4 lg:text-[15px]">
          Copyright © Designed &amp; Developed by{" "}
          Goulart C. Cainhog Jr.
          <br />
          MITO Student in USTP-CDO
        </p>
      </div>

      {/* Login error popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => setShowPopup(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="login-error-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <XCircle size={32} className="text-red-600" />
            </div>

            <h3
              id="login-error-title"
              className="text-xl font-bold text-gray-900"
            >
              Login Failed
            </h3>

            <p className="mt-2 text-sm text-gray-600">{error}</p>

            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="mt-6 w-full rounded-lg bg-[#f5a623] px-4 py-3 font-semibold text-gray-900 transition hover:bg-[#efa01c]"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
