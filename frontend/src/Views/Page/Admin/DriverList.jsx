
import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { useNavigate } from "react-router-dom";

import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  KeyIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  TruckIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const DriverList = () => {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [verification, setVerification] = useState("all");

  const [resettingId, setResettingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [selectedDriver, setSelectedDriver] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH DRIVERS
  |--------------------------------------------------------------------------
  */

  const fetchDrivers = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await axiosClient.get("/drivers");

      setDrivers(response.data?.drivers || []);
    } catch (error) {
      console.error("Failed to load drivers:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load drivers."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchDrivers();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | AUTO REFRESH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchDrivers(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | VIEW DRIVER
  |--------------------------------------------------------------------------
  */

  const handleView = (driver) => {
    setError("");
    setSuccess("");
    setSelectedDriver(driver);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE VIEW
  |--------------------------------------------------------------------------
  */

  const closeView = () => {
    setSelectedDriver(null);
  };

  /*
  |--------------------------------------------------------------------------
  | RESET PASSWORD
  |--------------------------------------------------------------------------
  */

  const handleResetPassword = async (driver) => {
    const confirmReset = window.confirm(
      `Are you sure you want to reset the password for ${driver.username}?\n\nA new random password will be generated and sent to:\n${driver.email}`
    );

    if (!confirmReset) {
      return;
    }

    try {
      setResettingId(driver.id);
      setError("");
      setSuccess("");

      const response = await axiosClient.post(
        `/admin/drivers/${driver.id}/reset-password`
      );

      setSuccess(
        response.data?.message ||
          "Password reset successfully. The new password has been sent to the driver's email."
      );
    } catch (error) {
      console.error(
        "Failed to reset driver password:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to reset driver password."
      );
    } finally {
      setResettingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE DRIVER
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (driver) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${driver.username}?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(driver.id);
      setError("");
      setSuccess("");

      await axiosClient.delete(`/drivers/${driver.id}`);

      setDrivers((previous) =>
        previous.filter(
          (item) => item.id !== driver.id
        )
      );

      if (selectedDriver?.id === driver.id) {
        setSelectedDriver(null);
      }

      setSuccess(
        "Driver deleted successfully."
      );
    } catch (error) {
      console.error(
        "Failed to delete driver:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete driver."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DRIVER NAME
  |--------------------------------------------------------------------------
  */

  const getDriverName = (driver) => {
    if (!driver?.driver) {
      return "Information not completed";
    }

    return [
      driver.driver.first_name,
      driver.driver.middle_name,
      driver.driver.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER DRIVERS
  |--------------------------------------------------------------------------
  */

  const filteredDrivers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return drivers.filter((driver) => {
      const driverName =
        getDriverName(driver).toLowerCase();

      const matchesSearch =
        !keyword ||
        String(driver.username || "")
          .toLowerCase()
          .includes(keyword) ||
        String(driver.email || "")
          .toLowerCase()
          .includes(keyword) ||
        driverName.includes(keyword) ||
        String(
          driver.driver?.license_number || ""
        )
          .toLowerCase()
          .includes(keyword) ||
        String(
          driver.driver?.truck_plate_number || ""
        )
          .toLowerCase()
          .includes(keyword);

      const isVerified =
        Boolean(driver.email_verified_at);

      const matchesVerification =
        verification === "all" ||
        (verification === "verified" &&
          isVerified) ||
        (verification === "not_verified" &&
          !isVerified);

      return (
        matchesSearch &&
        matchesVerification
      );
    });
  }, [drivers, search, verification]);

  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  const totalDrivers = drivers.length;

  const verifiedDrivers = drivers.filter(
    (driver) => Boolean(driver.email_verified_at)
  ).length;

  const unverifiedDrivers =
    totalDrivers - verifiedDrivers;

  const completedProfiles = drivers.filter(
    (driver) => Boolean(driver.driver)
  ).length;

  /*
  |--------------------------------------------------------------------------
  | DATE FORMAT
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

          <p className="text-sm text-gray-500">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =========================================================
          HEADER
      ========================================================== */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Driver Management
            </h1>

            {refreshing && (
              <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                Updating
              </div>
            )}

          </div>

          <p className="mt-1 text-sm text-gray-500">
            Manage registered drivers, accounts,
            verification, and driver information.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/registerdriver")
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <UserIcon className="h-5 w-5" />
          Register Driver
        </button>

      </div>

      {/* =========================================================
          SUCCESS MESSAGE
      ========================================================== */}

      {success && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">

          <div className="flex items-start gap-3">

            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

            <p className="text-sm font-medium text-green-700">
              {success}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="rounded-lg p-1 text-green-500 transition hover:bg-green-100 hover:text-green-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

        </div>
      )}

      {/* =========================================================
          ERROR MESSAGE
      ========================================================== */}

      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <div className="flex items-start gap-3">

            <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 text-red-500 transition hover:bg-red-100 hover:text-red-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

        </div>
      )}

      {/* =========================================================
          SUMMARY CARDS
      ========================================================== */}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Drivers
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {totalDrivers}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>

          </div>

        </div>

        {/* VERIFIED */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Verified
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {verifiedDrivers}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>

          </div>

        </div>

        {/* NOT VERIFIED */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Not Verified
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {unverifiedDrivers}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" />
            </div>

          </div>

        </div>

        {/* PROFILE COMPLETE */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Profile Completed
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {completedProfiles}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <CheckCircleIcon className="h-6 w-6 text-purple-600" />
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================
          DRIVER TABLE
      ========================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* FILTERS */}

        <div className="border-b border-gray-200 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* SEARCH */}

            <div className="relative w-full lg:max-w-md">

              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Search username, email, driver..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* VERIFICATION */}

            <select
              value={verification}
              onChange={(e) =>
                setVerification(e.target.value)
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">
                All Verification
              </option>

              <option value="verified">
                Verified
              </option>

              <option value="not_verified">
                Not Verified
              </option>
            </select>

          </div>

          <p className="mt-3 text-xs text-gray-400">
            Showing {filteredDrivers.length} of{" "}
            {drivers.length} drivers
          </p>

        </div>

        {/* DESKTOP TABLE */}

        <div className="hidden overflow-x-auto lg:block">

          <table className="w-full min-w-[1100px] text-left">

            <thead className="bg-gray-50 text-xs uppercase text-gray-500">

              <tr>

                <th className="px-6 py-4 font-semibold">
                  Driver
                </th>

                <th className="px-6 py-4 font-semibold">
                  Email
                </th>

                <th className="px-6 py-4 font-semibold">
                  Profile
                </th>

                <th className="px-6 py-4 font-semibold">
                  Verification
                </th>

                <th className="px-6 py-4 font-semibold">
                  License
                </th>

                <th className="px-6 py-4 text-right font-semibold">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredDrivers.length > 0 ? (

                filteredDrivers.map((driver) => (

                  <tr
                    key={driver.id}
                    className="transition hover:bg-gray-50"
                  >

                    {/* DRIVER */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-gray-800">
                            {driver.driver
                              ? getDriverName(driver)
                              : driver.username}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            @{driver.username}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* EMAIL */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2">

                        <EnvelopeIcon className="h-4 w-4 shrink-0 text-gray-400" />

                        <span className="text-sm text-gray-600">
                          {driver.email || "—"}
                        </span>

                      </div>

                    </td>

                    {/* PROFILE */}

                    <td className="px-6 py-4">

                      {driver.driver ? (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          Completed
                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          <ExclamationCircleIcon className="h-3.5 w-3.5" />
                          Incomplete
                        </span>

                      )}

                    </td>

                    {/* VERIFICATION */}

                    <td className="px-6 py-4">

                      {driver.email_verified_at ? (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          <ShieldCheckIcon className="h-3.5 w-3.5" />
                          Verified
                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          <ExclamationCircleIcon className="h-3.5 w-3.5" />
                          Not Verified
                        </span>

                      )}

                    </td>

                    {/* LICENSE */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2">

                        <IdentificationIcon className="h-4 w-4 text-gray-400" />

                        <span className="text-sm text-gray-600">
                          {driver.driver?.license_number ||
                            "—"}
                        </span>

                      </div>

                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleView(driver)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleResetPassword(
                              driver
                            )
                          }
                          disabled={
                            resettingId ===
                            driver.id
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <KeyIcon className="h-4 w-4" />

                          {resettingId ===
                          driver.id
                            ? "Resetting..."
                            : "Reset"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(driver)
                          }
                          disabled={
                            deletingId ===
                            driver.id
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <TrashIcon className="h-4 w-4" />

                          {deletingId ===
                          driver.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-14 text-center"
                  >

                    <UserGroupIcon className="mx-auto h-10 w-10 text-gray-300" />

                    <p className="mt-3 text-sm font-semibold text-gray-600">
                      No drivers found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try changing your search or
                      verification filter.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* =======================================================
            MOBILE DRIVER CARDS
        ======================================================== */}

        <div className="divide-y divide-gray-100 lg:hidden">

          {filteredDrivers.length > 0 ? (

            filteredDrivers.map((driver) => (

              <div
                key={driver.id}
                className="p-5"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-gray-800">
                        {driver.driver
                          ? getDriverName(driver)
                          : driver.username}
                      </p>

                      <p className="truncate text-xs text-gray-400">
                        @{driver.username}
                      </p>

                    </div>

                  </div>

                  {driver.email_verified_at ? (

                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                      Verified
                    </span>

                  ) : (

                    <span className="shrink-0 rounded-full bg-yellow-100 px-2.5 py-1 text-[10px] font-semibold text-yellow-700">
                      Pending
                    </span>

                  )}

                </div>

                <div className="mt-4 space-y-2">

                  <div className="flex items-start gap-2">

                    <EnvelopeIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <p className="break-all text-xs text-gray-600">
                      {driver.email || "—"}
                    </p>

                  </div>

                  <div className="flex items-start gap-2">

                    <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <p className="text-xs text-gray-600">
                      {driver.driver?.truck_plate_number ||
                        "No vehicle information"}
                    </p>

                  </div>

                  <div className="flex items-start gap-2">

                    <IdentificationIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <p className="text-xs text-gray-600">
                      {driver.driver?.license_number ||
                        "No license information"}
                    </p>

                  </div>

                </div>

                <div className="mt-4 flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      handleView(driver)
                    }
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleResetPassword(driver)
                    }
                    disabled={
                      resettingId === driver.id
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs font-medium text-orange-600 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <KeyIcon className="h-4 w-4" />

                    {resettingId === driver.id
                      ? "..."
                      : "Reset"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(driver)
                    }
                    disabled={
                      deletingId === driver.id
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <TrashIcon className="h-4 w-4" />

                    {deletingId === driver.id
                      ? "..."
                      : "Delete"}
                  </button>

                </div>

              </div>

            ))

          ) : (

            <div className="px-5 py-14 text-center">

              <UserGroupIcon className="mx-auto h-10 w-10 text-gray-300" />

              <p className="mt-3 text-sm font-semibold text-gray-600">
                No drivers found
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Try changing your search or
                verification filter.
              </p>

            </div>

          )}

        </div>

      </div>

      {/* =========================================================
          VIEW DRIVER MODAL
      ========================================================== */}

      {selectedDriver && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeView();
            }
          }}
        >

          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>

                <div className="min-w-0">

                  <h2 className="truncate text-lg font-bold text-gray-800 sm:text-xl">
                    {selectedDriver.driver
                      ? getDriverName(
                          selectedDriver
                        )
                      : selectedDriver.username}
                  </h2>

                  <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
                    @{selectedDriver.username}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeView}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="p-5 sm:p-6">

              {/* ACCOUNT INFORMATION */}

              <div className="mb-7">

                <div className="mb-4 flex items-center gap-2">

                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />

                  <h3 className="text-sm font-bold text-gray-800">
                    Account Information
                  </h3>

                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <p className="text-xs font-medium text-gray-400">
                      Username
                    </p>

                    <p className="mt-2 break-all text-sm font-semibold text-gray-800">
                      {selectedDriver.username ||
                        "—"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <p className="text-xs font-medium text-gray-400">
                      Email
                    </p>

                    <p className="mt-2 break-all text-sm font-semibold text-gray-800">
                      {selectedDriver.email ||
                        "—"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <p className="text-xs font-medium text-gray-400">
                      Email Verification
                    </p>

                    <div className="mt-2">

                      {selectedDriver.email_verified_at ? (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          <CheckCircleIcon className="h-4 w-4" />
                          Verified
                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                          <ExclamationCircleIcon className="h-4 w-4" />
                          Not Verified
                        </span>

                      )}

                    </div>

                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <p className="text-xs font-medium text-gray-400">
                      Driver Information
                    </p>

                    <div className="mt-2">

                      {selectedDriver.driver ? (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          <CheckCircleIcon className="h-4 w-4" />
                          Completed
                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          <ExclamationCircleIcon className="h-4 w-4" />
                          Incomplete
                        </span>

                      )}

                    </div>

                  </div>

                </div>

              </div>

              {selectedDriver.driver ? (

                <>
                  {/* PERSONAL INFORMATION */}

                  <div className="mb-7 border-t border-gray-200 pt-7">

                    <div className="mb-4 flex items-center gap-2">

                      <UserIcon className="h-5 w-5 text-blue-600" />

                      <h3 className="text-sm font-bold text-gray-800">
                        Personal Information
                      </h3>

                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div className="rounded-xl border border-gray-200 bg-white p-4">

                        <p className="text-xs font-medium text-gray-400">
                          Full Name
                        </p>

                        <p className="mt-2 text-sm font-semibold text-gray-800">
                          {getDriverName(
                            selectedDriver
                          )}
                        </p>

                      </div>

                      <div className="rounded-xl border border-gray-200 bg-white p-4">

                        <div className="flex items-center gap-2">

                          <CalendarDaysIcon className="h-4 w-4 text-gray-400" />

                          <p className="text-xs font-medium text-gray-400">
                            Birth Date
                          </p>

                        </div>

                        <p className="mt-2 text-sm font-semibold text-gray-800">
                          {formatDate(
                            selectedDriver.driver
                              .birth_date
                          )}
                        </p>

                      </div>

                      <div className="rounded-xl border border-gray-200 bg-white p-4">

                        <p className="text-xs font-medium text-gray-400">
                          Age
                        </p>

                        <p className="mt-2 text-sm font-semibold text-gray-800">
                          {selectedDriver.driver
                            .age ?? "—"}
                        </p>

                      </div>

                      <div className="rounded-xl border border-gray-200 bg-white p-4">

                        <p className="text-xs font-medium text-gray-400">
                          Gender
                        </p>

                        <p className="mt-2 text-sm font-semibold capitalize text-gray-800">
                          {selectedDriver.driver
                            .gender || "—"}
                        </p>

                      </div>

                      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:col-span-2">

                        <div className="flex items-start gap-2">

                          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                          <div>

                            <p className="text-xs font-medium text-gray-400">
                              Address
                            </p>

                            <p className="mt-2 text-sm font-semibold leading-6 text-gray-800">
                              {selectedDriver.driver
                                .address || "—"}
                            </p>

                          </div>

                        </div>

                      </div>

                      <div className="rounded-xl border border-gray-200 bg-white p-4">

                        <div className="flex items-center gap-2">

                          <PhoneIcon className="h-4 w-4 text-gray-400" />

                          <p className="text-xs font-medium text-gray-400">
                            Contact Number
                          </p>

                        </div>

                        <p className="mt-2 text-sm font-semibold text-gray-800">
                          {selectedDriver.driver
                            .contact_number ||
                            "—"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* LICENSE */}

                  <div className="mb-7 border-t border-gray-200 pt-7">

                    <div className="mb-4 flex items-center gap-2">

                      <IdentificationIcon className="h-5 w-5 text-blue-600" />

                      <h3 className="text-sm font-bold text-gray-800">
                        Driver's License
                      </h3>

                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                        <p className="text-xs font-medium text-gray-400">
                          License Number
                        </p>

                        <p className="mt-2 text-sm font-semibold text-gray-800">
                          {selectedDriver.driver
                            .license_number ||
                            "—"}
                        </p>

                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                        <div className="flex items-center gap-2">

                          <CalendarDaysIcon className="h-4 w-4 text-gray-400" />

                          <p className="text-xs font-medium text-gray-400">
                            License Expiration
                          </p>

                        </div>

                        <p className="mt-2 text-sm font-semibold text-gray-800">
                          {formatDate(
                            selectedDriver.driver
                              .license_expiration
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* VEHICLE */}

                  <div className="border-t border-gray-200 pt-7">

                    <div className="mb-4 flex items-center gap-2">

                      <TruckIcon className="h-5 w-5 text-blue-600" />

                      <h3 className="text-sm font-bold text-gray-800">
                        Driver's Vehicle
                      </h3>

                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                        <p className="text-xs font-medium text-gray-400">
                          Plate Number
                        </p>

                        <p className="mt-2 text-sm font-semibold text-gray-800">
                          {selectedDriver.driver
                            .truck_plate_number ||
                            "—"}
                        </p>

                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                        <p className="text-xs font-medium text-gray-400">
                          Truck Name
                        </p>

                        <p className="mt-2 text-sm font-semibold text-gray-800">
                          {selectedDriver.driver
                            .truck_name || "—"}
                        </p>

                      </div>

                    </div>

                  </div>
                </>

              ) : (

                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">

                  <div className="flex items-start gap-3">

                    <ExclamationCircleIcon className="h-6 w-6 shrink-0 text-yellow-600" />

                    <div>

                      <p className="text-sm font-semibold text-yellow-800">
                        Driver information not completed
                      </p>

                      <p className="mt-1 text-sm leading-6 text-yellow-700">
                        This driver has not completed
                        their personal information,
                        driver's license, and vehicle
                        details yet.
                      </p>

                    </div>

                  </div>

                </div>

              )}

            </div>

           

          </div>

        </div>

      )}

    </div>
  );
};

export default DriverList;

