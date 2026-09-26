import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import axiosClient from "../../../api/axiosClient";

import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  TruckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const IncidentReports = () => {
  // =========================================================================
  // STATE
  // =========================================================================

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedIncident, setSelectedIncident] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [reviewRemarks, setReviewRemarks] = useState("");
  const [sendToHRLoading, setSendToHRLoading] = useState(false);

  const [newIncidentMessage, setNewIncidentMessage] =
    useState("");

  const previousIncidentIds = useRef(new Set());
  const firstFetch = useRef(true);

  // =========================================================================
  // HELPERS
  // =========================================================================

  const getDriver = (incident) => {
    return incident?.delivery?.driver || null;
  };

  const getDriverInfo = (incident) => {
    return incident?.delivery?.driver?.driver || null;
  };

  const getDriverFullName = (incident) => {
    const driverInfo = getDriverInfo(incident);

    if (!driverInfo) {
      return getDriver(incident)?.username || "N/A";
    }

    return [
      driverInfo.first_name,
      driverInfo.middle_name,
      driverInfo.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "open":
        return "bg-red-50 text-red-700 ring-red-200";

      case "under_review":
        return "bg-amber-50 text-amber-700 ring-amber-200";

      case "resolved":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";

      default:
        return "bg-gray-50 text-gray-700 ring-gray-200";
    }
  };

  const getEvidenceUrl = (path) => {
    if (!path) {
      return null;
    }

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000/api";

    const apiOrigin = baseUrl
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    const cleanPath = path.replace(
      /^\/?storage\/?/,
      ""
    );

    return `${apiOrigin}/storage/${cleanPath}`;
  };

  // =========================================================================
  // FETCH INCIDENTS
  // =========================================================================

  const fetchIncidents = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      }

      const response = await axiosClient.get("/incidents");

      const fetchedIncidents =
        response.data.incidents || [];

      // Detect new incidents
      if (!firstFetch.current) {
        const newIncidents = fetchedIncidents.filter(
          (incident) =>
            !previousIncidentIds.current.has(
              incident.id
            )
        );

        if (newIncidents.length > 0) {
          setNewIncidentMessage(
            `${newIncidents.length} new incident${
              newIncidents.length > 1 ? "s" : ""
            } received.`
          );

          setTimeout(() => {
            setNewIncidentMessage("");
          }, 4000);
        }
      }

      previousIncidentIds.current = new Set(
        fetchedIncidents.map(
          (incident) => incident.id
        )
      );

      firstFetch.current = false;

      setIncidents(fetchedIncidents);
    } catch (error) {
      console.error(
        "Failed to fetch incidents:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================================
  // INITIAL FETCH + AUTO REFRESH
  // =========================================================================

  useEffect(() => {
    fetchIncidents();

    const interval = setInterval(() => {
      fetchIncidents();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // =========================================================================
  // FILTER
  // =========================================================================

  const filteredIncidents = useMemo(() => {
    const searchValue = search
      .toLowerCase()
      .trim();

    return incidents.filter((incident) => {
      const matchesStatus =
        statusFilter === "all" ||
        incident.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      const values = [
        incident.delivery?.dr_number || "",
        incident.incident_number || "",
        incident.description || "",
        incident.status || "",
        incident.incident_type ||
          incident.classification
            ?.incident_type ||
          "",
        incident.department_concerned ||
          incident.classification
            ?.department ||
          "",
        incident.department_email ||
          incident.classification
            ?.department_email ||
          "",
        getDriverFullName(incident),
        getDriver(incident)?.username || "",
        incident.reporter?.username || "",
        incident.delivery?.recipient_name || "",
      ];

      return values
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
    });
  }, [
    incidents,
    search,
    statusFilter,
  ]);

  // =========================================================================
  // SUMMARY COUNTS
  // =========================================================================

  const totalIncidents = incidents.length;

  const openIncidents = incidents.filter(
    (incident) =>
      incident.status === "open"
  ).length;

  const resolvedIncidents = incidents.filter(
    (incident) =>
      incident.status === "resolved"
  ).length;

  // =========================================================================
  // MODAL
  // =========================================================================

  const openIncident = (incident) => {
    setSelectedIncident(incident);

    setReviewRemarks(
      incident.staff_remarks ||
        incident.review_remarks ||
        ""
    );
  };

  const closeIncident = () => {
    if (sendToHRLoading) {
      return;
    }

    setSelectedIncident(null);
    setReviewRemarks("");
  };

  // =========================================================================
  // SEND TO HR
  // =========================================================================

  const sendToHR = async (incident) => {
    if (!incident?.id) {
      return;
    }

    const drNumber =
      incident.delivery?.dr_number || "N/A";

    try {
      setSendToHRLoading(true);

      const response = await axiosClient.put(
        `/incidents/${incident.id}/review`,
        {
          status: "resolved",
          review_remarks: reviewRemarks,
        }
      );

      const updatedIncident =
        response.data.incident || {
          ...incident,
          status: "resolved",
          staff_remarks: reviewRemarks,
        };

      setIncidents((previousIncidents) =>
        previousIncidents.map((item) =>
          item.id === incident.id
            ? {
                ...item,
                ...updatedIncident,
                status: "resolved",
              }
            : item
        )
      );

      setSelectedIncident(null);
      setReviewRemarks("");

      setNewIncidentMessage(
        `D.R. ${drNumber} has been sent to HR and marked as resolved.`
      );

      setTimeout(() => {
        setNewIncidentMessage("");
      }, 4000);
    } catch (error) {
      console.error(
        "Failed to send D.R. to HR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to send the D.R. to HR."
      );
    } finally {
      setSendToHRLoading(false);
    }
  };

  // =========================================================================
  // PDF
  // =========================================================================

  const openIncidentPdf = (incident) => {
    if (!incident?.id) {
      return;
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000/api";

    const apiOrigin = baseUrl
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    const pdfUrl =
      `${apiOrigin}/api/incidents/${incident.id}/pdf`;

    window.open(
      pdfUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =========================================================================
  // LOADING
  // =========================================================================

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

  // =========================================================================
  // MAIN
  // =========================================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">

        {/* ===============================================================
            HEADER
        ================================================================ */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                <TruckIcon className="h-5 w-5 text-white" />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  Incident Reports
                </h1>

                <p className="mt-0.5 text-sm text-gray-500">
                  Review and manage delivery incident reports.
                </p>
              </div>
            </div>
          </div>

          
        </div>

        {/* ===============================================================
            NOTIFICATION
        ================================================================ */}

        {newIncidentMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
            <CheckCircleIcon className="h-5 w-5 shrink-0" />

            <span>
              {newIncidentMessage}
            </span>
          </div>
        )}

        {/* ===============================================================
            SUMMARY CARDS
        ================================================================ */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Total
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {totalIncidents}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <TruckIcon className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>

          {/* OPEN */}

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Open
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {openIncidents}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <ClockIcon className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>

          {/* RESOLVED */}

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Resolved
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {resolvedIncidents}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ===============================================================
            SEARCH / FILTER
        ================================================================ */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search D.R. number, driver, reporter..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:w-44"
            >
              <option value="all">
                All Status
              </option>

              <option value="open">
                Open
              </option>

              <option value="resolved">
                Resolved
              </option>
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredIncidents.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {totalIncidents}
              </span>{" "}
              incident reports
            </p>

            {statusFilter !== "all" && (
              <button
                type="button"
                onClick={() =>
                  setStatusFilter("all")
                }
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* ===============================================================
            DESKTOP TABLE
        ================================================================ */}

        <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200">

              <thead className="bg-gray-50">
                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    D.R. Number
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Driver
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Incident Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Department
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">

                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-gray-900">
                        No incident reports found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map(
                    (incident) => (
                      <tr
                        key={incident.id}
                        className="transition hover:bg-gray-50"
                      >

                        {/* D.R. */}

                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            D.R.{" "}
                            {incident.delivery?.dr_number ||
                              "N/A"}
                          </p>

                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {incident.description ||
                              "No description"}
                          </p>
                        </td>

                        {/* DRIVER */}

                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {getDriverFullName(
                              incident
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {getDriver(
                              incident
                            )?.username || "N/A"}
                          </p>
                        </td>

                        {/* INCIDENT TYPE */}

                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">
                            {incident.incident_type ||
                              incident.classification
                                ?.incident_type ||
                              "Unclassified"}
                          </p>
                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-6 py-4">
                          <p className="max-w-[180px] truncate text-sm text-gray-700">
                            {incident.department_concerned ||
                              incident.classification
                                ?.department ||
                              "N/A"}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
                              incident.status
                            )}`}
                          >
                            {formatStatus(
                              incident.status
                            )}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openIncident(
                                incident
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          >
                            <EyeIcon className="h-4 w-4" />
                            View
                          </button>
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>
            </table>
          </div>
        </div>

        {/* ===============================================================
            MOBILE CARDS
        ================================================================ */}

        <div className="space-y-3 md:hidden">

          {filteredIncidents.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
              </div>

              <p className="mt-4 text-sm font-semibold text-gray-900">
                No incident reports found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter.
              </p>

            </div>
          ) : (
            filteredIncidents.map(
              (incident) => (
                <div
                  key={incident.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="font-semibold text-gray-900">
                        D.R.{" "}
                        {incident.delivery?.dr_number ||
                          "N/A"}
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {incident.description ||
                          "No description"}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
                        incident.status
                      )}`}
                    >
                      {formatStatus(
                        incident.status
                      )}
                    </span>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">

                    {/* DRIVER */}

                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Driver
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                        {getDriverFullName(
                          incident
                        )}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {getDriver(
                          incident
                        )?.username || "N/A"}
                      </p>

                    </div>

                    {/* INCIDENT TYPE */}

                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Incident Type
                      </p>

                      <p className="mt-1 truncate text-sm font-medium text-gray-900">
                        {incident.incident_type ||
                          incident.classification
                            ?.incident_type ||
                          "Unclassified"}
                      </p>

                    </div>

                    {/* DEPARTMENT */}

                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Department
                      </p>

                      <p className="mt-1 truncate text-sm text-gray-700">
                        {incident.department_concerned ||
                          incident.classification
                            ?.department ||
                          "N/A"}
                      </p>

                    </div>

                    {/* RECIPIENT */}

                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Customer 
                      </p>

                      <p className="mt-1 truncate text-sm text-gray-700">
                        {incident.delivery
                          ?.recipient_name ||
                          "N/A"}
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openIncident(incident)
                    }
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View Details
                  </button>

                </div>
              )
            )
          )}

        </div>
      </div>

      {/* ===================================================================
          INCIDENT DETAILS MODAL
      ================================================================== */}

      {selectedIncident && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeIncident();
            }
          }}
        >

          <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl">

            {/* ============================================================
                MODAL HEADER
            ============================================================= */}

            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">

              <div className="min-w-0">

                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Delivery Receipt
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2">

                  <h2 className="text-lg font-bold text-gray-900">
                    D.R.{" "}
                    {selectedIncident
                      .delivery?.dr_number ||
                      "N/A"}
                  </h2>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${getStatusClasses(
                      selectedIncident.status
                    )}`}
                  >
                    {formatStatus(
                      selectedIncident.status
                    )}
                  </span>

                </div>
              </div>

              <button
                type="button"
                onClick={closeIncident}
                disabled={sendToHRLoading}
                aria-label="Close incident details"
                className="ml-4 shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

            </div>

            {/* ============================================================
                MODAL CONTENT
            ============================================================= */}

            <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-4 py-5 sm:px-6">

              {/* STATUS */}

              <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm font-semibold text-gray-900">
                      Incident status
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Review the incident details and add your remarks before forwarding it to HR.
                    </p>

                  </div>

                  <span
                    className={`self-start rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset sm:self-auto ${getStatusClasses(
                      selectedIncident.status
                    )}`}
                  >
                    {formatStatus(
                      selectedIncident.status
                    )}
                  </span>

                </div>
              </div>

              {/* DRIVER INFORMATION */}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-200 px-4 py-3">

                  <h3 className="text-sm font-bold text-gray-900">
                    Driver Information
                  </h3>

                </div>

                <div className="grid gap-x-6 gap-y-5 p-4 sm:grid-cols-2">

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Driver Name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {getDriverFullName(
                        selectedIncident
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Username
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {getDriver(
                        selectedIncident
                      )?.username || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-700">
                      {getDriver(
                        selectedIncident
                      )?.email || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Contact Number
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {getDriverInfo(
                        selectedIncident
                      )?.contact_number ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      License Number
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {getDriverInfo(
                        selectedIncident
                      )?.license_number ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Truck
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {getDriverInfo(
                        selectedIncident
                      )?.truck_name ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Plate Number
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {getDriverInfo(
                        selectedIncident
                      )?.truck_plate_number ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Gender
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {getDriverInfo(
                        selectedIncident
                      )?.gender || "N/A"}
                    </p>
                  </div>

                </div>
              </div>

              {/* DELIVERY INFORMATION */}

              <div className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-200 px-4 py-3">

                  <h3 className="text-sm font-bold text-gray-900">
                    Delivery Information
                  </h3>

                </div>

                <div className="grid gap-x-6 gap-y-5 p-4 sm:grid-cols-2">

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      D.R. Number
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedIncident
                        .delivery?.dr_number ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                     Customer 
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedIncident
                        .delivery?.recipient_name ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Quantity Ordered
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {selectedIncident
                        .delivery?.quantity_order ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Delivery Status
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatStatus(
                        selectedIncident
                          .delivery?.status
                      )}
                    </p>
                  </div>

                  <div className="sm:col-span-2">

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Delivery Address
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-700">
                      {selectedIncident
                        .delivery
                        ?.delivery_address ||
                        "N/A"}
                    </p>

                  </div>

                </div>
              </div>

              {/* INCIDENT INFORMATION */}

              <div className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-200 px-4 py-3">

                  <h3 className="text-sm font-bold text-gray-900">
                    Incident Information
                  </h3>

                </div>

                <div className="grid gap-x-6 gap-y-5 p-4 sm:grid-cols-2">

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Incident Type
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedIncident
                        .incident_type ||
                        selectedIncident
                          .classification
                          ?.incident_type ||
                        "N/A"}
                    </p>

                  </div>

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Department Concerned
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedIncident
                        .department_concerned ||
                        selectedIncident
                          .classification
                          ?.department ||
                        "N/A"}
                    </p>

                  </div>

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Department Email
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-700">
                      {selectedIncident
                        .department_email ||
                        selectedIncident
                          .classification
                          ?.department_email ||
                        "N/A"}
                    </p>

                  </div>

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Reported By
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedIncident
                        .reporter
                        ?.username ||
                        "N/A"}
                    </p>

                  </div>

                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Description
                </p>

                <div className="mt-2 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {selectedIncident.description ||
                    "No description provided."}
                </div>

              </div>

              {/* EVIDENCE */}

              {selectedIncident.evidence_photo && (
                <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Evidence
                  </p>

                  <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">

                    <img
                      src={getEvidenceUrl(
                        selectedIncident.evidence_photo
                      )}
                      alt="Incident evidence"
                      className="max-h-[28rem] w-full object-contain"
                    />

                  </div>
                </div>
              )}

              {/* REVIEW REMARKS */}

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">

                <h3 className="text-sm font-bold text-gray-900">
                  Review Remarks
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Add remarks before sending this D.R. to HR.
                </p>

                <textarea
                  value={reviewRemarks}
                  onChange={(event) =>
                    setReviewRemarks(
                      event.target.value
                    )
                  }
                  disabled={
                    sendToHRLoading ||
                    selectedIncident.status ===
                      "resolved"
                  }
                  rows={4}
                  placeholder={
                    selectedIncident.status ===
                    "resolved"
                      ? "This incident has already been resolved."
                      : "Enter review remarks..."
                  }
                  className="mt-4 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

              </div>

            </div>

            {/* ============================================================
                MODAL FOOTER
            ============================================================= */}

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            
              {selectedIncident.status ===
              "resolved" ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 sm:w-auto">
                  <CheckCircleIcon className="h-5 w-5" />
                  Already Resolved
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    sendToHR(
                      selectedIncident
                    )
                  }
                  disabled={sendToHRLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {sendToHRLoading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-5 w-5" />
                      Send to HR
                    </>
                  )}
                </button>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentReports;
