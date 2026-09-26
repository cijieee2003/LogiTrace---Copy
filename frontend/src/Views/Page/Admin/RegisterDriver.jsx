
import React, { useState } from "react";
import {
    UserIcon,
    EnvelopeIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    XMarkIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import axiosClient from "../../../api/axiosClient";

const RegisterDriver = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");

        try {
            const response = await axiosClient.post(
                "/registerDriver",
                formData
            );

            setSuccess(
                response.data.message ||
                    "Driver account created successfully."
            );

            setFormData({
                username: "",
                email: "",
            });
        } catch (error) {
            console.error("Register driver error:", error);

            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;

                const messages = Object.values(validationErrors || {})
                    .flat()
                    .join(" ");

                setError(
                    messages ||
                        "Please check the information you entered."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                        "Unable to register the driver. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const clearMessages = () => {
        setSuccess("");
        setError("");
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-3xl">
                {/* Page Header */}
                <div className="mb-6">
                   

                    <h1 className="text-2xl font-bold tracking-tight text-[#1f2937] sm:text-3xl">
                        Register Driver
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-[#637895]">
                        Create a driver account and send the driver their
                        email verification and temporary login credentials.
                    </p>
                </div>

                {/* Main Card */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {/* Card Header */}
                    <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-5 sm:px-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                                <UserIcon className="h-5 w-5 text-white" />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold text-gray-800 sm:text-base">
                                    Driver Account Details
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                    Enter the basic information required to
                                    create the account.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 sm:p-7">
                        {/* Success Message */}
                        {success && (
                            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm font-semibold text-green-800">
                                                Registration Successful
                                            </p>

                                            <button
                                                type="button"
                                                onClick={clearMessages}
                                                className="rounded-lg p-1 text-green-600 transition hover:bg-green-100"
                                                aria-label="Close success message"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <p className="mt-1 text-sm leading-5 text-green-700">
                                            {success}
                                        </p>

                                        <div className="mt-3 rounded-lg border border-green-200 bg-white/60 p-3">
                                            <p className="text-xs leading-5 text-green-700">
                                                The driver should check their
                                                email for the verification
                                                link and temporary password.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                                <div className="flex items-start gap-3">
                                    <ExclamationCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm font-semibold text-red-800">
                                                Registration Failed
                                            </p>

                                            <button
                                                type="button"
                                                onClick={clearMessages}
                                                className="rounded-lg p-1 text-red-600 transition hover:bg-red-100"
                                                aria-label="Close error message"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <p className="mt-1 text-sm leading-5 text-red-700">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Registration Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            {/* Username */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                >
                                    Username
                                </label>

                                <div className="relative">
                                    <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter driver username"
                                        autoComplete="username"
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    />
                                </div>

                                <p className="mt-1.5 text-xs text-gray-400">
                                    The driver will use this username to sign
                                    in to LogiTrace.
                                </p>
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                >
                                    Driver Email
                                </label>

                                <div className="relative">
                                    <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="driver@gmail.com"
                                        autoComplete="email"
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    />
                                </div>

                                <p className="mt-1.5 text-xs text-gray-400">
                                    The verification link and temporary
                                    password will be sent to this email.
                                </p>
                            </div>

                            {/* Account Information */}
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
                                <div className="flex items-start gap-3">
                                    <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                                    <div>
                                        <p className="text-sm font-semibold text-blue-800">
                                            How the driver account works
                                        </p>

                                        <ul className="mt-2 space-y-1.5 text-xs leading-5 text-blue-700 sm:text-sm">
                                            <li>
                                                • The system automatically
                                                generates a temporary password.
                                            </li>

                                            <li>
                                                • The driver receives the
                                                password and verification link
                                                through email.
                                            </li>

                                            <li>
                                                • After verification, the
                                                driver can continue with their
                                                account setup.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                        Creating Driver Account...
                                    </>
                                ) : (
                                    <>
                                        <UserIcon className="h-5 w-5" />
                                        Register Driver
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-4 flex items-center justify-center gap-2 px-4 text-center">
                    <EnvelopeIcon className="h-4 w-4 shrink-0 text-gray-400" />

                    <p className="text-xs leading-5 text-gray-400">
                        Make sure the driver's email address is correct before
                        creating the account.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterDriver;

