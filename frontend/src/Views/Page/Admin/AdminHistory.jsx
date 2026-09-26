import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../../api/axiosClient";

import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  TruckIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const AdminHistory = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [activeType, setActiveType] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [expandedId, setExpandedId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 30,
    total: 0,
    last_page: 1,
  });

  const [showFilters, setShowFilters] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // =========================================================
  // HISTORY TYPES
  // =========================================================

  const historyTypes = [
    {
      value: "all",
      label: "All Activity",
      icon: ArchiveBoxIcon,
    },
    {
      value: "delivery",
      label: "Deliveries",
      icon: TruckIcon,
    },
    {
      value: "driver",
      label: "Drivers",
      icon: UserIcon,
    },
    {
      value: "incident",
      label: "Incidents",
      icon: ExclamationTriangleIcon,
    },
    {
      value: "classification_request",
      label: "Classification Requests",
      icon: ClipboardDocumentListIcon,
    },
  ];

  // =========================================================
  // FETCH HISTORY
  // =========================================================

  const fetchHistory = async ({
    type = activeType,
    page = currentPage,
    silent = false,
  } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axiosClient.get(
        "/admin/history",
        {
          params: {
            type,
            page,
            per_page: 100,
          },
        }
      );

      const responseHistory =
        response.data?.history || [];

      setHistory(responseHistory);

      setPagination(
        response.data?.pagination || {
          current_page: page,
          per_page: 100,
          total: responseHistory.length,
          last_page: 1,
        }
      );
    } catch (error) {
      console.error(
        "Failed to fetch admin history:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load history."
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
    fetchHistory({
      type: activeType,
      page: currentPage,
    });
  }, [activeType, currentPage]);

  // =========================================================
  // HELPERS
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

  const getRelativeTime = (date) => {
    if (!date) {
      return "";
    }

    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) {
      return "";
    }

    const difference =
      Date.now() - timestamp;

    const seconds =
      Math.floor(difference / 1000);

    if (seconds < 60) {
      return "Just now";
    }

    const minutes =
      Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    const hours =
      Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    const days =
      Math.floor(hours / 24);

    if (days < 30) {
      return `${days} ${
        days === 1 ? "day" : "days"
      } ago`;
    }

    return formatDate(date);
  };

  // =========================================================
  // TYPE LABEL
  // =========================================================

  const getTypeLabel = (type) => {
    switch (type) {
      case "delivery":
        return "Delivery";

      case "driver":
        return "Driver";

      case "incident":
        return "Incident";

      case "classification_request":
        return "Classification Request";

      default:
        return "Activity";
    }
  };

  // =========================================================
  // TYPE COLORS
  // =========================================================

  const getTypeClasses = (type) => {
    switch (type) {
      case "delivery":
        return {
          wrapper:
            "bg-blue-50 text-blue-600",
          badge:
            "bg-blue-50 text-blue-700",
          border:
            "border-blue-100",
        };

      case "driver":
        return {
          wrapper:
            "bg-green-50 text-green-600",
          badge:
            "bg-green-50 text-green-700",
          border:
            "border-green-100",
        };

      case "incident":
        return {
          wrapper:
            "bg-red-50 text-red-600",
          badge:
            "bg-red-50 text-red-700",
          border:
            "border-red-100",
        };

      case "classification_request":
        return {
          wrapper:
            "bg-purple-50 text-purple-600",
          badge:
            "bg-purple-50 text-purple-700",
          border:
            "border-purple-100",
        };

      default:
        return {
          wrapper:
            "bg-gray-50 text-gray-600",
          badge:
            "bg-gray-50 text-gray-700",
          border:
            "border-gray-100",
        };
    }
  };

  // =========================================================
  // TYPE ICON
  // =========================================================

  const getTypeIcon = (type) => {
    switch (type) {
      case "delivery":
        return TruckIcon;

      case "driver":
        return UserIcon;

      case "incident":
        return ExclamationTriangleIcon;

      case "classification_request":
        return ClipboardDocumentListIcon;

      default:
        return ArchiveBoxIcon;
    }
  };

  // =========================================================
  // ACTION STATUS
  // =========================================================

  const getActionClasses = (action = "") => {
    const value =
      action.toLowerCase();

    if (
      value.includes("delivered") ||
      value.includes("verified") ||
      value.includes("approved") ||
      value.includes("resolved")
    ) {
      return "bg-green-50 text-green-700";
    }

    if (
      value.includes("incident")
    ) {
      return "bg-red-50 text-red-700";
    }

    if (
      value.includes("review")
    ) {
      return "bg-orange-50 text-orange-700";
    }

    if (
      value.includes("request")
    ) {
      return "bg-purple-50 text-purple-700";
    }

    if (
      value.includes("created") ||
      value.includes("registered")
    ) {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-gray-50 text-gray-600";
  };

  // =========================================================
  // TOGGLE DETAILS
  // =========================================================

  const toggleDetails = (id) => {
    setExpandedId((previous) =>
      previous === id ? null : id
    );
  };

  // =========================================================
  // FILTER HISTORY
  // =========================================================

  const filteredHistory = useMemo(() => {
    let result = [...history];

    // -------------------------------------------------------
    // SEARCH
    // -------------------------------------------------------

    if (searchTerm.trim()) {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      result = result.filter(
        (item) => {
          const searchableText = [
            item.action,
            item.description,
            item.reference,
            item.actor?.username,
            item.actor?.role,
            item.subject?.username,
            item.subject?.dr_number,
            item.subject?.incident_number,
            item.subject?.incident_type,
            item.subject?.recipient_name,
            item.metadata?.status,
            item.metadata?.classification,
            item.metadata?.department,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            search
          );
        }
      );
    }

    // -------------------------------------------------------
    // DATE FROM
    // -------------------------------------------------------

    if (dateFrom) {
      const startDate =
        new Date(
          `${dateFrom}T00:00:00`
        );

      result = result.filter(
        (item) =>
          new Date(
            item.timestamp
          ) >= startDate
      );
    }

    // -------------------------------------------------------
    // DATE TO
    // -------------------------------------------------------

    if (dateTo) {
      const endDate =
        new Date(
          `${dateTo}T23:59:59`
        );

      result = result.filter(
        (item) =>
          new Date(
            item.timestamp
          ) <= endDate
      );
    }

    return result;
  }, [
    history,
    searchTerm,
    dateFrom,
    dateTo,
  ]);

  // =========================================================
  // ANALYTICS
  // =========================================================

  const analytics = useMemo(() => {
    const data = history;

    const deliveryEvents =
      data.filter(
        (item) =>
          item.type === "delivery"
      );

    const driverEvents =
      data.filter(
        (item) =>
          item.type === "driver"
      );

    const incidentEvents =
      data.filter(
        (item) =>
          item.type === "incident"
      );

    const classificationEvents =
      data.filter(
        (item) =>
          item.type ===
          "classification_request"
      );

    const delivered =
      deliveryEvents.filter(
        (item) =>
          item.action ===
          "Delivery Delivered"
      );

    const incidentsReported =
      incidentEvents.filter(
        (item) =>
          item.action ===
          "Incident Reported"
      );

    const incidentsReviewed =
      incidentEvents.filter(
        (item) =>
          item.action ===
          "Incident Reviewed"
      );

    const classificationSubmitted =
      classificationEvents.filter(
        (item) =>
          item.action ===
          "Classification Request Submitted"
      );

    const classificationApproved =
      classificationEvents.filter(
        (item) =>
          item.action.toLowerCase() ===
          "classification request approved"
      );

    const classificationRejected =
      classificationEvents.filter(
        (item) =>
          item.action.toLowerCase() ===
          "classification request rejected"
      );

    const driversRegistered =
      driverEvents.filter(
        (item) =>
          item.action ===
          "Driver Registered"
      );

    const driversVerified =
      driverEvents.filter(
        (item) =>
          item.action ===
          "Driver Email Verified"
      );

    const uniqueDeliveries =
      new Set(
        deliveryEvents
          .map(
            (item) =>
              item.reference_id
          )
          .filter(Boolean)
      );

    const uniqueDrivers =
      new Set(
        driverEvents
          .map(
            (item) =>
              item.reference_id
          )
          .filter(Boolean)
      );

    const uniqueIncidents =
      new Set(
        incidentEvents
          .map(
            (item) =>
              item.reference_id
          )
          .filter(Boolean)
      );

    const uniqueClassificationRequests =
      new Set(
        classificationEvents
          .map(
            (item) =>
              item.reference_id
          )
          .filter(Boolean)
      );

    return {
      totalEvents: data.length,

      deliveryEvents:
        deliveryEvents.length,

      driverEvents:
        driverEvents.length,

      incidentEvents:
        incidentEvents.length,

      classificationEvents:
        classificationEvents.length,

      delivered:
        delivered.length,

      incidentsReported:
        incidentsReported.length,

      incidentsReviewed:
        incidentsReviewed.length,

      classificationSubmitted:
        classificationSubmitted.length,

      classificationApproved:
        classificationApproved.length,

      classificationRejected:
        classificationRejected.length,

      driversRegistered:
        driversRegistered.length,

      driversVerified:
        driversVerified.length,

      uniqueDeliveries:
        uniqueDeliveries.size,

      uniqueDrivers:
        uniqueDrivers.size,

      uniqueIncidents:
        uniqueIncidents.size,

      uniqueClassificationRequests:
        uniqueClassificationRequests.size,
    };
  }, [history]);

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters =
    searchTerm ||
    dateFrom ||
    dateTo;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />

            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
                />
              )
            )}

          </div>

          <div className="mt-6 h-96 animate-pulse rounded-2xl bg-white shadow-sm" />

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-cyan-50 p-3">

                  <ArchiveBoxIcon className="h-7 w-7 text-cyan-600" />

                </div>

                <div>

                  <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                    History & Analytics
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    Review system activity, delivery history,
                    incidents, drivers, and classification requests.
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
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

            <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-500" />

            <div className="flex-1">

              <p className="text-sm font-semibold text-red-700">
                Unable to load history
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

            </div>

          </div>
        )}

        {/* =====================================================
            ANALYTICS
        ====================================================== */}

        <section className="mb-8">

          <div className="mb-4 flex items-center gap-2">

            <ChartBarIcon className="h-5 w-5 text-gray-500" />

            <h2 className="text-lg font-bold text-gray-800">
              Overview
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* TOTAL EVENTS */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Total Events
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-800">
                    {analytics.totalEvents}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Recorded activity
                  </p>

                </div>

                <div className="rounded-xl bg-gray-50 p-3">

                  <ArchiveBoxIcon className="h-6 w-6 text-gray-500" />

                </div>

              </div>

            </div>

            {/* DELIVERIES */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Delivery Events
                  </p>

                  <p className="mt-2 text-3xl font-bold text-blue-600">
                    {analytics.deliveryEvents}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {analytics.delivered} completed
                  </p>

                </div>

                <div className="rounded-xl bg-blue-50 p-3">

                  <TruckIcon className="h-6 w-6 text-blue-600" />

                </div>

              </div>

            </div>

            {/* INCIDENTS */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Incident Events
                  </p>

                  <p className="mt-2 text-3xl font-bold text-red-600">
                    {analytics.incidentEvents}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {analytics.incidentsReported} reported
                  </p>

                </div>

                <div className="rounded-xl bg-red-50 p-3">

                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />

                </div>

              </div>

            </div>

            {/* DRIVERS */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Driver Events
                  </p>

                  <p className="mt-2 text-3xl font-bold text-green-600">
                    {analytics.driverEvents}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {analytics.driversRegistered} registered
                  </p>

                </div>

                <div className="rounded-xl bg-green-50 p-3">

                  <UserIcon className="h-6 w-6 text-green-600" />

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            ANALYTICS DETAILS
        ====================================================== */}

        <section className="mb-8">

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* DELIVERY ANALYTICS */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-blue-50 p-2">

                  <TruckIcon className="h-5 w-5 text-blue-600" />

                </div>

                <div>

                  <h3 className="text-sm font-bold text-gray-800">
                    Delivery Activity
                  </h3>

                  <p className="text-xs text-gray-400">
                    Delivery-related events
                  </p>

                </div>

              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-gray-50 p-3">

                  <p className="text-xs text-gray-400">
                    Deliveries
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-700">
                    {analytics.uniqueDeliveries}
                  </p>

                </div>

                <div className="rounded-xl bg-green-50 p-3">

                  <p className="text-xs text-green-600">
                    Delivered
                  </p>

                  <p className="mt-1 text-lg font-bold text-green-700">
                    {analytics.delivered}
                  </p>

                </div>

              </div>

            </div>

            {/* INCIDENT ANALYTICS */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-red-50 p-2">

                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />

                </div>

                <div>

                  <h3 className="text-sm font-bold text-gray-800">
                    Incident Activity
                  </h3>

                  <p className="text-xs text-gray-400">
                    Report and review activity
                  </p>

                </div>

              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-red-50 p-3">

                  <p className="text-xs text-red-600">
                    Reported
                  </p>

                  <p className="mt-1 text-lg font-bold text-red-700">
                    {analytics.incidentsReported}
                  </p>

                </div>

                <div className="rounded-xl bg-orange-50 p-3">

                  <p className="text-xs text-orange-600">
                    Reviewed
                  </p>

                  <p className="mt-1 text-lg font-bold text-orange-700">
                    {analytics.incidentsReviewed}
                  </p>

                </div>

              </div>

            </div>

            {/* CLASSIFICATION ANALYTICS */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-purple-50 p-2">

                  <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />

                </div>

                <div>

                  <h3 className="text-sm font-bold text-gray-800">
                    Classification Requests
                  </h3>

                  <p className="text-xs text-gray-400">
                    Request activity
                  </p>

                </div>

              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">

                <div className="rounded-xl bg-gray-50 p-3">

                  <p className="text-[11px] text-gray-400">
                    Submitted
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-700">
                    {analytics.classificationSubmitted}
                  </p>

                </div>

                <div className="rounded-xl bg-green-50 p-3">

                  <p className="text-[11px] text-green-600">
                    Approved
                  </p>

                  <p className="mt-1 text-lg font-bold text-green-700">
                    {analytics.classificationApproved}
                  </p>

                </div>

                <div className="rounded-xl bg-red-50 p-3">

                  <p className="text-[11px] text-red-600">
                    Rejected
                  </p>

                  <p className="mt-1 text-lg font-bold text-red-700">
                    {analytics.classificationRejected}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            HISTORY
        ====================================================== */}

        <section>

          {/* HISTORY HEADER */}

          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <ClockIcon className="h-5 w-5 text-gray-500" />

                <h2 className="text-lg font-bold text-gray-800">
                  Activity History
                </h2>

              </div>

              <p className="mt-1 text-sm text-gray-400">
                Chronological record of activity across the system.
              </p>

            </div>

          </div>

          {/* ===================================================
              SEARCH / FILTER BAR
          ==================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

            <div className="flex flex-col gap-3 lg:flex-row">

              {/* SEARCH */}

              <div className="relative flex-1">

                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(
                      event.target.value
                    );
                  }}
                  placeholder="Search activity, DR number, incident, driver..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                />

              </div>

              {/* FILTER BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    (previous) =>
                      !previous
                  )
                }
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  showFilters
                    ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                }`}
              >

                <FunnelIcon className="h-5 w-5" />

                Filters

              </button>

              {/* CLEAR */}

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >

                  <XMarkIcon className="h-5 w-5" />

                  Clear

                </button>
              )}

            </div>

            {/* =================================================
                FILTER PANEL
            ================================================== */}

            {showFilters && (

              <div className="mt-4 border-t border-gray-100 pt-4">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                      From Date
                    </label>

                    <div className="relative">

                      <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(event) =>
                          setDateFrom(
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                      />

                    </div>

                  </div>

                  <div>

                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                      To Date
                    </label>

                    <div className="relative">

                      <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                      <input
                        type="date"
                        value={dateTo}
                        onChange={(event) =>
                          setDateTo(
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                      />

                    </div>

                  </div>

                </div>

              </div>

            )}

            {/* =================================================
                TYPE FILTERS
            ================================================== */}

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">

              {historyTypes.map(
                (item) => {

                  const Icon =
                    item.icon;

                  const isActive =
                    activeType ===
                    item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setCurrentPage(1);
                        setActiveType(
                          item.value
                        );
                      }}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                        isActive
                          ? "bg-cyan-600 text-white shadow-sm"
                          : "border border-gray-200 bg-white text-gray-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                      }`}
                    >

                      <Icon className="h-4 w-4" />

                      {item.label}

                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* ===================================================
              RESULT COUNT
          ==================================================== */}

          <div className="mt-4 flex items-center justify-between">

            <p className="text-xs text-gray-400">

              Showing{" "}

              <span className="font-semibold text-gray-600">
                {filteredHistory.length}
              </span>

              {" "}events

            </p>

            {pagination.total > 0 && (
              <p className="text-xs text-gray-400">

                {pagination.total} total records

              </p>
            )}

          </div>

          {/* ===================================================
              EMPTY HISTORY
          ==================================================== */}

          {filteredHistory.length === 0 ? (

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

              <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-300" />

              <h3 className="mt-4 text-lg font-semibold text-gray-700">
                No history found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">

                {hasFilters
                  ? "No activity matches your current search or date filters."
                  : "There is no recorded activity for this category yet."}

              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
                >
                  Clear Filters
                </button>
              )}

            </div>

          ) : (

            /* =================================================
               TIMELINE
            ================================================== */

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="divide-y divide-gray-100">

                {filteredHistory.map(
                  (item) => {

                    const colors =
                      getTypeClasses(
                        item.type
                      );

                    const Icon =
                      getTypeIcon(
                        item.type
                      );

                    const isExpanded =
                      expandedId ===
                      item.id;

                    return (
                      <div
                        key={item.id}
                        className="relative"
                      >

                        <div className="p-4 sm:p-5">

                          <div className="flex gap-3 sm:gap-4">

                            {/* ICON */}

                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors.wrapper}`}
                            >

                              <Icon className="h-5 w-5" />

                            </div>

                            {/* CONTENT */}

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                                <div className="min-w-0">

                                  <div className="flex flex-wrap items-center gap-2">

                                    <h3 className="text-sm font-bold text-gray-800">

                                      {item.action}

                                    </h3>

                                    <span
                                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${colors.badge}`}
                                    >
                                      {getTypeLabel(
                                        item.type
                                      )}
                                    </span>

                                  </div>

                                  <p className="mt-1 text-sm text-gray-500">

                                    {item.description}

                                  </p>

                                </div>

                                <div className="shrink-0">

                                  <p className="text-xs font-medium text-gray-500 sm:text-right">

                                    {formatDateTime(
                                      item.timestamp
                                    )}

                                  </p>

                                  <p className="mt-0.5 text-[11px] text-gray-400 sm:text-right">

                                    {getRelativeTime(
                                      item.timestamp
                                    )}

                                  </p>

                                </div>

                              </div>

                              {/* REFERENCE */}

                              <div className="mt-3 flex flex-wrap items-center gap-2">

                                {item.reference && (

                                  <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-600">

                                    {item.reference}

                                  </span>

                                )}

                                {item.actor?.username && (

                                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">

                                    <UserIcon className="h-4 w-4" />

                                    {item.actor.username}

                                  </span>

                                )}

                                {item.actor?.role && (

                                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium capitalize text-gray-500">

                                    {item.actor.role}

                                  </span>

                                )}

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getActionClasses(
                                    item.action
                                  )}`}
                                >

                                  {item.action}

                                </span>

                              </div>

                              {/* DETAILS BUTTON */}

                              <button
                                type="button"
                                onClick={() =>
                                  toggleDetails(
                                    item.id
                                  )
                                }
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 transition hover:text-cyan-700"
                              >

                                {isExpanded ? (
                                  <>
                                    Hide details

                                    <ChevronUpIcon className="h-4 w-4" />
                                  </>
                                ) : (
                                  <>
                                    View details

                                    <ChevronDownIcon className="h-4 w-4" />
                                  </>
                                )}

                              </button>

                              {/* =================================================
                                  EXPANDED EVENT DETAILS
                              ================================================== */}

                              {isExpanded && (

                                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">

                                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    {/* EVENT */}

                                    <div>

                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                        Event
                                      </p>

                                      <p className="mt-1 text-sm font-semibold text-gray-700">
                                        {item.action}
                                      </p>

                                    </div>

                                    {/* TIMESTAMP */}

                                    <div>

                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                        Timestamp
                                      </p>

                                      <p className="mt-1 text-sm font-semibold text-gray-700">
                                        {formatDateTime(
                                          item.timestamp
                                        )}
                                      </p>

                                    </div>

                                    {/* REFERENCE */}

                                    <div>

                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                        Reference
                                      </p>

                                      <p className="mt-1 break-words text-sm font-semibold text-gray-700">
                                        {item.reference ||
                                          "N/A"}
                                      </p>

                                    </div>

                                    {/* ACTOR */}

                                    <div>

                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                        Actor
                                      </p>

                                      <p className="mt-1 text-sm font-semibold text-gray-700">
                                        {item.actor
                                          ?.username ||
                                          "N/A"}
                                      </p>

                                    </div>

                                  </div>

                                  {/* METADATA */}

                                  {item.metadata &&
                                    Object.keys(
                                      item.metadata
                                    ).length > 0 && (

                                      <div className="mt-4 border-t border-gray-200 pt-4">

                                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                          Additional Information
                                        </p>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                          {Object.entries(
                                            item.metadata
                                          ).map(
                                            ([
                                              key,
                                              value,
                                            ]) => {

                                              if (
                                                value ===
                                                  null ||
                                                value ===
                                                  undefined ||
                                                value ===
                                                  ""
                                              ) {
                                                return null;
                                              }

                                              let displayValue =
                                                value;

                                              if (
                                                typeof value ===
                                                "boolean"
                                              ) {
                                                displayValue =
                                                  value
                                                    ? "Yes"
                                                    : "No";
                                              }

                                              if (
                                                typeof value ===
                                                "object"
                                              ) {
                                                displayValue =
                                                  JSON.stringify(
                                                    value
                                                  );
                                              }

                                              const label =
                                                key
                                                  .replace(
                                                    /_/g,
                                                    " "
                                                  )
                                                  .replace(
                                                    /\b\w/g,
                                                    (
                                                      character
                                                    ) =>
                                                      character.toUpperCase()
                                                  );

                                              return (
                                                <div
                                                  key={
                                                    key
                                                  }
                                                  className="rounded-lg border border-gray-100 bg-white p-3"
                                                >

                                                  <p className="text-[11px] text-gray-400">
                                                    {
                                                      label
                                                    }
                                                  </p>

                                                  <p className="mt-1 break-words text-sm font-semibold text-gray-700">
                                                    {
                                                      displayValue
                                                    }
                                                  </p>

                                                </div>
                                              );
                                            }
                                          )}

                                        </div>

                                      </div>

                                    )}

                                </div>

                              )}

                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          )}

          {/* ===================================================
              PAGINATION
          ==================================================== */}

          {pagination.last_page > 1 && (

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-gray-400">

                Page{" "}

                <span className="font-semibold text-gray-600">
                  {pagination.current_page}
                </span>

                {" "}of{" "}

                <span className="font-semibold text-gray-600">
                  {pagination.last_page}
                </span>

              </p>

              <div className="flex gap-2">

                <button
                  type="button"
                  disabled={
                    currentPage <= 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          page - 1,
                          1
                        )
                    )
                  }
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    currentPage >=
                    pagination.last_page
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          page + 1,
                          pagination.last_page
                        )
                    )
                  }
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            </div>

          )}

        </section>

      </div>

    </div>
  );
};

export default AdminHistory;