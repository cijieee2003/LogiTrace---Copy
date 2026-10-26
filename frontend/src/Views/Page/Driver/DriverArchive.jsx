import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";

import {
  TruckIcon,
  MapPinIcon,
  UserIcon,
  CubeIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const DriverArchive = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // MODAL
  // =========================================================

  const [selectedDelivery, setSelectedDelivery] =
    useState(null);

  const [showDetailsModal, setShowDetailsModal] =
    useState(false);

  // =========================================================
  // COMPLETED DELIVERY STATUS FLOW
  // =========================================================

  const statuses = [
    "pick_up",
    "arrival",
    "queuing",
    "unloading",
    "checking",
    "delivered",
  ];

  const statusLabels = {
    pending: "Pending",
    pick_up: "Pick Up",
    arrival: "Arrival",
    queuing: "Queuing",
    unloading: "Unloading",
    checking: "Checking",
    delivered: "Delivered",
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getStatusLabel = (status) => {
    return (
      statusLabels[status] ||
      status ||
      "Unknown"
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-600";

      case "pick_up":
        return "bg-cyan-100 text-cyan-700";

      case "arrival":
        return "bg-blue-100 text-blue-700";

      case "queuing":
        return "bg-indigo-100 text-indigo-700";

      case "unloading":
        return "bg-purple-100 text-purple-700";

      case "checking":
        return "bg-orange-100 text-orange-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // =========================================================
  // DATE + TIME FORMAT
  // =========================================================

  const formatDateTime = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =========================================================
  // TIME ONLY
  // =========================================================

  const formatTime = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // =========================================================
  // STATUS HISTORY
  // =========================================================

  const getStatusHistories = (delivery) => {
    const histories =
      delivery?.status_histories ||
      delivery?.statusHistories ||
      [];

    return Array.isArray(histories)
      ? histories
      : [];
  };

  // =========================================================
  // SORT STATUS HISTORY
  // =========================================================

  const getSortedStatusHistories = (delivery) => {
    return getStatusHistories(delivery)
      .slice()
      .sort(
        (a, b) =>
          new Date(
            a.changed_at || 0
          ) -
          new Date(
            b.changed_at || 0
          )
      );
  };

  // =========================================================
  // GET DELIVERED HISTORY
  // =========================================================

  const getDeliveredHistory = (delivery) => {
    const histories =
      getStatusHistories(delivery);

    return histories
      .filter(
        (history) =>
          history?.status ===
          "delivered"
      )
      .sort(
        (a, b) =>
          new Date(
            b.changed_at || 0
          ) -
          new Date(
            a.changed_at || 0
          )
      )[0];
  };

  // =========================================================
  // DRIVER INFORMATION
  // =========================================================

  const getDriverInfo = (delivery) => {
    return (
      delivery?.driver?.driverInfo ||
      delivery?.driver?.driver_info ||
      delivery?.driver?.driver ||
      null
    );
  };

  // =========================================================
  // FETCH ARCHIVE
  // =========================================================

  const fetchArchive = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await axiosClient.get(
          "/driver/archive"
        );

      const archivedDeliveries =
        response.data?.deliveries ||
        response.data ||
        [];

      // =====================================================
      // FRONTEND SAFETY CHECK
      // =====================================================

      const completedDeliveries =
        Array.isArray(
          archivedDeliveries
        )
          ? archivedDeliveries.filter(
              (delivery) =>
                delivery?.status ===
                "delivered"
            )
          : [];

      setDeliveries(
        completedDeliveries
      );

      // =====================================================
      // CLOSE MODAL IF SELECTED DELIVERY NO LONGER EXISTS
      // =====================================================

      setSelectedDelivery(
        (previous) => {
          if (
            previous &&
            !completedDeliveries.some(
              (delivery) =>
                delivery.id ===
                previous.id
            )
          ) {
            setShowDetailsModal(
              false
            );

            return null;
          }

          return previous;
        }
      );
    } catch (error) {
      console.error(
        "Failed to fetch archived deliveries:",
        error
      );

      setError(
        error.response?.data
          ?.message ||
          "Failed to load your delivery archive."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchArchive();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    fetchArchive(true);
  };

  // =========================================================
  // OPEN DETAILS MODAL
  // =========================================================

  const openDetailsModal = (
    delivery
  ) => {
    setSelectedDelivery(delivery);
    setShowDetailsModal(true);
  };

  // =========================================================
  // CLOSE DETAILS MODAL
  // =========================================================

  const closeDetailsModal = () => {
    setShowDetailsModal(false);

    setTimeout(() => {
      setSelectedDelivery(null);
    }, 200);
  };

  // =========================================================
  // CLOSE MODAL WITH ESCAPE
  // =========================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        showDetailsModal
      ) {
        closeDetailsModal();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [showDetailsModal]);

  // =========================================================
  // PREVENT BODY SCROLL WHEN MODAL IS OPEN
  // =========================================================

  useEffect(() => {
    if (showDetailsModal) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [showDetailsModal]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center text-center">

          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

          <p className="text-sm text-gray-500">
            Please wait a moment...
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // SELECTED DELIVERY DATA
  // =========================================================

  const selectedDeliveredHistory =
    selectedDelivery
      ? getDeliveredHistory(
          selectedDelivery
        )
      : null;

  const selectedDriverInfo =
    selectedDelivery
      ? getDriverInfo(
          selectedDelivery
        )
      : null;

  const selectedHistories =
    selectedDelivery
      ? getSortedStatusHistories(
          selectedDelivery
        )
      : [];

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">

      <div className="mx-auto w-full max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-5 sm:mb-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* TITLE */}

            <div className="min-w-0">

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 sm:h-12 sm:w-12">

                  <ArchiveBoxIcon className="h-6 w-6 text-green-600 sm:h-7 sm:w-7" />

                </div>

                <div className="min-w-0">

                  <h1 className="text-xl font-bold leading-tight text-gray-800 sm:text-2xl lg:text-3xl">
                    Delivery Archive
                  </h1>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500 sm:text-sm">
                    View your completed and
                    delivered transactions.
                  </p>

                </div>

              </div>

            </div>

            {/* COMPLETED COUNT */}

            <div className="w-full sm:w-auto">

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">

                  <CheckCircleIcon className="h-5 w-5 text-green-600" />

                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-[11px]">
                    Completed Deliveries
                  </p>

                  <p className="mt-0.5 text-lg font-bold text-gray-700">
                    {deliveries.length}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">

            <div className="flex items-start gap-3">

              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div className="min-w-0 flex-1">

                <p className="break-words text-sm font-medium leading-5 text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fetchArchive()
                  }
                  className="mt-2 text-xs font-semibold text-red-700 underline hover:no-underline"
                >
                  Try again
                </button>

              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            EMPTY
        ====================================================== */}

        {deliveries.length === 0 ? (

          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center shadow-sm sm:px-6 sm:py-16">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">

              <ArchiveBoxIcon className="h-9 w-9 text-green-500" />

            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-700">
              No archived deliveries
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
              Completed deliveries will
              automatically appear here after
              they are marked as delivered.
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >

              <ArrowPathIcon
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh Archive

            </button>

          </div>

        ) : (

          <div className="space-y-4 sm:space-y-6">

            {deliveries.map(
              (delivery) => {

                const deliveredHistory =
                  getDeliveredHistory(
                    delivery
                  );

                return (
                  <div
                    key={delivery.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >

                    {/* =================================================
                        DELIVERY HEADER
                    ================================================== */}

                    <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">

                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        {/* D.R. + STATUS */}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h2 className="break-all text-base font-bold text-gray-800 sm:text-lg">
                              D.R. #
                              {delivery.dr_number ||
                                "N/A"}
                            </h2>

                            <span
                              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:py-1.5 sm:text-xs ${getStatusBadgeClass(
                                delivery.status
                              )}`}
                            >

                              <CheckCircleIcon className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />

                              {getStatusLabel(
                                delivery.status
                              )}

                            </span>

                          </div>

                          <p className="mt-1 text-xs leading-5 text-gray-400">
                            Delivered{" "}
                            {deliveredHistory?.changed_at
                              ? formatDateTime(
                                  deliveredHistory.changed_at
                                )
                              : formatDateTime(
                                  delivery.updated_at
                                )}
                          </p>

                        </div>

                        {/* VIEW DETAILS */}

                        <button
                          type="button"
                          onClick={() =>
                            openDetailsModal(
                              delivery
                            )
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 sm:w-auto"
                        >

                          <TruckIcon className="h-5 w-5" />

                          View Details

                        </button>

                      </div>

                    </div>

                    {/* =================================================
                        DELIVERY INFORMATION
                    ================================================== */}

                    <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2 sm:gap-4 sm:px-6 sm:py-5 lg:grid-cols-4">

                      {/* CUSTOMER */}

                      <div className="min-w-0 rounded-xl bg-gray-50 p-3 sm:bg-transparent sm:p-0">

                        <div className="flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">

                            <UserIcon className="h-5 w-5 text-blue-600" />

                          </div>

                          <div className="min-w-0">

                            <p className="text-xs text-gray-400">
                              Customer
                            </p>

                            <p className="mt-1 break-words text-sm font-semibold text-gray-700">
                              {delivery.recipient_name ||
                                "N/A"}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* QUANTITY */}

                      <div className="min-w-0 rounded-xl bg-gray-50 p-3 sm:bg-transparent sm:p-0">

                        <div className="flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">

                            <CubeIcon className="h-5 w-5 text-purple-600" />

                          </div>

                          <div>

                            <p className="text-xs text-gray-400">
                              Quantity
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-700">
                              {delivery.quantity_order ??
                                "N/A"}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* DELIVERY DATE */}

                      <div className="min-w-0 rounded-xl bg-gray-50 p-3 sm:bg-transparent sm:p-0">

                        <div className="flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">

                            <CalendarDaysIcon className="h-5 w-5 text-green-600" />

                          </div>

                          <div className="min-w-0">

                            <p className="text-xs text-gray-400">
                              Delivery Date
                            </p>

                            <p className="mt-1 break-words text-sm font-semibold text-gray-700">

                              {delivery.delivery_date
                                ? formatDate(
                                    delivery.delivery_date
                                  )
                                : deliveredHistory?.changed_at
                                  ? formatDate(
                                      deliveredHistory.changed_at
                                    )
                                  : "N/A"}

                            </p>

                          </div>

                        </div>

                      </div>

                      {/* ADDRESS */}

                      <div className="min-w-0 rounded-xl bg-gray-50 p-3 sm:bg-transparent sm:p-0">

                        <div className="flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">

                            <MapPinIcon className="h-5 w-5 text-orange-600" />

                          </div>

                          <div className="min-w-0">

                            <p className="text-xs text-gray-400">
                              Address
                            </p>

                            <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-700">
                              {delivery.delivery_address ||
                                "N/A"}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        COMPLETED STATUS
                    ================================================== */}

                    <div className="border-t border-gray-100 px-4 py-5 sm:px-6">

                      <div className="mb-5 flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <p className="text-sm font-semibold text-gray-700">
                            Delivery Status
                          </p>

                          <p className="mt-1 max-w-xl text-xs leading-5 text-gray-400">
                            This delivery has
                            successfully completed
                            its route.
                          </p>

                        </div>

                        <CheckCircleIcon className="h-6 w-6 shrink-0 text-green-500 sm:h-7 sm:w-7" />

                      </div>

                      {/* =================================================
                          MOBILE STATUS PROGRESS
                      ================================================== */}

                      <div className="sm:hidden">

                        <div className="grid grid-cols-2 gap-3">

                          {statuses.map(
                            (status) => (
                              <div
                                key={status}
                                className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5"
                              >

                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-green-400 bg-white">

                                  <CheckCircleIcon className="h-4 w-4 text-green-600" />

                                </div>

                                <p className="min-w-0 truncate text-xs font-semibold text-green-700">
                                  {getStatusLabel(
                                    status
                                  )}
                                </p>

                              </div>
                            )
                          )}

                        </div>

                      </div>

                      {/* =================================================
                          TABLET / DESKTOP STATUS PROGRESS
                      ================================================== */}

                      <div className="hidden sm:block">

                        <div className="relative">

                          <div className="absolute left-0 right-0 top-4 h-0.5 bg-green-200" />

                          <div className="relative grid grid-cols-6 gap-2">

                            {statuses.map(
                              (status) => (
                                <div
                                  key={status}
                                  className="relative flex min-w-0 flex-col items-center text-center"
                                >

                                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-green-500 bg-green-50">

                                    <CheckCircleIcon className="h-5 w-5 text-green-600" />

                                  </div>

                                  <p className="mt-2 text-[10px] font-semibold text-green-600 sm:text-[11px]">
                                    {getStatusLabel(
                                      status
                                    )}
                                  </p>

                                </div>
                              )
                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* =========================================================
          DETAILS MODAL
      ========================================================= */}

      {showDetailsModal &&
        selectedDelivery && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-5"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeDetailsModal();
              }
            }}
          >

            {/* =====================================================
                MODAL CONTAINER
            ====================================================== */}

            <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-2xl">

              {/* =================================================
                  MODAL HEADER
              ================================================== */}

              <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-4 sm:px-6 sm:py-5">

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50">

                        <TruckIcon className="h-5 w-5 text-cyan-600" />

                      </div>

                      <div className="min-w-0">

                        <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
                          Delivery Details
                        </h2>

                        <p className="mt-0.5 break-all text-xs text-gray-400 sm:text-sm">
                          D.R. #
                          {selectedDelivery.dr_number ||
                            "N/A"}
                        </p>

                      </div>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      closeDetailsModal
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close details"
                  >

                    <XMarkIcon className="h-6 w-6" />

                  </button>

                </div>

              </div>

              {/* =================================================
                  MODAL CONTENT
              ================================================== */}

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">

                {/* =================================================
                    STATUS HEADER
                ================================================== */}

                <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">

                      <CheckCircleIcon className="h-6 w-6 text-green-500" />

                    </div>

                    <div>

                      <p className="text-xs text-green-600">
                        Delivery Status
                      </p>

                      <p className="mt-0.5 text-base font-bold text-green-700">
                        {getStatusLabel(
                          selectedDelivery.status
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="sm:text-right">

                    <p className="text-xs text-green-600">
                      Delivered At
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-green-700">

                      {selectedDeliveredHistory?.changed_at
                        ? formatDateTime(
                            selectedDeliveredHistory.changed_at
                          )
                        : formatDateTime(
                            selectedDelivery.updated_at
                          )}

                    </p>

                  </div>

                </div>

                {/* =================================================
                    DELIVERY DETAILS + DRIVER
                ================================================== */}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                  {/* =================================================
                      DELIVERY DETAILS
                  ================================================== */}

                  <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50">

                        <TruckIcon className="h-5 w-5 text-cyan-600" />

                      </div>

                      <div>

                        <h3 className="text-sm font-bold text-gray-800">
                          Delivery Details
                        </h3>

                        <p className="text-xs text-gray-400">
                          Transaction information
                        </p>

                      </div>

                    </div>

                    <div className="space-y-4">

                      <div>
                        <p className="text-xs text-gray-400">
                          D.R. Number
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-gray-700">
                          {selectedDelivery.dr_number ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Customer
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-gray-700">
                          {selectedDelivery.recipient_name ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Quantity Ordered
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {selectedDelivery.quantity_order ??
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Delivery Address
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-700">
                          {selectedDelivery.delivery_address ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Delivery Date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">

                          {selectedDelivery.delivery_date
                            ? formatDate(
                                selectedDelivery.delivery_date
                              )
                            : "N/A"}

                        </p>
                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      DRIVER & TRUCK
                  ================================================== */}

                  <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">

                        <TruckIcon className="h-5 w-5 text-blue-600" />

                      </div>

                      <div>

                        <h3 className="text-sm font-bold text-gray-800">
                          Driver & Truck
                        </h3>

                        <p className="text-xs text-gray-400">
                          Assigned vehicle information
                        </p>

                      </div>

                    </div>

                    <div className="space-y-4">

                      <div>
                        <p className="text-xs text-gray-400">
                          Driver
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-gray-700">
                          {selectedDelivery
                            ?.driver
                            ?.username ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Truck Name
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-gray-700">
                          {selectedDriverInfo?.truck_name ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Plate Number
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-gray-700">
                          {selectedDriverInfo?.truck_plate_number ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Completed Date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-green-600">

                          {selectedDeliveredHistory?.changed_at
                            ? formatDate(
                                selectedDeliveredHistory.changed_at
                              )
                            : formatDate(
                                selectedDelivery.updated_at
                              )}

                        </p>
                      </div>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    DELIVERY TIMELINE
                ================================================== */}

                <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 sm:mt-5 sm:p-5">

                  <div className="mb-5 flex items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">

                      <ClockIcon className="h-5 w-5 text-purple-600" />

                    </div>

                    <div>

                      <h3 className="text-sm font-bold text-gray-800">
                        Delivery Timeline
                      </h3>

                      <p className="text-xs text-gray-400">
                        Complete delivery status history
                      </p>

                    </div>

                  </div>

                  {selectedHistories.length ===
                  0 ? (

                    <div className="rounded-xl bg-gray-50 p-5 text-center">

                      <ClockIcon className="mx-auto h-8 w-8 text-gray-300" />

                      <p className="mt-2 text-sm text-gray-400">
                        No status history
                        available.
                      </p>

                    </div>

                  ) : (

                    <div className="space-y-0">

                      {selectedHistories.map(
                        (
                          history,
                          index
                        ) => {

                          const isLast =
                            index ===
                            selectedHistories.length -
                              1;

                          const timestamp =
                            history?.changed_at ||
                            history?.created_at ||
                            history?.updated_at;

                          return (
                            <div
                              key={
                                history.id ||
                                `${history.status}-${index}`
                              }
                              className="relative flex gap-3 sm:gap-4"
                            >

                              {/* CONNECTING LINE */}

                              {!isLast && (
                                <div className="absolute left-[11px] top-7 h-full w-px bg-green-200" />
                              )}

                              {/* DOT */}

                              <div className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50">

                                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />

                              </div>

                              {/* CONTENT */}

                              <div className="min-w-0 flex-1 pb-6">

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

                                  <div className="min-w-0">

                                    <p className="break-words text-sm font-semibold text-gray-700">
                                      {getStatusLabel(
                                        history.status
                                      )}
                                    </p>

                                  </div>

                                  <div className="shrink-0 sm:text-right">

                                    {timestamp ? (
                                      <>
                                        <p className="text-xs font-semibold text-blue-600">
                                          {formatTime(
                                            timestamp
                                          )}
                                        </p>

                                        <p className="mt-0.5 text-[11px] text-gray-400">
                                          {formatDate(
                                            timestamp
                                          )}
                                        </p>
                                      </>
                                    ) : (
                                      <p className="text-xs text-gray-400">
                                        Time not recorded
                                      </p>
                                    )}

                                  </div>

                                </div>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  )}

                </div>

              </div>

              {/* =================================================
                  MODAL FOOTER
              ================================================== */}

              

            </div>

          </div>
        )}

    </div>
  );
};

export default DriverArchive;