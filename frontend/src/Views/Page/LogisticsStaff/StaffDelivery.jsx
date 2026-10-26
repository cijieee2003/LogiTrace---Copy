import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import axiosClient from "../../../api/axiosClient";

import {
    DocumentTextIcon,
    TruckIcon,
    MapPinIcon,
    UserIcon,
    CubeIcon,
    CalendarDaysIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    EyeIcon,
    ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

// =========================================================
// STATUS LABELS
// =========================================================

const STATUS_LABELS = {
    pending: "Pending",
    pick_up: "Pick Up",
    arrival: "Arrival",
    queuing: "Queuing",
    unloading: "Unloading",
    checking: "Checking",
    delivered: "Delivered",
};

// =========================================================
// STATUS CLASSES
// =========================================================

const STATUS_CLASSES = {
    pending: "bg-gray-100 text-gray-600",
    pick_up: "bg-cyan-100 text-cyan-700",
    arrival: "bg-blue-100 text-blue-700",
    queuing: "bg-indigo-100 text-indigo-700",
    unloading: "bg-purple-100 text-purple-700",
    checking: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
};

// =========================================================
// TRACKING ORDER
// =========================================================

const TRACKING_STATUSES = [
    "pick_up",
    "arrival",
    "queuing",
    "unloading",
    "checking",
    "delivered",
];

// =========================================================
// COMPONENT
// =========================================================

const StaffDelivery = () => {
    // =====================================================
    // STATES
    // =====================================================

    const [deliveries, setDeliveries] = useState([]);
    const [incidents, setIncidents] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [selectedDelivery, setSelectedDelivery] =
        useState(null);

    const [incidentLoading, setIncidentLoading] =
        useState(false);

    const [incidentError, setIncidentError] =
        useState("");

    const [selectedIncident, setSelectedIncident] =
        useState(null);

    const [showIncidentModal, setShowIncidentModal] =
        useState(false);

    const [pdfLoading, setPdfLoading] =
        useState(false);

    const [currentPage, setCurrentPage] =
        useState(1);

    const [itemsPerPage] = useState(10);

    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    // =====================================================
    // DATE + TIME FORMAT
    // =====================================================

    const formatDateTime = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }
        );
    };

    // =====================================================
    // TIME ONLY
    // =====================================================

    const formatTime = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            }
        );
    };

    // =====================================================
    // NORMALIZE STATUS
    // =====================================================

    const normalizeStatus = (status) => {
        return String(status || "")
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_");
    };

    // =====================================================
    // STATUS HISTORIES
    // =====================================================

    const getStatusHistories = (delivery) => {
        const histories =
            delivery?.status_histories ??
            delivery?.statusHistories ??
            delivery?.status_history ??
            delivery?.statusHistory ??
            [];

        return Array.isArray(histories)
            ? histories
            : [];
    };

    // =====================================================
    // GET EXACT STATUS HISTORY
    // =====================================================

    const getStatusHistory = (
        delivery,
        status
    ) => {
        const histories =
            getStatusHistories(delivery);

        if (histories.length === 0) {
            return null;
        }

        const normalizedStatus =
            normalizeStatus(status);

        const matchingHistories =
            histories.filter((history) => {
                return (
                    normalizeStatus(
                        history?.status
                    ) === normalizedStatus
                );
            });

        if (matchingHistories.length === 0) {
            return null;
        }

        matchingHistories.sort(
            (a, b) => {
                const dateA =
                    a?.changed_at
                        ? new Date(
                              a.changed_at
                          ).getTime()
                        : 0;

                const dateB =
                    b?.changed_at
                        ? new Date(
                              b.changed_at
                          ).getTime()
                        : 0;

                return dateB - dateA;
            }
        );

        return matchingHistories[0];
    };

    // =====================================================
    // GET STATUS TIMESTAMP
    // =====================================================

    const getStatusTimestamp = (
        delivery,
        status
    ) => {
        const history =
            getStatusHistory(
                delivery,
                status
            );

        if (!history) {
            return null;
        }

        return (
            history.changed_at ||
            history.created_at ||
            history.updated_at ||
            null
        );
    };

    // =====================================================
    // CURRENT DELIVERY STATUS
    // =====================================================

    const getCurrentDeliveryStatus = (
        delivery
    ) => {
        return normalizeStatus(
            delivery?.status
        );
    };

    // =====================================================
    // TIMELINE STATUS
    // =====================================================

    const getTimelineStatus = (
        delivery,
        status
    ) => {
        const history =
            getStatusHistory(
                delivery,
                status
            );

        const timestamp =
            getStatusTimestamp(
                delivery,
                status
            );

        const currentStatus =
            getCurrentDeliveryStatus(
                delivery
            );

        const statusIndex =
            TRACKING_STATUSES.indexOf(
                status
            );

        const currentStatusIndex =
            TRACKING_STATUSES.indexOf(
                currentStatus
            );

        if (history) {
            return {
                completed: true,
                current:
                    currentStatus === status,
                timestamp,
                history,
            };
        }

        if (
            currentStatusIndex >= 0 &&
            statusIndex >= 0 &&
            statusIndex <
                currentStatusIndex
        ) {
            return {
                completed: true,
                current: false,
                timestamp: null,
                history: null,
            };
        }

        if (
            currentStatus ===
            status
        ) {
            return {
                completed: false,
                current: true,
                timestamp: null,
                history: null,
            };
        }

        return {
            completed: false,
            current: false,
            timestamp: null,
            history: null,
        };
    };

    // =====================================================
    // DELIVERY DATE + TIME
    // =====================================================

    const getDeliveryDateTime = (
        delivery
    ) => {
        const deliveredHistory =
            getStatusHistory(
                delivery,
                "delivered"
            );

        if (
            deliveredHistory?.changed_at
        ) {
            return formatDateTime(
                deliveredHistory.changed_at
            );
        }

        if (
            delivery?.delivery_date
        ) {
            return formatDateTime(
                delivery.delivery_date
            );
        }

        return "Not scheduled";
    };

    // =====================================================
    // DELIVERY TIMELINE
    // =====================================================

    const renderTimeline = (
        delivery
    ) => {
        const histories =
            getStatusHistories(
                delivery
            )
                .slice()
                .sort(
                    (a, b) => {
                        const dateA =
                            a?.changed_at ||
                            a?.created_at ||
                            a?.updated_at;

                        const dateB =
                            b?.changed_at ||
                            b?.created_at ||
                            b?.updated_at;

                        const timeA =
                            dateA
                                ? new Date(
                                      dateA
                                  ).getTime()
                                : 0;

                        const timeB =
                            dateB
                                ? new Date(
                                      dateB
                                  ).getTime()
                                : 0;

                        return (
                            timeA - timeB
                        );
                    }
                );

        return (
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">

                {/* TIMELINE HEADER */}

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

                {/* NO HISTORY */}

                {histories.length === 0 ? (

                    <div className="rounded-xl bg-gray-50 p-5 text-center">

                        <ClockIcon className="mx-auto h-8 w-8 text-gray-300" />

                        <p className="mt-2 text-sm text-gray-400">
                            No status history available.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-0">

                        {histories.map(
                            (
                                history,
                                index
                            ) => {

                                const isLast =
                                    index ===
                                    histories.length -
                                        1;

                                const timestamp =
                                    history?.changed_at ||
                                    history?.created_at ||
                                    history?.updated_at;

                                const normalizedHistoryStatus =
                                    normalizeStatus(
                                        history?.status
                                    );

                                return (
                                    <div
                                        key={
                                            history?.id ||
                                            `${normalizedHistoryStatus}-${index}`
                                        }
                                        className="relative flex gap-3 sm:gap-4"
                                    >

                                        {!isLast && (
                                            <div className="absolute left-[11px] top-7 h-full w-px bg-green-200" />
                                        )}

                                        <div className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50">

                                            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />

                                        </div>

                                        <div className="min-w-0 flex-1 pb-6">

                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

                                                <div className="min-w-0">

                                                    <p className="break-words text-sm font-semibold text-gray-700">

                                                        {
                                                            STATUS_LABELS[
                                                                normalizedHistoryStatus
                                                            ] ||
                                                            history?.status ||
                                                            "N/A"
                                                        }

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
        );
    };

    // =====================================================
    // FETCH DATA
    // =====================================================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                deliveriesResponse,
                incidentsResponse,
            ] = await Promise.all([
                axiosClient.get(
                    "/staff/deliveries"
                ),
                axiosClient.get(
                    "/incidents"
                ),
            ]);

            const deliveryData =
                deliveriesResponse.data
                    ?.deliveries ||
                deliveriesResponse.data ||
                [];

            const incidentData =
                incidentsResponse.data
                    ?.incidents ||
                incidentsResponse.data ||
                [];

            setDeliveries(
                Array.isArray(
                    deliveryData
                )
                    ? deliveryData
                    : []
            );

            setIncidents(
                Array.isArray(
                    incidentData
                )
                    ? incidentData
                    : []
            );

        } catch (error) {
            console.error(
                "Failed to fetch staff delivery data:",
                error
            );

            setError(
                error.response?.data
                    ?.message ||
                "Failed to load delivery information."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL FETCH
    // =====================================================

    useEffect(() => {
        fetchData();
    }, []);

    // =====================================================
    // INCIDENT GROUPING
    // =====================================================

    const incidentsByDelivery =
        useMemo(() => {
            const grouped = {};

            incidents.forEach(
                (incident) => {
                    const deliveryId =
                        incident.delivery_id;

                    if (
                        !grouped[
                            deliveryId
                        ]
                    ) {
                        grouped[
                            deliveryId
                        ] = [];
                    }

                    grouped[
                        deliveryId
                    ].push(incident);
                }
            );

            return grouped;
        }, [incidents]);

    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages =
        Math.ceil(
            deliveries.length /
                itemsPerPage
        );

    const paginatedDeliveries =
        useMemo(() => {
            const startIndex =
                (currentPage - 1) *
                itemsPerPage;

            return deliveries.slice(
                startIndex,
                startIndex +
                    itemsPerPage
            );
        }, [
            deliveries,
            currentPage,
            itemsPerPage,
        ]);

    // =====================================================
    // OPEN DELIVERY DETAILS
    // =====================================================

    const openDeliveryDetails = (
        delivery
    ) => {
        setSelectedDelivery(
            delivery
        );
        setIncidentError("");
    };

    // =====================================================
    // CLOSE DELIVERY DETAILS
    // =====================================================

    const closeDeliveryDetails = () => {
        setSelectedDelivery(
            null
        );

        setIncidentError("");
    };

    // =====================================================
    // OPEN INCIDENT
    // =====================================================

    const openIncident = async (
        incident
    ) => {
        try {
            setIncidentLoading(
                true
            );

            setIncidentError("");

            setSelectedIncident(
                incident
            );

            setShowIncidentModal(
                true
            );

        } catch (error) {
            console.error(
                "Failed to open incident:",
                error
            );

            setIncidentError(
                "Failed to load incident details."
            );

        } finally {
            setIncidentLoading(
                false
            );
        }
    };

    // =====================================================
    // CLOSE INCIDENT
    // =====================================================

    const closeIncidentModal = () => {
        setShowIncidentModal(
            false
        );

        setSelectedIncident(
            null
        );

        setIncidentError("");
    };

    // =====================================================
    // DOWNLOAD INCIDENT PDF
    // =====================================================

    const downloadIncidentPdf = async (
        incident
    ) => {
        if (!incident?.id) {
            setIncidentError(
                "No incident selected for download."
            );

            return;
        }

        try {
            setPdfLoading(true);
            setIncidentError("");

            const response =
                await axiosClient.get(
                    `/incidents/${incident.id}/pdf`,
                    {
                        responseType:
                            "blob",

                        headers: {
                            Accept:
                                "application/pdf",
                        },
                    }
                );

            const contentType =
                response.headers?.[
                    "content-type"
                ] || "";

            if (
                !contentType.includes(
                    "application/pdf"
                )
            ) {
                try {
                    const errorText =
                        await response.data.text();

                    let errorMessage =
                        "The server did not return a PDF.";

                    try {
                        const errorData =
                            JSON.parse(
                                errorText
                            );

                        errorMessage =
                            errorData?.message ||
                            errorMessage;
                    } catch {
                        if (
                            errorText
                        ) {
                            errorMessage =
                                errorText;
                        }
                    }

                    throw new Error(
                        errorMessage
                    );
                } catch (blobError) {
                    throw blobError;
                }
            }

            const blob =
                new Blob(
                    [
                        response.data,
                    ],
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

            link.setAttribute(
                "download",
                `incident-${incident.id}.pdf`
            );

            link.style.display =
                "none";

            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );

            setTimeout(() => {
                window.URL.revokeObjectURL(
                    url
                );
            }, 1000);

        } catch (error) {
            console.error(
                "Failed to download incident PDF:",
                error
            );

            if (
                error.response?.data instanceof
                Blob
            ) {
                try {
                    const text =
                        await error.response.data.text();

                    let errorMessage =
                        "Failed to download incident PDF.";

                    try {
                        const errorData =
                            JSON.parse(
                                text
                            );

                        errorMessage =
                            errorData?.message ||
                            errorMessage;
                    } catch {
                        if (text) {
                            errorMessage =
                                text;
                        }
                    }

                    setIncidentError(
                        errorMessage
                    );
                } catch {
                    setIncidentError(
                        "Failed to download incident PDF."
                    );
                }
            } else {
                setIncidentError(
                    error?.message ||
                        "Failed to download incident PDF."
                );
            }

        } finally {
            setPdfLoading(false);
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">

                <div className="flex flex-col items-center">

                    <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

                    <p className="text-sm text-gray-500">
                        Loading deliveries...
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // MAIN PAGE
    // =====================================================

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

            <div className="mx-auto max-w-7xl">

                {/* =================================================
                    HEADER
                ================================================== */}

                <div className="mb-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <div className="flex items-center gap-3">

                                <div className="rounded-xl bg-blue-50 p-2.5">

                                    <TruckIcon className="h-6 w-6 text-blue-600" />

                                </div>

                                <div>

                                    <h1 className="text-2xl font-bold text-gray-800">
                                        Delivery Transactions
                                    </h1>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Monitor delivery transactions and their current status.
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">

                            <div className="rounded-lg bg-blue-50 p-2">

                                <DocumentTextIcon className="h-5 w-5 text-blue-600" />

                            </div>

                            <div>

                                <p className="text-[11px] text-gray-400">
                                    Total Deliveries
                                </p>

                                <p className="text-lg font-bold text-gray-700">
                                    {deliveries.length}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    MESSAGE
                ================================================== */}

                {message && (
                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">

                        <p className="text-sm text-green-700">
                            {message}
                        </p>

                    </div>
                )}

                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                        <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-500" />

                        <p className="text-sm text-red-600">
                            {error}
                        </p>

                    </div>
                )}

                {/* =================================================
                    EMPTY STATE
                ================================================== */}

                {deliveries.length === 0 ? (

                    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

                        <TruckIcon className="mx-auto h-12 w-12 text-gray-300" />

                        <h2 className="mt-4 text-lg font-semibold text-gray-700">
                            No deliveries found
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
                            Delivery transactions will appear here when they are available.
                        </p>

                    </div>

                ) : (

                    <>

                        {/* =================================================
                            DESKTOP TABLE
                        ================================================== */}

                        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">

                            <div className="overflow-x-auto">

                                <table className="w-full text-left">

                                    <thead className="border-b border-gray-200 bg-gray-50">

                                        <tr>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                D.R. Number
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Recipient
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Quantity
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Delivery Date
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-gray-100">

                                        {paginatedDeliveries.map(
                                            (
                                                delivery
                                            ) => {

                                                const deliveryIncidents =
                                                    incidentsByDelivery[
                                                        delivery.id
                                                    ] ||
                                                    [];

                                                const normalizedStatus =
                                                    normalizeStatus(
                                                        delivery.status
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            delivery.id
                                                        }
                                                        className="transition hover:bg-gray-50"
                                                    >

                                                        <td className="px-5 py-4">

                                                            <p className="text-sm font-semibold text-gray-700">
                                                                #
                                                                {
                                                                    delivery.dr_number
                                                                }
                                                            </p>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <p className="text-sm font-medium text-gray-700">
                                                                {
                                                                    delivery.recipient_name ||
                                                                    "N/A"
                                                                }
                                                            </p>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <p className="text-sm text-gray-600">
                                                                {
                                                                    delivery.quantity_order ??
                                                                    "N/A"
                                                                }
                                                            </p>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <p className="text-sm text-gray-600">
                                                                {getDeliveryDateTime(
                                                                    delivery
                                                                )}
                                                            </p>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <div className="flex flex-wrap gap-2">

                                                                <span
                                                                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                                        STATUS_CLASSES[
                                                                            normalizedStatus
                                                                        ] ||
                                                                        "bg-gray-100 text-gray-600"
                                                                    }`}
                                                                >
                                                                    {
                                                                        STATUS_LABELS[
                                                                            normalizedStatus
                                                                        ] ||
                                                                        delivery.status ||
                                                                        "N/A"
                                                                    }
                                                                </span>

                                                                {/* INCIDENT BADGE */}

                                                                {deliveryIncidents.length >
                                                                    0 && (
                                                                    <span className="inline-flex rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600">
                                                                        Incident
                                                                    </span>
                                                                )}

                                                            </div>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <div className="flex justify-end">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openDeliveryDetails(
                                                                            delivery
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                                >

                                                                    <EyeIcon className="h-4 w-4" />

                                                                    View

                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                        {/* =================================================
                            MOBILE CARDS
                        ================================================== */}

                        <div className="space-y-4 md:hidden">

                            {paginatedDeliveries.map(
                                (
                                    delivery
                                ) => {

                                    const deliveryIncidents =
                                        incidentsByDelivery[
                                            delivery.id
                                        ] ||
                                        [];

                                    const normalizedStatus =
                                        normalizeStatus(
                                            delivery.status
                                        );

                                    return (
                                        <div
                                            key={
                                                delivery.id
                                            }
                                            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                                        >

                                            <div className="flex items-start justify-between gap-3">

                                                <div>

                                                    <p className="text-xs text-gray-400">
                                                        D.R. Number
                                                    </p>

                                                    <p className="mt-1 text-lg font-bold text-gray-800">
                                                        #
                                                        {
                                                            delivery.dr_number
                                                        }
                                                    </p>

                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                        STATUS_CLASSES[
                                                            normalizedStatus
                                                        ] ||
                                                        "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {
                                                        STATUS_LABELS[
                                                            normalizedStatus
                                                        ] ||
                                                        delivery.status ||
                                                        "N/A"
                                                    }
                                                </span>

                                            </div>

                                            <div className="mt-5 grid grid-cols-2 gap-4">

                                                <div>

                                                    <p className="text-xs text-gray-400">
                                                        Recipient
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-gray-700">
                                                        {
                                                            delivery.recipient_name ||
                                                            "N/A"
                                                        }
                                                    </p>

                                                </div>

                                                <div>

                                                    <p className="text-xs text-gray-400">
                                                        Quantity
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-gray-700">
                                                        {
                                                            delivery.quantity_order ??
                                                            "N/A"
                                                        }
                                                    </p>

                                                </div>

                                                <div className="col-span-2">

                                                    <p className="text-xs text-gray-400">
                                                        Delivery Date
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-gray-700">
                                                        {getDeliveryDateTime(
                                                            delivery
                                                        )}
                                                    </p>

                                                </div>

                                            </div>

                                            {/* INCIDENT BADGE */}

                                            {deliveryIncidents.length >
                                                0 && (
                                                <div className="mt-4">

                                                    <span className="inline-flex rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600">
                                                        Incident
                                                    </span>

                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openDeliveryDetails(
                                                        delivery
                                                    )
                                                }
                                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                            >

                                                <EyeIcon className="h-5 w-5" />

                                                View Details

                                            </button>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                        {/* =================================================
                            PAGINATION
                        ================================================== */}

                        {totalPages >
                            1 && (
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <p className="text-xs text-gray-400">

                                    Showing{" "}

                                    <span className="font-semibold text-gray-600">
                                        {
                                            (currentPage -
                                                1) *
                                                itemsPerPage +
                                            1
                                        }
                                    </span>

                                    {" "}to{" "}

                                    <span className="font-semibold text-gray-600">
                                        {Math.min(
                                            currentPage *
                                                itemsPerPage,
                                            deliveries.length
                                        )}
                                    </span>

                                    {" "}of{" "}

                                    <span className="font-semibold text-gray-600">
                                        {
                                            deliveries.length
                                        }
                                    </span>

                                </p>

                                <div className="flex items-center gap-2">

                                    <button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                            1
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (
                                                    page
                                                ) =>
                                                    Math.max(
                                                        page -
                                                            1,
                                                        1
                                                    )
                                            )
                                        }
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                                        {
                                            currentPage
                                        }{" "}
                                        /{" "}
                                        {
                                            totalPages
                                        }
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (
                                                    page
                                                ) =>
                                                    Math.min(
                                                        page +
                                                            1,
                                                        totalPages
                                                    )
                                            )
                                        }
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>

                                </div>

                            </div>
                        )}

                    </>
                )}

            </div>

            {/* =========================================================
                DELIVERY DETAILS MODAL
            ========================================================== */}

            {selectedDelivery && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDeliveryDetails();
                        }
                    }}
                >

                    <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">

                            <div>

                                <p className="text-xs text-gray-400">
                                    Delivery Details
                                </p>

                                <h2 className="mt-1 text-lg font-bold text-gray-800">
                                    D.R. #
                                    {
                                        selectedDelivery.dr_number
                                    }
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeDeliveryDetails
                                }
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                aria-label="Close delivery details"
                            >

                                <XMarkIcon className="h-5 w-5" />

                            </button>

                        </div>

                        {/* CONTENT */}

                        <div className="overflow-y-auto px-5 py-5 sm:px-6">

                            {/* BASIC INFORMATION */}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                    <div className="flex items-center gap-2">

                                        <UserIcon className="h-5 w-5 text-blue-600" />

                                        <p className="text-xs text-gray-400">
                                            Recipient
                                        </p>

                                    </div>

                                    <p className="mt-2 break-words text-sm font-semibold text-gray-700">
                                        {
                                            selectedDelivery.recipient_name ||
                                            "N/A"
                                        }
                                    </p>

                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                    <div className="flex items-center gap-2">

                                        <CubeIcon className="h-5 w-5 text-purple-600" />

                                        <p className="text-xs text-gray-400">
                                            Quantity
                                        </p>

                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-gray-700">
                                        {
                                            selectedDelivery.quantity_order ??
                                            "N/A"
                                        }
                                    </p>

                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                    <div className="flex items-center gap-2">

                                        <CalendarDaysIcon className="h-5 w-5 text-green-600" />

                                        <p className="text-xs text-gray-400">
                                            Delivery Date
                                        </p>

                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-gray-700">
                                        {getDeliveryDateTime(
                                            selectedDelivery
                                        )}
                                    </p>

                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                    <div className="flex items-center gap-2">

                                        <MapPinIcon className="h-5 w-5 text-orange-600" />

                                        <p className="text-xs text-gray-400">
                                            Address
                                        </p>

                                    </div>

                                    <p className="mt-2 break-words text-sm font-semibold text-gray-700">
                                        {
                                            selectedDelivery.delivery_address ||
                                            "N/A"
                                        }
                                    </p>

                                </div>

                            </div>

                            {/* =================================================
                                CURRENT STATUS
                            ================================================== */}

                            <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-xs text-gray-400">
                                            Current Status
                                        </p>

                                        <span
                                            className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                STATUS_CLASSES[
                                                    normalizeStatus(
                                                        selectedDelivery.status
                                                    )
                                                ] ||
                                                "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {
                                                STATUS_LABELS[
                                                    normalizeStatus(
                                                        selectedDelivery.status
                                                    )
                                                ] ||
                                                selectedDelivery.status ||
                                                "N/A"
                                            }
                                        </span>

                                    </div>

                                    <CheckCircleIcon
                                        className={`h-7 w-7 ${
                                            normalizeStatus(
                                                selectedDelivery.status
                                            ) ===
                                            "delivered"
                                                ? "text-green-500"
                                                : "text-blue-500"
                                        }`}
                                    />

                                </div>

                            </div>

                            {renderTimeline(
                                selectedDelivery
                            )}

                        </div>

                        {/* =================================================
                            FOOTER
                        ================================================== */}

                        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                            {/* DOWNLOAD BUTTONS */}

                            <div className="flex flex-wrap items-center gap-2">

                                {(() => {
                                    const deliveryIncidents =
                                        incidentsByDelivery[
                                            selectedDelivery.id
                                        ] || [];

                                    if (
                                        deliveryIncidents.length ===
                                        0
                                    ) {
                                        return (
                                            <p className="text-xs text-gray-400">
                                                No incident report available.
                                            </p>
                                        );
                                    }

                                    const incident =
                                        deliveryIncidents[0];

                                    return (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                downloadIncidentPdf(
                                                    incident
                                                )
                                            }
                                            disabled={
                                                pdfLoading
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                            <ArrowDownTrayIcon className="h-5 w-5" />

                                            {pdfLoading
                                                ? "Downloading..."
                                                : "Download Incident PDF"}

                                        </button>
                                    );
                                })()}

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {/* =========================================================
                INCIDENT MODAL
            ========================================================== */}

            {showIncidentModal &&
                selectedIncident && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeIncidentModal();
                            }
                        }}
                    >

                        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                            {/* INCIDENT HEADER */}

                            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">

                                <div>

                                    <p className="text-xs text-gray-400">
                                        Incident Details
                                    </p>

                                    <h2 className="mt-1 text-lg font-bold text-gray-800">
                                        Incident #
                                        {
                                            selectedIncident.id
                                        }
                                    </h2>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeIncidentModal
                                    }
                                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close incident"
                                >

                                    <XMarkIcon className="h-5 w-5" />

                                </button>

                            </div>

                            {/* INCIDENT CONTENT */}

                            <div className="overflow-y-auto px-5 py-5 sm:px-6">

                                {incidentLoading ? (

                                    <div className="flex items-center justify-center py-12">

                                        <div className="flex flex-col items-center">

                                            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

                                            <p className="text-sm text-gray-500">
                                                Loading incident...
                                            </p>

                                        </div>

                                    </div>

                                ) : (

                                    <>

                                        {incidentError && (
                                            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                                                <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-500" />

                                                <p className="text-sm text-red-600">
                                                    {
                                                        incidentError
                                                    }
                                                </p>

                                            </div>
                                        )}

                                        <div className="space-y-4">

                                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                                <p className="text-xs text-gray-400">
                                                    Delivery ID
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-gray-700">
                                                    {
                                                        selectedIncident.delivery_id ??
                                                        "N/A"
                                                    }
                                                </p>

                                            </div>

                                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                                <p className="text-xs text-gray-400">
                                                    Incident Type
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-gray-700">
                                                    {
                                                        selectedIncident.type ||
                                                        selectedIncident.incident_type ||
                                                        "N/A"
                                                    }
                                                </p>

                                            </div>

                                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                                <p className="text-xs text-gray-400">
                                                    Description
                                                </p>

                                                <p className="mt-1 break-words text-sm font-semibold text-gray-700">
                                                    {
                                                        selectedIncident.description ||
                                                        "No description available."
                                                    }
                                                </p>

                                            </div>

                                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                                <p className="text-xs text-gray-400">
                                                    Reported At
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-gray-700">
                                                    {formatDateTime(
                                                        selectedIncident.created_at
                                                    )}
                                                </p>

                                            </div>

                                        </div>

                                    </>

                                )}

                            </div>

                            {/* INCIDENT FOOTER */}

                            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                                <button
                                    type="button"
                                    onClick={() =>
                                        downloadIncidentPdf(
                                            selectedIncident
                                        )
                                    }
                                    disabled={
                                        pdfLoading ||
                                        incidentLoading
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    <ArrowDownTrayIcon className="h-5 w-5" />

                                    {pdfLoading
                                        ? "Downloading..."
                                        : "Download PDF"}

                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};

export default StaffDelivery;