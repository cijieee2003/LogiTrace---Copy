
import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../../api/axiosClient";

import {
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

const IncidentClassificationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [reviewStatus, setReviewStatus] = useState("approved");
  const [department, setDepartment] = useState("");
  const [departmentEmail, setDepartmentEmail] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH REQUESTS
  |--------------------------------------------------------------------------
  */

  const fetchRequests = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axiosClient.get(
        "/admin/incident-classification-requests"
      );

      setRequests(response.data?.requests || []);
    } catch (error) {
      console.error(
        "Failed to load incident classification requests:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load incident classification requests."
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
    fetchRequests();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | AUTO REFRESH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && !showReviewModal) {
        fetchRequests(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [showReviewModal]);

  /*
  |--------------------------------------------------------------------------
  | OPEN REVIEW MODAL
  |--------------------------------------------------------------------------
  */

  const openReviewModal = (request) => {
    setSelectedRequest(request);
    setReviewStatus("approved");
    setDepartment("");
    setDepartmentEmail("");
    setAdminRemarks("");
    setError("");
    setShowReviewModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE REVIEW MODAL
  |--------------------------------------------------------------------------
  */

  const closeReviewModal = () => {
    if (reviewing) {
      return;
    }

    setShowReviewModal(false);
    setSelectedRequest(null);
    setReviewStatus("approved");
    setDepartment("");
    setDepartmentEmail("");
    setAdminRemarks("");
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | REVIEW REQUEST
  |--------------------------------------------------------------------------
  */

  const handleReview = async (event) => {
    event.preventDefault();

    if (!selectedRequest) {
      return;
    }

    setError("");
    setSuccess("");

    if (
      reviewStatus === "approved" &&
      !department.trim()
    ) {
      setError("Please enter the department.");
      return;
    }

    if (
      reviewStatus === "approved" &&
      !departmentEmail.trim()
    ) {
      setError("Please enter the department email.");
      return;
    }

    try {
      setReviewing(true);

      const response = await axiosClient.put(
        `/admin/incident-classification-requests/${selectedRequest.id}/review`,
        {
          status: reviewStatus,
          department:
            reviewStatus === "approved"
              ? department.trim()
              : null,
          department_email:
            reviewStatus === "approved"
              ? departmentEmail.trim()
              : null,
          admin_remarks: adminRemarks.trim() || null,
        }
      );

      setSuccess(
        response.data?.message ||
          "Request reviewed successfully."
      );

      setShowReviewModal(false);
      setSelectedRequest(null);

      await fetchRequests();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error(
        "Failed to review request:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to review the request."
      );
    } finally {
      setReviewing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STATUS HELPERS
  |--------------------------------------------------------------------------
  */

  const getStatusLabel = (status) => {
    if (!status) {
      return "Unknown";
    }

    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "approved":
        return "border-green-200 bg-green-100 text-green-700";

      case "rejected":
        return "border-red-200 bg-red-100 text-red-700";

      default:
        return "border-yellow-200 bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon className="h-4 w-4" />;

      case "rejected":
        return <XCircleIcon className="h-4 w-4" />;

      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FILTERED REQUESTS
  |--------------------------------------------------------------------------
  */

  const filteredRequests = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return requests.filter((request) => {
      const username = String(
        request.requester?.username || ""
      ).toLowerCase();

      const email = String(
        request.requester?.email || ""
      ).toLowerCase();

      const incidentType = String(
        request.incident_type || ""
      ).toLowerCase();

      const reason = String(
        request.reason || ""
      ).toLowerCase();

      const matchesSearch =
        !keyword ||
        username.includes(keyword) ||
        email.includes(keyword) ||
        incidentType.includes(keyword) ||
        reason.includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  const totalRequests = requests.length;

  const pendingRequests = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const approvedRequests = requests.filter(
    (request) => request.status === "approved"
  ).length;

  const rejectedRequests = requests.filter(
    (request) => request.status === "rejected"
  ).length;

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
              Incident Classification Requests
            </h1>

            {refreshing && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                Updating
              </span>
            )}

          </div>

          <p className="mt-1 text-sm text-gray-500">
            Review incident types submitted by drivers
            before adding them to the classification list.
          </p>
        </div>

      </div>

      {/* =========================================================
          SUCCESS
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
          ERROR
      ========================================================== */}

      {error && !showReviewModal && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <div className="flex items-start gap-3">

            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

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
                Total Requests
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {totalRequests}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>

          </div>

        </div>

        {/* PENDING */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {pendingRequests}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>

          </div>

        </div>

        {/* APPROVED */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Approved
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {approvedRequests}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>

          </div>

        </div>

        {/* REJECTED */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Rejected
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {rejectedRequests}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================
          REQUEST LIST
      ========================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* FILTER BAR */}

        <div className="border-b border-gray-200 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">

              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search driver, incident type..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>

          </div>

          <p className="mt-3 text-xs text-gray-400">
            Showing {filteredRequests.length} of{" "}
            {requests.length} requests
          </p>

        </div>

        {/* =======================================================
            DESKTOP TABLE
        ======================================================== */}

        <div className="hidden overflow-x-auto md:block">

          <table className="w-full min-w-[950px] text-left">

            <thead className="bg-gray-50 text-xs uppercase text-gray-500">

              <tr>

                <th className="px-6 py-4 font-semibold">
                  Driver
                </th>

                <th className="px-6 py-4 font-semibold">
                  Incident Type
                </th>

                <th className="px-6 py-4 font-semibold">
                  Reason
                </th>

                <th className="px-6 py-4 font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 text-right font-semibold">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredRequests.length > 0 ? (

                filteredRequests.map((item) => (

                  <tr
                    key={item.id}
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
                            {item.requester?.username ||
                              "Unknown Driver"}
                          </p>

                          <p className="truncate text-xs text-gray-400">
                            {item.requester?.email ||
                              "No email"}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* INCIDENT TYPE */}

                    <td className="px-6 py-4">

                      <p className="text-sm font-semibold text-gray-700">
                        {item.incident_type || "—"}
                      </p>

                    </td>

                    {/* REASON */}

                    <td className="max-w-[350px] px-6 py-4">

                      <p className="line-clamp-2 text-sm leading-6 text-gray-500">
                        {item.reason || "No reason provided."}
                      </p>

                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          item.status
                        )}`}
                      >
                        {getStatusIcon(item.status)}
                        {getStatusLabel(item.status)}
                      </span>

                    </td>

                    {/* ACTION */}

                    <td className="px-6 py-4 text-right">

                      {item.status === "pending" ? (

                        <button
                          type="button"
                          onClick={() =>
                            openReviewModal(item)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                          Review
                        </button>

                      ) : (

                        <span className="text-xs font-medium text-gray-400">
                          Reviewed
                        </span>

                      )}

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="px-6 py-14 text-center"
                  >

                    <ExclamationTriangleIcon className="mx-auto h-10 w-10 text-gray-300" />

                    <p className="mt-3 text-sm font-semibold text-gray-600">
                      No requests found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try changing your search or
                      status filter.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* =======================================================
            MOBILE CARDS
        ======================================================== */}

        <div className="divide-y divide-gray-100 md:hidden">

          {filteredRequests.length > 0 ? (

            filteredRequests.map((item) => (

              <div
                key={item.id}
                className="p-5"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-gray-800">
                        {item.requester?.username ||
                          "Unknown Driver"}
                      </p>

                      <p className="truncate text-xs text-gray-400">
                        {item.requester?.email ||
                          "No email"}
                      </p>

                    </div>

                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClasses(
                      item.status
                    )}`}
                  >
                    {getStatusIcon(item.status)}
                    {getStatusLabel(item.status)}
                  </span>

                </div>

                <div className="mt-5">

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Incident Type
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-700">
                    {item.incident_type || "—"}
                  </p>

                </div>

                <div className="mt-4">

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Reason
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    {item.reason ||
                      "No reason provided."}
                  </p>

                </div>

                {item.status === "pending" && (

                  <button
                    type="button"
                    onClick={() =>
                      openReviewModal(item)
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Review Request
                  </button>

                )}

              </div>

            ))

          ) : (

            <div className="px-5 py-14 text-center">

              <ExclamationTriangleIcon className="mx-auto h-10 w-10 text-gray-300" />

              <p className="mt-3 text-sm font-semibold text-gray-600">
                No requests found
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Try changing your search or status
                filter.
              </p>

            </div>

          )}

        </div>

      </div>

      {/* =========================================================
          REVIEW MODAL
      ========================================================== */}

      {showReviewModal && selectedRequest && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !reviewing
            ) {
              closeReviewModal();
            }
          }}
        >

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">

              <div>

                <h2 className="text-lg font-bold text-gray-800">
                  Review Classification Request
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Review the driver's request before
                  approving or rejecting it.
                </p>

              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                disabled={reviewing}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <form
              onSubmit={handleReview}
              className="p-5 sm:p-6"
            >

              {/* REQUEST SUMMARY */}

              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-gray-800">
                      {selectedRequest.requester
                        ?.username ||
                        "Unknown Driver"}
                    </p>

                    <p className="text-xs text-gray-400">
                      {selectedRequest.requester
                        ?.email || "No email"}
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Incident Type
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {selectedRequest.incident_type ||
                        "—"}
                    </p>

                  </div>

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Current Status
                    </p>

                    <span
                      className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        selectedRequest.status
                      )}`}
                    >
                      {getStatusIcon(
                        selectedRequest.status
                      )}

                      {getStatusLabel(
                        selectedRequest.status
                      )}
                    </span>

                  </div>

                </div>

                <div className="mt-5 border-t border-gray-200 pt-4">

                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Driver's Reason
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {selectedRequest.reason ||
                      "No reason provided."}
                  </p>

                </div>

              </div>

              {/* DECISION */}

              <div className="mb-6">

                <label className="mb-3 block text-sm font-semibold text-gray-800">
                  Decision
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() =>
                      setReviewStatus("approved")
                    }
                    disabled={reviewing}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      reviewStatus === "approved"
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <CheckIcon className="h-5 w-5" />
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setReviewStatus("rejected")
                    }
                    disabled={reviewing}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      reviewStatus === "rejected"
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <XMarkIcon className="h-5 w-5" />
                    Reject
                  </button>

                </div>

              </div>

              {/* APPROVAL DETAILS */}

              {reviewStatus === "approved" && (

                <div className="mb-6 rounded-xl border border-green-200 bg-green-50/50 p-5">

                  <div className="mb-4 flex items-center gap-2">

                    <BuildingOfficeIcon className="h-5 w-5 text-green-600" />

                    <h3 className="text-sm font-bold text-gray-800">
                      Department Information
                    </h3>

                  </div>

                  <div className="space-y-4">

                    <div>

                      <label className="mb-2 block text-xs font-semibold text-gray-700">
                        Department
                      </label>

                      <input
                        type="text"
                        value={department}
                        onChange={(event) =>
                          setDepartment(
                            event.target.value
                          )
                        }
                        placeholder="Example: Warehouse"
                        disabled={reviewing}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-xs font-semibold text-gray-700">
                        Department Email
                      </label>

                      <input
                        type="email"
                        value={departmentEmail}
                        onChange={(event) =>
                          setDepartmentEmail(
                            event.target.value
                          )
                        }
                        placeholder="department@example.com"
                        disabled={reviewing}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                      />

                    </div>

                  </div>

                </div>

              )}

              {/* REMARKS */}

              <div className="mb-6">

                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Admin Remarks
                </label>

                <textarea
                  value={adminRemarks}
                  onChange={(event) =>
                    setAdminRemarks(
                      event.target.value
                    )
                  }
                  rows={4}
                  disabled={reviewing}
                  placeholder={
                    reviewStatus === "approved"
                      ? "Optional remarks..."
                      : "Explain why this request is being rejected..."
                  }
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />

              </div>

              {/* MODAL ERROR */}

              {error && (

                <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                  <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                  <p className="text-sm font-medium text-red-700">
                    {error}
                  </p>

                </div>

              )}

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="submit"
                  disabled={reviewing}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    reviewStatus === "approved"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >

                  {reviewing ? (

                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      Processing...
                    </>

                  ) : reviewStatus === "approved" ? (

                    <>
                      <CheckIcon className="h-4 w-4" />
                      Approve Classification
                    </>

                  ) : (

                    <>
                      <XMarkIcon className="h-4 w-4" />
                      Reject Request
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default IncidentClassificationRequests;

