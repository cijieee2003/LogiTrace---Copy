import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] =
        useState("");

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
                "/password/reset",
                {
                    token,
                    email,
                    password,
                    password_confirmation:
                        passwordConfirmation,
                }
            );

            setMessage(
                response.data.message ||
                    "Password reset successfully."
            );

            setPassword("");
            setPasswordConfirmation("");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            console.error(error);

            if (error.response?.data?.errors) {
                const errors =
                    error.response.data.errors;

                const firstError =
                    Object.values(errors)[0]?.[0];

                setError(
                    firstError ||
                        "Unable to reset password."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                        "Unable to reset password."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="w-full">
                <h2 className="text-2xl font-bold text-[#17243d]">
                    Invalid Reset Link
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    This password reset link is missing
                    required information.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">

            <h2 className="text-2xl font-bold text-[#17243d]">
                Reset Password
            </h2>

            <p className="mt-2 text-sm text-gray-500">
                Create a new password for your LogiTrace account.
            </p>

            {message && (
                <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                    <p className="mt-1 text-xs">
                        Redirecting to login...
                    </p>
                </div>
            )}

            {error && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
            >

                <div>
                    <label
                        htmlFor="password"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        New Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        minLength={8}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="password_confirmation"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Confirm New Password
                    </label>

                    <input
                        id="password_confirmation"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) =>
                            setPasswordConfirmation(
                                e.target.value
                            )
                        }
                        minLength={8}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? "Resetting Password..."
                        : "Reset Password"}
                </button>

            </form>

        </div>
    );
};

export default ResetPassword;