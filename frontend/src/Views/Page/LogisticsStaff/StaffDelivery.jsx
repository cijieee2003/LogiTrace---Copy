import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import axiosClient from "../../../api/axiosClient";

import {
    DocumentTextIcon,
} from "@heroicons/react/24/outline";

const STATUS_LABELS = {
    pending: "Pending",
    arrival: "Arrival",
    queuing: "Queuing",
    unloading: "Unloading",
    checking: "Checking",
    delivered: "Delivered",
};

const STATUS_CLASSES = {
    pending: "bg-yellow-100 text-yellow-700",
    arrival: "bg-blue-100 text-blue-700",
    queuing: "bg-purple-100 text-purple-700",
    unloading: "bg-orange-100 text-orange-700",
    checking: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
};

const TRACKING_STATUSES = [
    "arrival",
    "queuing",
    "unloading",
    "checking",
    "delivered",
];

const StaffDelivery = () => {
    /*
    |--------------------------------------------------------------------------
    | DELIVERY STATES
    |--------------------------------------------------------------------------
    */

    const [deliveries, setDeliveries] = useState([]);
    const [incidents, setIncidents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [selectedDelivery, setSelectedDelivery] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | INCIDENT STATES
    |--------------------------------------------------------------------------
    */

    const [incidentLoading, setIncidentLoading] =
        useState(false);

    const [incidentError, setIncidentError] =
        useState("");

    const [selectedIncident, setSelectedIncident] =
        useState(null);

    const [showIncidentModal, setShowIncidentModal] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | PDF DOWNLOAD STATE
    |--------------------------------------------------------------------------
    */

    const [pdfLoading, setPdfLoading] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const [currentPage, setCurrentPage] =
        useState(1);

    const itemsPerPage = 10;

    /*
    |--------------------------------------------------------------------------
    | FETCH DELIVERY DATA
    |--------------------------------------------------------------------------
    */

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                deliveryResponse,
                incidentResponse,
            ] = await Promise.all([
                axiosClient.get(
                    "/staff/deliveries"
                ),

                axiosClient.get("/incidents"),
            ]);

            const deliveryData =
                deliveryResponse.data?.deliveries ||
                [];

            const incidentData =
                incidentResponse.data?.incidents ||
                [];

            setDeliveries(deliveryData);
            setIncidents(incidentData);

            setCurrentPage(1);
        } catch (error) {
            console.error(
                "Failed to fetch staff delivery data:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Failed to load deliveries."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | INCIDENT MATCHING
    |--------------------------------------------------------------------------
    */

    const incidentBelongsToDelivery = (
        incident,
        deliveryId
    ) => {
        return (
            Number(incident?.delivery_id) ===
                Number(deliveryId) ||
            Number(incident?.delivery?.id) ===
                Number(deliveryId)
        );
    };

    /*
    |--------------------------------------------------------------------------
    | INCIDENT LOOKUP
    |--------------------------------------------------------------------------
    */

    const incidentsByDeliveryId = useMemo(() => {
        return incidents.reduce(
            (map, incident) => {
                const deliveryId = Number(
                    incident?.delivery_id ??
                        incident?.delivery?.id
                );

                if (!Number.isNaN(deliveryId)) {
                    if (!map[deliveryId]) {
                        map[deliveryId] = [];
                    }

                    map[deliveryId].push(
                        incident
                    );
                }

                return map;
            },
            {}
        );
    }, [incidents]);

    /*
    |--------------------------------------------------------------------------
    | GET DELIVERY INCIDENTS
    |--------------------------------------------------------------------------
    */

    const getDeliveryIncidents = (
        delivery
    ) => {
        if (!delivery?.id) {
            return [];
        }

        const deliveryId = Number(
            delivery.id
        );

        const lookupIncidents =
            incidentsByDeliveryId[
                deliveryId
            ] || [];

        if (lookupIncidents.length > 0) {
            return lookupIncidents;
        }

        return incidents.filter(
            (incident) =>
                incidentBelongsToDelivery(
                    incident,
                    deliveryId
                )
        );
    };

    /*
    |--------------------------------------------------------------------------
    | GET FIRST INCIDENT
    |--------------------------------------------------------------------------
    */

    const getDeliveryIncident = (
        delivery
    ) => {
        return (
            getDeliveryIncidents(
                delivery
            )[0] || null
        );
    };

    /*
    |--------------------------------------------------------------------------
    | DATE FORMAT
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) {
            return "Not recorded";
        }

        try {
            return new Intl.DateTimeFormat(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }
            ).format(new Date(date));
        } catch {
            return "Not recorded";
        }
    };

    const formatDateTime = (date) => {
        if (!date) {
            return "Not recorded";
        }

        try {
            return new Intl.DateTimeFormat(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                }
            ).format(new Date(date));
        } catch {
            return "Not recorded";
        }
    };

    /*
    |--------------------------------------------------------------------------
    | STATUS HISTORY
    |--------------------------------------------------------------------------
    */

    const getStatusHistories = (
        delivery
    ) => {
        return (
            delivery?.statusHistories ||
            delivery?.status_histories ||
            []
        );
    };

    const getStatusTimestamp = (
        delivery,
        status
    ) => {
        const histories =
            getStatusHistories(
                delivery
            );

        if (!Array.isArray(histories)) {
            return null;
        }

        const matchingHistories =
            histories
                .filter(
                    (history) =>
                        String(
                            history?.status ||
                                ""
                        ).toLowerCase() ===
                        status.toLowerCase()
                )
                .sort((a, b) => {
                    const dateA =
                        new Date(
                            a?.changed_at ||
                                a?.created_at ||
                                a?.updated_at ||
                                0
                        ).getTime();

                    const dateB =
                        new Date(
                            b?.changed_at ||
                                b?.created_at ||
                                b?.updated_at ||
                                0
                        ).getTime();

                    return dateB - dateA;
                });

        if (
            matchingHistories.length ===
            0
        ) {
            return null;
        }

        return (
            matchingHistories[0]
                ?.changed_at ||
            matchingHistories[0]
                ?.created_at ||
            matchingHistories[0]
                ?.updated_at ||
            null
        );
    };

    /*
    |--------------------------------------------------------------------------
    | DELIVERY DATE & TIME
    |--------------------------------------------------------------------------
    */

    const getDeliveryDateTime = (
        delivery
    ) => {
        const deliveredTimestamp =
            getStatusTimestamp(
                delivery,
                "delivered"
            );

        if (deliveredTimestamp) {
            return formatDateTime(
                deliveredTimestamp
            );
        }

        if (delivery?.delivery_date) {
            return formatDateTime(
                delivery.delivery_date
            );
        }

        return "Not scheduled";
    };

    /*
    |--------------------------------------------------------------------------
    | PAGINATION CALCULATION
    |--------------------------------------------------------------------------
    */

    const totalPages = Math.ceil(
        deliveries.length /
            itemsPerPage
    );

    const startIndex =
        (currentPage - 1) *
        itemsPerPage;

    const paginatedDeliveries =
        deliveries.slice(
            startIndex,
            startIndex +
                itemsPerPage
        );

    /*
    |--------------------------------------------------------------------------
    | KEEP PAGE VALID
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            totalPages > 0 &&
            currentPage > totalPages
        ) {
            setCurrentPage(totalPages);
        }

        if (
            totalPages === 0 &&
            currentPage !== 1
        ) {
            setCurrentPage(1);
        }
    }, [
        totalPages,
        currentPage,
    ]);

    /*
    |--------------------------------------------------------------------------
    | PAGINATION PAGE NUMBERS
    |--------------------------------------------------------------------------
    */

    const getPaginationPages = () => {
        const pages = [];

        if (totalPages <= 7) {
            for (
                let page = 1;
                page <= totalPages;
                page++
            ) {
                pages.push(page);
            }

            return pages;
        }

        pages.push(1);

        if (currentPage > 3) {
            pages.push("...");
        }

        const startPage =
            Math.max(
                2,
                currentPage - 1
            );

        const endPage =
            Math.min(
                totalPages - 1,
                currentPage + 1
            );

        for (
            let page = startPage;
            page <= endPage;
            page++
        ) {
            pages.push(page);
        }

        if (
            currentPage <
            totalPages - 2
        ) {
            pages.push("...");
        }

        pages.push(totalPages);

        return pages;
    };

    /*
    |--------------------------------------------------------------------------
    | VIEW DELIVERY DETAILS
    |--------------------------------------------------------------------------
    */

    const handleViewDetails = (
        delivery
    ) => {
        setSelectedDelivery(
            delivery
        );
    };

    /*
    |--------------------------------------------------------------------------
    | CLOSE DELIVERY DETAILS
    |--------------------------------------------------------------------------
    */

    const handleCloseDetails = () => {
        setSelectedDelivery(
            null
        );
    };

    /*
    |--------------------------------------------------------------------------
    | VIEW INCIDENT
    |--------------------------------------------------------------------------
    */

    const handleViewIncident = async (
        delivery
    ) => {
        try {
            setIncidentLoading(true);

            setIncidentError("");

            setSelectedIncident(
                null
            );

            const response =
                await axiosClient.get(
                    `/staff/deliveries/${delivery.id}/incidents`
                );

            const incidentData =
                response.data?.incidents;

            if (
                !Array.isArray(
                    incidentData
                ) ||
                incidentData.length ===
                    0
            ) {
                setIncidentError(
                    "No incident report was found for this delivery."
                );

                setShowIncidentModal(
                    true
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | LATEST INCIDENT
            |--------------------------------------------------------------------------
            */

            const incident =
                incidentData[0];

            /*
            |--------------------------------------------------------------------------
            | KEEP SAVED VALUES
            |--------------------------------------------------------------------------
            */

            setSelectedIncident({
                ...incident,

                incident_type:
                    incident.incident_type ||
                    "—",

                department_concerned:
                    incident.department_concerned ||
                    "—",

                department_email:
                    incident.department_email ||
                    "—",
            });

            setShowIncidentModal(
                true
            );
        } catch (err) {
            console.error(
                "Failed to load incident report:",
                err
            );

            setIncidentError(
                err.response?.data
                    ?.message ||
                    "Failed to load incident report."
            );

            setShowIncidentModal(
                true
            );
        } finally {
            setIncidentLoading(
                false
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | CLOSE INCIDENT MODAL
    |--------------------------------------------------------------------------
    */

    const closeIncidentModal = () => {
        if (
            pdfLoading ||
            incidentLoading
        ) {
            return;
        }

        setShowIncidentModal(
            false
        );

        setSelectedIncident(
            null
        );

        setIncidentError("");
    };

    /*
    |--------------------------------------------------------------------------
    | DOWNLOAD INCIDENT PDF
    |--------------------------------------------------------------------------
    */

    const handleDownloadIncidentPdf =
        async () => {
            if (
                !selectedIncident?.id
            ) {
                return;
            }

            try {
                setPdfLoading(true);

                const response =
                    await axiosClient.get(
                        `/incidents/${selectedIncident.id}/pdf`,
                        {
                            responseType:
                                "blob",
                        }
                    );

                const blob =
                    new Blob(
                        [response.data],
                        {
                            type: "application/pdf",
                        }
                    );

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement(
                        "a"
                    );

                link.href = url;

                link.download = `${
                    selectedIncident.incident_number ||
                    "incident-report"
                }.pdf`;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );
            } catch (err) {
                console.error(
                    "Failed to download incident PDF:",
                    err
                );

                window.alert(
                    err.response?.data
                        ?.message ||
                        "Failed to download incident report PDF."
                );
            } finally {
                setPdfLoading(false);
            }
        };

    /*
    |--------------------------------------------------------------------------
    | DELIVERY TIMELINE
    |--------------------------------------------------------------------------
    */

    const renderTimeline = (
        delivery
    ) => {
        return (
            <div className="mt-5">
                <div className="relative">

                    {TRACKING_STATUSES.map(
                        (
                            status,
                            index
                        ) => {
                            const timestamp =
                                getStatusTimestamp(
                                    delivery,
                                    status
                                );

                            const isCompleted =
                                !!timestamp;

                            return (
                                <div
                                    key={
                                        status
                                    }
                                    className="relative flex gap-4 pb-7 last:pb-0"
                                >
                                    {index !==
                                        TRACKING_STATUSES.length -
                                            1 && (
                                        <div className="absolute left-[9px] top-5 h-full w-px bg-gray-200" />
                                    )}

                                    <div
                                        className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                            isCompleted
                                                ? "border-blue-600 bg-blue-600"
                                                : "border-gray-300 bg-white"
                                        }`}
                                    >
                                        {isCompleted && (
                                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                                            <p
                                                className={`text-sm font-semibold ${
                                                    isCompleted
                                                        ? "text-gray-800"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {
                                                    STATUS_LABELS[
                                                        status
                                                    ]
                                                }
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {timestamp
                                                    ? formatDateTime(
                                                          timestamp
                                                      )
                                                    : "Not recorded"}
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    )}

                </div>
            </div>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | LOADING SCREEN
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
    | MAIN UI
    |--------------------------------------------------------------------------
    */

    return (
        <div className="w-full p-3 sm:p-5 lg:p-6">

            {/* =========================================================
                HEADER
            ========================================================= */}

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
                        Delivery Tracking
                    </h1>

                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        Monitor delivery progress,
                        timestamps, and reported
                        incidents.
                    </p>
                </div>

                

            </div>

            {/* =========================================================
                SUCCESS
            ========================================================= */}

            {message && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                </div>
            )}

            {/* =========================================================
                ERROR
            ========================================================= */}

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* =========================================================
                SUMMARY CARDS
            ========================================================= */}

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-gray-500">
                        Total Deliveries
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-800">
                        {
                            deliveries.length
                        }
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-gray-500">
                        Reported Incidents
                    </p>

                    <p className="mt-1 text-2xl font-bold text-red-600">
                        {
                            incidents.length
                        }
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-gray-500">
                        Current Page
                    </p>

                    <p className="mt-1 text-2xl font-bold text-blue-600">
                        {currentPage}

                        <span className="ml-1 text-sm font-medium text-gray-400">
                            /{" "}
                            {totalPages ||
                                1}
                        </span>
                    </p>
                </div>

            </div>

            {/* =========================================================
                TABLE
            ========================================================= */}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="min-w-[1000px] w-full border-collapse">

                        {/* TABLE HEADER */}

                        <thead>
                            <tr className="bg-gray-50">

                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                    Tracking Number
                                </th>

                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                    Customer Name
                                </th>

                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                    Customer Address
                                </th>

                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                    Delivery Date & Time
                                </th>

                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                    Status
                                </th>

                                <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                    Action
                                </th>

                            </tr>
                        </thead>

                        {/* TABLE BODY */}

                        <tbody>

                            {paginatedDeliveries.length ===
                            0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-4 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center">

                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                                <svg
                                                    className="h-6 w-6 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>

                                            <p className="text-sm font-semibold text-gray-700">
                                                No deliveries found
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                There are currently no delivery records.
                                            </p>

                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedDeliveries.map(
                                    (
                                        delivery
                                    ) => {
                                        const deliveryIncidents =
                                            getDeliveryIncidents(
                                                delivery
                                            );

                                        const hasIncident =
                                            deliveryIncidents.length >
                                            0;

                                        const status =
                                            String(
                                                delivery?.status ||
                                                    "pending"
                                            ).toLowerCase();

                                        return (
                                            <tr
                                                key={
                                                    delivery.id
                                                }
                                                className={`group transition ${
                                                    hasIncident
                                                        ? "bg-red-50/40"
                                                        : "hover:bg-gray-50"
                                                }`}
                                            >

                                                {/* TRACKING NUMBER */}

                                                <td
                                                    className={`px-4 py-4 align-middle ${
                                                        hasIncident
                                                            ? "border-y-2 border-l-2 border-red-500"
                                                            : "border-b border-gray-100"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">

                                                        {hasIncident && (
                                                            <span
                                                                className="h-2 w-2 shrink-0 rounded-full bg-red-500"
                                                                title="Incident reported"
                                                            />
                                                        )}

                                                        <div>

                                                            <p className="text-sm font-bold text-gray-800">
                                                                {delivery?.dr_number ||
                                                                    delivery?.tracking_number ||
                                                                    "N/A"}
                                                            </p>

                                                            {hasIncident && (
                                                                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                                                                    Incident Reported
                                                                </p>
                                                            )}

                                                        </div>

                                                    </div>
                                                </td>

                                                {/* CUSTOMER NAME */}

                                                <td
                                                    className={`px-4 py-4 align-middle ${
                                                        hasIncident
                                                            ? "border-y-2 border-red-500"
                                                            : "border-b border-gray-100"
                                                    }`}
                                                >
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {delivery?.recipient_name ||
                                                            delivery?.customer_name ||
                                                            "N/A"}
                                                    </p>
                                                </td>

                                                {/* CUSTOMER ADDRESS */}

                                                <td
                                                    className={`px-4 py-4 align-middle ${
                                                        hasIncident
                                                            ? "border-y-2 border-red-500"
                                                            : "border-b border-gray-100"
                                                    }`}
                                                >
                                                    <p className="max-w-[250px] truncate text-sm text-gray-600">
                                                        {delivery?.delivery_address ||
                                                            delivery?.customer_address ||
                                                            "N/A"}
                                                    </p>
                                                </td>

                                                {/* DELIVERY DATE */}

                                                <td
                                                    className={`px-4 py-4 align-middle ${
                                                        hasIncident
                                                            ? "border-y-2 border-red-500"
                                                            : "border-b border-gray-100"
                                                    }`}
                                                >
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {getDeliveryDateTime(
                                                            delivery
                                                        )}
                                                    </p>
                                                </td>

                                                {/* STATUS */}

                                                <td
                                                    className={`px-4 py-4 align-middle ${
                                                        hasIncident
                                                            ? "border-y-2 border-red-500"
                                                            : "border-b border-gray-100"
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                                            STATUS_CLASSES[
                                                                status
                                                            ] ||
                                                            "bg-gray-100 text-gray-600"
                                                        }`}
                                                    >
                                                        {STATUS_LABELS[
                                                            status
                                                        ] ||
                                                            status}
                                                    </span>
                                                </td>

                                                {/* ACTION */}

                                                <td
                                                    className={`px-4 py-4 text-center align-middle ${
                                                        hasIncident
                                                            ? "border-y-2 border-r-2 border-red-500"
                                                            : "border-b border-gray-100"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-center gap-2">

                                                        {/* VIEW DETAILS */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    delivery
                                                                )
                                                            }
                                                            title="View Delivery Details"
                                                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                                                hasIncident
                                                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                            }`}
                                                        >
                                                            View Details
                                                        </button>

                                                        {/* INCIDENT */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleViewIncident(
                                                                    delivery
                                                                )
                                                            }
                                                            title={
                                                                hasIncident
                                                                    ? "View Incident Report"
                                                                    : "No Incident Report"
                                                            }
                                                            className={`rounded-lg border p-2 transition ${
                                                                hasIncident
                                                                    ? "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100"
                                                                    : "border-green-200 bg-green-50 text-green-600 hover:border-green-300 hover:bg-green-100"
                                                            }`}
                                                        >
                                                            <DocumentTextIcon className="h-4 w-4" />
                                                        </button>

                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    }
                                )
                            )}

                        </tbody>

                    </table>

                </div>

                {/* =====================================================
                    PAGINATION
                ===================================================== */}

                {deliveries.length >
                    0 && (
                    <div className="border-t border-gray-200 bg-white px-4 py-4">

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            {/* SHOWING */}

                            <div className="text-center text-xs text-gray-500 lg:text-left">

                                Showing{" "}

                                <span className="font-semibold text-gray-700">
                                    {startIndex +
                                        1}
                                </span>

                                {" "}to{" "}

                                <span className="font-semibold text-gray-700">
                                    {Math.min(
                                        startIndex +
                                            itemsPerPage,
                                        deliveries.length
                                    )}
                                </span>

                                {" "}of{" "}

                                <span className="font-semibold text-gray-700">
                                    {
                                        deliveries.length
                                    }
                                </span>

                                {" "}deliveries

                            </div>

                            {/* PAGINATION CONTROLS */}

                            <div className="flex items-center justify-center gap-1">

                                {/* PREVIOUS */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage(
                                            (
                                                prev
                                            ) =>
                                                Math.max(
                                                    prev -
                                                        1,
                                                    1
                                                )
                                        )
                                    }
                                    disabled={
                                        currentPage ===
                                        1
                                    }
                                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                        currentPage ===
                                        1
                                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    Previous
                                </button>

                                {/* PAGE NUMBERS */}

                                <div className="flex items-center gap-1">

                                    {getPaginationPages().map(
                                        (
                                            page,
                                            index
                                        ) => {
                                            if (
                                                page ===
                                                "..."
                                            ) {
                                                return (
                                                    <span
                                                        key={`ellipsis-${index}`}
                                                        className="flex h-8 min-w-8 items-center justify-center px-1 text-xs font-semibold text-gray-400"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={
                                                        page
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        setCurrentPage(
                                                            page
                                                        )
                                                    }
                                                    className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                                                        currentPage ===
                                                        page
                                                            ? "bg-blue-600 text-white shadow-sm"
                                                            : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {
                                                        page
                                                    }
                                                </button>
                                            );
                                        }
                                    )}

                                </div>

                                {/* NEXT */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage(
                                            (
                                                prev
                                            ) =>
                                                Math.min(
                                                    prev +
                                                        1,
                                                    totalPages
                                                )
                                        )
                                    }
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                        currentPage ===
                                        totalPages
                                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    Next
                                </button>

                            </div>

                        </div>

                    </div>
                )}

            </div>

            {/* =========================================================
                DELIVERY DETAILS MODAL
            ========================================================= */}

            {selectedDelivery && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
                    onClick={
                        handleCloseDetails
                    }
                >

                    <div
                        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* HEADER */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">

                            <div>

                                <h2 className="text-lg font-bold text-gray-800">
                                    Delivery Details
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Tracking #{" "}

                                    <span className="font-semibold text-gray-700">
                                        {selectedDelivery?.dr_number ||
                                            selectedDelivery?.tracking_number ||
                                            "N/A"}
                                    </span>
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleCloseDetails
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>

                        </div>

                        <div className="p-5 sm:p-6">

                            {/* INCIDENT WARNING */}

                            {getDeliveryIncidents(
                                selectedDelivery
                            ).length >
                                0 && (
                                <div className="mb-5 rounded-xl border-2 border-red-500 bg-red-50 p-4">

                                    <div className="flex gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">

                                            <svg
                                                className="h-5 w-5 text-red-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z"
                                                />
                                            </svg>

                                        </div>

                                        <div>

                                            <h3 className="text-sm font-bold text-red-700">
                                                Incident Reported
                                            </h3>

                                            <p className="mt-1 text-xs leading-5 text-red-600">
                                                This delivery has{" "}
                                                {
                                                    getDeliveryIncidents(
                                                        selectedDelivery
                                                    ).length
                                                }{" "}
                                                reported incident
                                                {getDeliveryIncidents(
                                                    selectedDelivery
                                                ).length >
                                                1
                                                    ? "s"
                                                    : ""}.
                                            </p>

                                        </div>

                                    </div>

                                </div>
                            )}

                            {/* CUSTOMER INFORMATION */}

                            <div className="mb-6">

                                <h3 className="mb-3 text-sm font-bold text-gray-800">
                                    Customer Information
                                </h3>

                                <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                            Customer Name
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-800">
                                            {selectedDelivery?.recipient_name ||
                                                selectedDelivery?.customer_name ||
                                                "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                            Tracking Number
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-800">
                                            {selectedDelivery?.dr_number ||
                                                selectedDelivery?.tracking_number ||
                                                "N/A"}
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2">

                                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                            Customer Address
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-700">
                                            {selectedDelivery?.delivery_address ||
                                                selectedDelivery?.customer_address ||
                                                "N/A"}
                                        </p>

                                    </div>

                                    <div>

                                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                            Delivery Date
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-700">
                                            {formatDate(
                                                selectedDelivery?.delivery_date
                                            )}
                                        </p>

                                    </div>

                                    <div>

                                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                            Current Status
                                        </p>

                                        <div className="mt-1">

                                            {(() => {
                                                const status =
                                                    String(
                                                        selectedDelivery?.status ||
                                                            "pending"
                                                    ).toLowerCase();

                                                return (
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                                            STATUS_CLASSES[
                                                                status
                                                            ] ||
                                                            "bg-gray-100 text-gray-600"
                                                        }`}
                                                    >
                                                        {STATUS_LABELS[
                                                            status
                                                        ] ||
                                                            status}
                                                    </span>
                                                );
                                            })()}

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* DELIVERY TIMELINE */}

                            <div className="mb-6">

                                <h3 className="text-sm font-bold text-gray-800">
                                    Delivery Timeline
                                </h3>

                                <p className="mt-1 text-xs text-gray-500">
                                    Arrival, Queuing,
                                    Unloading, Checking,
                                    and Delivered timestamps.
                                </p>

                                {renderTimeline(
                                    selectedDelivery
                                )}

                            </div>

                            {/* INCIDENT INFORMATION */}

                            {getDeliveryIncidents(
                                selectedDelivery
                            ).length >
                                0 && (
                                <div className="mb-6">

                                    <h3 className="mb-3 text-sm font-bold text-red-700">
                                        Incident Information
                                    </h3>

                                    <div className="space-y-4">

                                        {getDeliveryIncidents(
                                            selectedDelivery
                                        ).map(
                                            (
                                                incident
                                            ) => (
                                                <div
                                                    key={
                                                        incident.id
                                                    }
                                                    className="rounded-xl border-2 border-red-200 bg-red-50 p-4"
                                                >

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-wide text-red-400">
                                                                Incident Number
                                                            </p>

                                                            <p className="mt-1 text-sm font-bold text-red-700">
                                                                {incident?.incident_number ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-wide text-red-400">
                                                                Incident Type
                                                            </p>

                                                            <p className="mt-1 text-sm font-semibold text-red-700">
                                                                {incident?.incident_type ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-wide text-red-400">
                                                                Department Concerned
                                                            </p>

                                                            <p className="mt-1 text-sm font-medium text-gray-700">
                                                                {incident?.department_concerned ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-wide text-red-400">
                                                                Status
                                                            </p>

                                                            <p className="mt-1 text-sm font-semibold capitalize text-gray-700">
                                                                {incident?.status ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>

                                                        <div className="sm:col-span-2">

                                                            <p className="text-[10px] font-bold uppercase tracking-wide text-red-400">
                                                                Description
                                                            </p>

                                                            <p className="mt-1 rounded-lg border border-red-100 bg-white p-3 text-sm leading-6 text-gray-700">
                                                                {incident?.description ||
                                                                    "No description provided."}
                                                            </p>

                                                        </div>

                                                        <div>

                                                            <p className="text-[10px] font-bold uppercase tracking-wide text-red-400">
                                                                Reported At
                                                            </p>

                                                            <p className="mt-1 text-sm text-gray-700">
                                                                {formatDateTime(
                                                                    incident?.created_at
                                                                )}
                                                            </p>

                                                        </div>

                                                        <div>

                                                            <p className="text-[10px] font-bold uppercase tracking-wide text-red-400">
                                                                Quantity Affected
                                                            </p>

                                                            <p className="mt-1 text-sm text-gray-700">
                                                                {incident?.quantity_affected ??
                                                                    "None"}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                            {/* NO INCIDENT */}

                            {getDeliveryIncidents(
                                selectedDelivery
                            ).length ===
                                0 && (
                                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">

                                            <svg
                                                className="h-5 w-5 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>

                                        </div>

                                        <div>

                                            <p className="text-sm font-bold text-green-700">
                                                No Incident Report
                                            </p>

                                            <p className="mt-1 text-xs text-green-600">
                                                No incident has been reported for this delivery.
                                            </p>

                                        </div>

                                    </div>

                                </div>
                            )}

                        </div>

                        {/* FOOTER */}

                        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">

                            <button
                                type="button"
                                onClick={
                                    handleCloseDetails
                                }
                                className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900"
                            >
                                Close
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* =========================================================
                INCIDENT REPORT MODAL
            ========================================================= */}

            {showIncidentModal && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 sm:p-5"
                    onClick={
                        closeIncidentModal
                    }
                >

                    <div
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* INCIDENT HEADER */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">

                                    <DocumentTextIcon className="h-5 w-5 text-red-600" />

                                </div>

                                <div>

                                    <h2 className="text-lg font-bold text-gray-800">
                                        Incident Report
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        Delivery incident details
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeIncidentModal
                                }
                                disabled={
                                    pdfLoading ||
                                    incidentLoading
                                }
                                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                                    pdfLoading ||
                                    incidentLoading
                                        ? "cursor-not-allowed bg-gray-100 text-gray-300"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                                }`}
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>

                        </div>

                        {/* INCIDENT CONTENT */}

                        <div className="p-5 sm:p-6">

                            {/* LOADING */}

                            {incidentLoading && (
                                <div className="flex flex-col items-center justify-center py-12">

                                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />

                                    <p className="mt-3 text-sm text-gray-500">
                                        Loading incident report...
                                    </p>

                                </div>
                            )}

                            {/* ERROR */}

                            {!incidentLoading &&
                                incidentError && (
                                    <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">

                                        <div className="flex gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">

                                                <svg
                                                    className="h-5 w-5 text-red-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z"
                                                    />
                                                </svg>

                                            </div>

                                            <div>

                                                <p className="text-sm font-bold text-red-700">
                                                    Incident Report
                                                </p>

                                                <p className="mt-1 text-xs text-red-600">
                                                    {
                                                        incidentError
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                    </div>
                                )}

                            {/* INCIDENT DETAILS */}

                            {!incidentLoading &&
                                !incidentError &&
                                selectedIncident && (
                                    <div className="space-y-5">

                                        {/* INCIDENT NUMBER */}

                                        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                                <div>

                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">
                                                        Incident Number
                                                    </p>

                                                    <p className="mt-1 text-base font-bold text-red-700">
                                                        {selectedIncident.incident_number ||
                                                            "—"}
                                                    </p>

                                                </div>

                                                <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
                                                    {selectedIncident.status ||
                                                        "open"}
                                                </span>

                                            </div>

                                        </div>

                                        {/* INCIDENT INFORMATION */}

                                        <div>

                                            <h3 className="mb-3 text-sm font-bold text-gray-800">
                                                Incident Information
                                            </h3>

                                            <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">

                                                {/* TYPE */}

                                                <div>

                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                                        Incident Type
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                                        {
                                                            selectedIncident.incident_type
                                                        }
                                                    </p>

                                                </div>

                                                {/* DEPARTMENT */}

                                                <div>

                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                                        Department Concerned
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                                        {
                                                            selectedIncident.department_concerned
                                                        }
                                                    </p>

                                                </div>

                                                {/* EMAIL */}

                                                <div className="sm:col-span-2">

                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                                        Department Email
                                                    </p>

                                                    <p className="mt-1 break-all text-sm font-medium text-gray-700">
                                                        {
                                                            selectedIncident.department_email
                                                        }
                                                    </p>

                                                </div>

                                                {/* QUANTITY REQUIRED */}

                                                <div>

                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                                        Quantity Required
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-gray-700">
                                                        {selectedIncident.quantity_required
                                                            ? "Yes"
                                                            : "No"}
                                                    </p>

                                                </div>

                                                {/* QUANTITY AFFECTED */}

                                                <div>

                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                                        Quantity Affected
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-gray-700">
                                                        {selectedIncident.quantity_affected ??
                                                            "—"}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                        {/* DESCRIPTION */}

                                        <div>

                                            <h3 className="mb-3 text-sm font-bold text-gray-800">
                                                Description
                                            </h3>

                                            <div className="rounded-xl border border-gray-200 bg-white p-4">

                                                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                                    {selectedIncident.description ||
                                                        "No description provided."}
                                                </p>

                                            </div>

                                        </div>

                                        {/* EVIDENCE PHOTO */}

                                        {selectedIncident.evidence_photo && (
                                            <div>

                                                <h3 className="mb-3 text-sm font-bold text-gray-800">
                                                    Evidence Photo
                                                </h3>

                                                <div className="overflow-hidden rounded-xl border border-gray-200">

                                                    <img
                                                        src={
                                                            selectedIncident.evidence_photo
                                                        }
                                                        alt="Incident evidence"
                                                        className="max-h-[400px] w-full object-contain"
                                                    />

                                                </div>

                                            </div>
                                        )}

                                        {/* REPORT INFORMATION */}

                                        <div>

                                            <h3 className="mb-3 text-sm font-bold text-gray-800">
                                                Report Information
                                            </h3>

                                            <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">

                                                <div>

                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                                        Reported At
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-700">
                                                        {formatDateTime(
                                                            selectedIncident.created_at
                                                        )}
                                                    </p>

                                                </div>

                                                <div>

                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                                        Last Updated
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-700">
                                                        {formatDateTime(
                                                            selectedIncident.updated_at
                                                        )}
                                                    </p>

                                                </div>

                                                {selectedIncident.reviewed_at && (
                                                    <div className="sm:col-span-2">

                                                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                                            Reviewed At
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-700">
                                                            {formatDateTime(
                                                                selectedIncident.reviewed_at
                                                            )}
                                                        </p>

                                                    </div>
                                                )}

                                            </div>

                                        </div>

                                        {/* STAFF REMARKS */}

                                        {selectedIncident.staff_remarks && (
                                            <div>

                                                <h3 className="mb-3 text-sm font-bold text-gray-800">
                                                    Staff Remarks
                                                </h3>

                                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                                        {
                                                            selectedIncident.staff_remarks
                                                        }
                                                    </p>

                                                </div>

                                            </div>
                                        )}

                                    </div>
                                )}

                        </div>

                        {/* INCIDENT FOOTER */}

                        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">

                                {/* DOWNLOAD PDF */}

                                {selectedIncident && (
                                    <button
                                        type="button"
                                        onClick={
                                            handleDownloadIncidentPdf
                                        }
                                        disabled={
                                            pdfLoading
                                        }
                                        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition sm:w-auto ${
                                            pdfLoading
                                                ? "cursor-not-allowed bg-blue-400"
                                                : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                    >

                                        {pdfLoading ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                                                    />
                                                </svg>

                                                Download PDF
                                            </>
                                        )}

                                    </button>
                                )}

                                {/* CLOSE */}



                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default StaffDelivery;