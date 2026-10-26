import { useState } from "react";
import { useStateContext } from "../../../context/AuthProvider";
import SpinnerButton from "../../Components/SpinnerButton";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const {
        login,
        btnLoading,
    } = useStateContext();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        if (!username || !password) {
            setError("Please enter your username and password.");
            return;
        }

        try {
            await login({
                username,
                password,
            });
        } catch (error) {
            console.error("Login error:", error);

            const message =
                error.response?.data?.message ||
                error.response?.data?.errors?.username?.[0] ||
                "Unable to login. Please check your credentials.";

            setError(message);
        }
    };

    return (
        <div className="w-full">

            {/* TITLE */}
            <h2 className="text-[26px] font-bold leading-tight tracking-tight text-[#17243d] sm:text-[28px] landscape:text-[22px]">
                Sign in
            </h2>

            {/* SUBTITLE */}
            {/* <p className="mt-2 text-[14px] leading-6 text-[#617794] sm:text-[15px] landscape:mt-1 landscape:text-[13px]">
                Access your role’s dashboard.
            </p> */}

            {/* ERROR */}
            {error && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-700">
                        {error}
                    </p>
                </div>
            )}

            {/* FORM */}
            <form
                onSubmit={handleLogin}
                className="mt-8 space-y-5 sm:mt-9 landscape:mt-4 landscape:space-y-3"
            >

                {/* USERNAME */}
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
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        placeholder="Enter your username"
                        autoComplete="username"
                        disabled={btnLoading}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                        required
                    />
                </div>

                {/* PASSWORD */}
                <div>
                    <label
                        htmlFor="password"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={btnLoading}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                        required
                    />
                </div>

                {/* LOGIN BUTTON */}
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

            {/* COPYRIGHT */}
            <div className="mt-20 sm:mt-24 landscape:mt-5 lg:mt-32">
                <p className="font-serif text-[11px] leading-5 text-[#d6b875] sm:text-[13px] sm:leading-6 landscape:text-[9px] landscape:leading-4 lg:text-[15px]">
                    Copyright © Designed &amp; Developed by
                    Goulart C. Cainhog Jr.
                    <br />
                    MITO Student in USTP-CDO
                </p>
            </div>

        </div>
    );
};

export default Login;