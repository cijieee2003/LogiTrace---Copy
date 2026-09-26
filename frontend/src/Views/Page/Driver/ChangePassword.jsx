
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { useStateContext } from "../../../context/AuthProvider";

const LockIcon = () => (
    <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M16 11V7a4 4 0 10-8 0v4M6 11h12a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2z"
        />
    </svg>
);

const EyeIcon = ({ open }) => (
    <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        {open ? (
            <>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />

                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
            </>
        ) : (
            <>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3 3l18 18"
                />

                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M10.584 10.587a2 2 0 002.829 2.828"
                />

                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9.88 5.09A9.03 9.03 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.04 9.04 0 01-4.133 5.07"
                />

                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M6.228 6.228A9.03 9.03 0 002.458 12C3.732 16.057 7.523 19 12 19c1.61 0 3.13-.397 4.46-1.098"
                />
            </>
        )}
    </svg>
);

const CheckIcon = () => (
    <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
        />
    </svg>
);

/*
|--------------------------------------------------------------------------
| PASSWORD INPUT
|--------------------------------------------------------------------------
*/

const PasswordInput = ({
    id,
    label,
    name,
    placeholder,
    value,
    visible,
    onToggle,
    onChange,
    minLength,
}) => {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-sm font-semibold text-slate-700"
            >
                {label}
            </label>

            <div className="relative">

                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <LockIcon />
                </div>

                <input
                    id={id}
                    name={name}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    minLength={minLength}
                    required
                    autoComplete={
                        name === "current_password"
                            ? "current-password"
                            : "new-password"
                    }
                    className="
                        w-full rounded-xl border border-slate-200
                        bg-slate-50 py-3.5 pl-12 pr-12
                        text-sm text-slate-800
                        placeholder:text-slate-400
                        transition-all duration-200
                        hover:border-slate-300
                        focus:border-blue-500 focus:bg-white
                        focus:outline-none
                        focus:ring-4 focus:ring-blue-500/10
                    "
                />

                <button
                    type="button"
                    onClick={onToggle}
                    className="
                        absolute inset-y-0 right-0 flex items-center
                        px-4 text-slate-400
                        transition hover:text-slate-600
                    "
                    aria-label={
                        visible
                            ? `Hide ${label}`
                            : `Show ${label}`
                    }
                >
                    <EyeIcon open={visible} />
                </button>

            </div>
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| CHANGE PASSWORD
|--------------------------------------------------------------------------
*/

const ChangePassword = () => {

    const navigate = useNavigate();

    const { logout } = useStateContext();

    const [form, setForm] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState({
        current_password: false,
        new_password: false,
        new_password_confirmation: false,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | HANDLE INPUT
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (message) setMessage("");
        if (error) setError("");
    };

    /*
    |--------------------------------------------------------------------------
    | TOGGLE PASSWORD
    |--------------------------------------------------------------------------
    */

    const togglePassword = (field) => {
        setShowPassword((previous) => ({
            ...previous,
            [field]: !previous[field],
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setMessage("");
        setError("");

        /*
        |--------------------------------------------------------------------------
        | CLIENT VALIDATION
        |--------------------------------------------------------------------------
        */

        if (form.new_password.length < 8) {
            setError(
                "The new password must be at least 8 characters."
            );
            return;
        }

        if (
            form.new_password !==
            form.new_password_confirmation
        ) {
            setError(
                "The new password and confirmation password do not match."
            );
            return;
        }

        if (
            form.current_password ===
            form.new_password
        ) {
            setError(
                "Your new password must be different from your current password."
            );
            return;
        }

        setLoading(true);

        try {

            /*
            |--------------------------------------------------------------------------
            | CHANGE PASSWORD
            |--------------------------------------------------------------------------
            */

            const response = await axiosClient.post(
                "/driver/change-password",
                {
                    current_password:
                        form.current_password,

                    new_password:
                        form.new_password,

                    new_password_confirmation:
                        form.new_password_confirmation,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | SHOW SUCCESS
            |--------------------------------------------------------------------------
            */

            setMessage(
                response.data?.message ||
                    "Your password has been changed successfully."
            );

            /*
            |--------------------------------------------------------------------------
            | CLEAR FORM
            |--------------------------------------------------------------------------
            */

            setForm({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });

            setShowPassword({
                current_password: false,
                new_password: false,
                new_password_confirmation: false,
            });

            /*
            |--------------------------------------------------------------------------
            | FIRST-LOGIN ONBOARDING COMPLETE
            |--------------------------------------------------------------------------
            |
            | The driver has now:
            |
            | 1. Verified email
            | 2. Completed profile
            | 3. Changed temporary password
            |
            | We automatically logout so the driver must login
            | again using the new password.
            |
            |--------------------------------------------------------------------------
            */

            setTimeout(async () => {

                await logout();

                navigate("/login", {
                    replace: true,
                });

            }, 2000);

        } catch (err) {

            console.error(
                "Change password error:",
                err
            );

            if (err.response?.data?.errors) {

                const errors =
                    err.response.data.errors;

                const firstError =
                    Object.values(errors)
                        .flat()
                        .find(Boolean);

                setError(
                    firstError ||
                        "Please check your password details."
                );

            } else {

                setError(
                    err.response?.data?.message ||
                        "Unable to change your password. Please try again."
                );
            }

        } finally {

            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | PASSWORD REQUIREMENTS
    |--------------------------------------------------------------------------
    */

    const passwordLengthValid =
        form.new_password.length >= 8;

    const passwordsMatch =
        form.new_password.length > 0 &&
        form.new_password ===
            form.new_password_confirmation;

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-3xl">

                {/* Header */}

                <div className="mb-8">

                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <LockIcon />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-[#17243d] sm:text-3xl">
                        Change Password
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        For your security, please change your
                        temporary password before continuing.
                    </p>

                </div>

                {/* Success */}

                {message && (
                    <div
                        role="alert"
                        className="
                            mb-6 rounded-xl border
                            border-emerald-200
                            bg-emerald-50 p-4
                            text-sm text-emerald-700
                        "
                    >

                        <div className="flex items-start gap-3">

                            <div className="
                                mt-0.5 flex h-6 w-6 shrink-0
                                items-center justify-center
                                rounded-full bg-emerald-100
                            ">
                                <CheckIcon />
                            </div>

                            <div>

                                <p className="font-semibold">
                                    Password updated
                                </p>

                                <p className="mt-1 text-emerald-600">
                                    {message}
                                </p>

                                <p className="mt-2 text-xs text-emerald-600">
                                    You will be logged out
                                    automatically. Please
                                    login again using your
                                    new password.
                                </p>

                            </div>

                        </div>

                    </div>
                )}

                {/* Error */}

                {error && (
                    <div
                        role="alert"
                        className="
                            mb-6 rounded-xl border
                            border-red-200
                            bg-red-50 p-4
                            text-sm text-red-700
                        "
                    >

                        <div className="flex items-start gap-3">

                            <div className="
                                flex h-6 w-6 shrink-0
                                items-center justify-center
                                rounded-full bg-red-100
                                font-bold text-red-600
                            ">
                                !
                            </div>

                            <div>

                                <p className="font-semibold">
                                    Unable to update password
                                </p>

                                <p className="mt-1 text-red-600">
                                    {error}
                                </p>

                            </div>

                        </div>

                    </div>
                )}

                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    aria-busy={loading}
                    className="
                        overflow-hidden rounded-2xl
                        border border-slate-200
                        bg-white
                        shadow-[0_8px_30px_rgba(15,23,42,0.06)]
                    "
                >

                    {/* Card header */}

                    <div className="
                        border-b border-slate-100
                        bg-slate-50/70
                        px-5 py-5
                        sm:px-7
                    ">

                        <h2 className="text-base font-semibold text-slate-800">
                            Password settings
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Enter your current password and
                            choose a new one.
                        </p>

                    </div>

                    {/* Form fields */}

                    <div className="
                        space-y-6
                        px-5 py-6
                        sm:px-7 sm:py-8
                    ">

                        <PasswordInput
                            id="current_password"
                            name="current_password"
                            label="Current Password"
                            placeholder="Enter your current password"
                            value={form.current_password}
                            visible={
                                showPassword.current_password
                            }
                            onToggle={() =>
                                togglePassword(
                                    "current_password"
                                )
                            }
                            onChange={handleChange}
                        />

                        <div className="border-t border-slate-100" />

                        <PasswordInput
                            id="new_password"
                            name="new_password"
                            label="New Password"
                            placeholder="Create a new password"
                            value={form.new_password}
                            visible={
                                showPassword.new_password
                            }
                            onToggle={() =>
                                togglePassword(
                                    "new_password"
                                )
                            }
                            onChange={handleChange}
                            minLength={8}
                        />

                        {/* Requirements */}

                        <div className="rounded-xl bg-slate-50 p-4">

                            <p className="
                                mb-3 text-xs font-semibold
                                uppercase tracking-wide
                                text-slate-500
                            ">
                                Password requirements
                            </p>

                            <div className="
                                grid gap-2
                                sm:grid-cols-2
                            ">

                                <Requirement
                                    valid={passwordLengthValid}
                                    text="At least 8 characters"
                                />

                                <Requirement
                                    valid={passwordsMatch}
                                    text="Passwords match"
                                />

                            </div>

                        </div>

                        <PasswordInput
                            id="new_password_confirmation"
                            name="new_password_confirmation"
                            label="Confirm New Password"
                            placeholder="Re-enter your new password"
                            value={
                                form.new_password_confirmation
                            }
                            visible={
                                showPassword
                                    .new_password_confirmation
                            }
                            onToggle={() =>
                                togglePassword(
                                    "new_password_confirmation"
                                )
                            }
                            onChange={handleChange}
                            minLength={8}
                        />

                    </div>

                    {/* Footer */}

                    <div className="
                        flex flex-col gap-3
                        border-t border-slate-100
                        bg-slate-50/50
                        px-5 py-5
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:px-7
                    ">

                        <p className="text-xs text-slate-400">
                            Use a password you don't use on
                            other websites.
                        </p>

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                flex w-full items-center
                                justify-center gap-2
                                rounded-xl bg-[#2563eb]
                                px-6 py-3.5
                                text-sm font-semibold
                                text-white shadow-sm
                                shadow-blue-500/20
                                transition-all duration-200
                                hover:bg-[#1d4ed8]
                                hover:shadow-md
                                focus:outline-none
                                focus:ring-4
                                focus:ring-blue-500/20
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                                sm:w-auto
                            "
                        >

                            {loading && (
                                <span
                                    aria-hidden="true"
                                    className="
                                        h-4 w-4 animate-spin
                                        rounded-full border-2
                                        border-white/30
                                        border-t-white
                                    "
                                />
                            )}

                            <span>
                                {loading
                                    ? "Changing Password..."
                                    : "Update Password"}
                            </span>

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

/*
|--------------------------------------------------------------------------
| PASSWORD REQUIREMENT
|--------------------------------------------------------------------------
*/

const Requirement = ({ valid, text }) => (
    <div
        className={`flex items-center gap-2 text-xs ${
            valid
                ? "text-emerald-600"
                : "text-slate-400"
        }`}
    >

        <span
            className={`flex h-5 w-5 items-center justify-center rounded-full ${
                valid
                    ? "bg-emerald-100"
                    : "bg-slate-200"
            }`}
        >

            {valid ? (
                <CheckIcon />
            ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            )}

        </span>

        {text}

    </div>
);

export default ChangePassword;

