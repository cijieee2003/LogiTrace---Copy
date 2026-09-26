import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axiosClient.post(
        "/forgot-password",
        {
          email,
        }
      );

      setMessage(
        response.data.message ||
          "Password reset link has been sent."
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to send password reset email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">

      <h2 className="text-[26px] font-bold text-[#17243d] sm:text-[28px]">
        Forgot Password
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#617794]">
        Enter your email address and we will send you
        a password reset link.
      </p>

      {message && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >

        <div>

          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter your email"
            autoComplete="email"
            required
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center rounded-md bg-[#f5a623] px-4 text-sm font-semibold text-gray-900 transition hover:bg-[#efa01c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
        </button>

      </form>

      <div className="mt-6 text-center">

        <Link
          to="/login"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Login
        </Link>

      </div>

    </div>
  );
};

export default ForgotPassword;