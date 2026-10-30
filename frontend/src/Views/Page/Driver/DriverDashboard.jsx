import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    TruckIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    MapPinIcon,
    CalendarDaysIcon,
    CubeIcon,
    UserIcon,
    ChevronRightIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

import axiosClient from "../../../api/axiosClient";
import { useStateContext } from "../../../context/AuthProvider";

const DriverDashboard = () => {
    const { user } = useStateContext();

    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    // Active / in-progress deliveries
    const [deliveries, setDeliveries] = useState([]);

    // Completed / archived deliveries
    const [completedDeliveries, setCompletedDeliveries] = useState([]);

    // Available unassigned deliveries
    const [availableDeliveries, setAvailableDeliveries] = useState([]);

    // Driver incident reports
    const [incidentReports, setIncidentReports] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | DELIVERY WORKFLOW
    |--------------------------------------------------------------------------
    */

    const statusOrder = [
        "pending",
        "pick_up",
        "arrival",
        "queueing",
        "unloading",
        "checking",
        "delivered",
    ];

    const statusLabels = {
        pending: "Pending",
        pick_up: "Pick Up",
        arrival: "Arrival",
        queueing: "Queueing",
        unloading: "Unloading",
        checking: "Checking",
        delivered: "Delivered",
    };

    const statusStyles = {
        pending:
            "bg-amber-50 text-amber-700 border-amber-200",

        pick_up:
            "bg-blue-50 text-blue-700 border-blue-200",

        arrival:
            "bg-indigo-50 text-indigo-700 border-indigo-200",

        queueing:
            "bg-purple-50 text-purple-700 border-purple-200",

        unloading:
            "bg-orange-50 text-orange-700 border-orange-200",

        checking:
            "bg-cyan-50 text-cyan-700 border-cyan-200",

        delivered:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
    };

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    const normalizeStatus = (status) => {
        if (!status) {
            return "";
        }

        return String(status)
            .trim()
            .toLowerCase()
            .replace(/-/g, "_")
            .replace(/\s+/g, "_");
    };

    /*
    |--------------------------------------------------------------------------
    | EXTRACT API COLLECTION
    |--------------------------------------------------------------------------
    */

   const extractCollection = (response) => {
    const payload = response?.data;

    // Deliveries
    if (Array.isArray(payload?.deliveries)) {
        return payload.deliveries;
    }

    // Incidents
    if (Array.isArray(payload?.incidents)) {
        return payload.incidents;
    }

    // Alternative incident response names
    if (Array.isArray(payload?.incident_reports)) {
        return payload.incident_reports;
    }

    // Nested deliveries
    if (Array.isArray(payload?.data?.deliveries)) {
        return payload.data.deliveries;
    }

    // Nested incidents
    if (Array.isArray(payload?.data?.incidents)) {
        return payload.data.incidents;
    }

    // Nested incident reports
    if (Array.isArray(payload?.data?.incident_reports)) {
        return payload.data.incident_reports;
    }

    // Laravel resource-style response
    if (Array.isArray(payload?.data?.data)) {
        return payload.data.data;
    }

    // Generic data array
    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    // Direct array response
    if (Array.isArray(payload)) {
        return payload;
    }

    return [];
};

    /*
    |--------------------------------------------------------------------------
    | INCIDENT COUNT
    |--------------------------------------------------------------------------
    */

    const getIncidentCount = (delivery) => {
        if (!delivery) {
            return 0;
        }

        if (
            delivery.incidents_count !== undefined &&
            delivery.incidents_count !== null
        ) {
            return Number(delivery.incidents_count) || 0;
        }

        if (
            delivery.incident_count !== undefined &&
            delivery.incident_count !== null
        ) {
            return Number(delivery.incident_count) || 0;
        }

        if (Array.isArray(delivery.incidents)) {
            return delivery.incidents.length;
        }

        if (Array.isArray(delivery.incident_reports)) {
            return delivery.incident_reports.length;
        }

        return 0;
    };

    /*
    |--------------------------------------------------------------------------
    | DELIVERY NUMBER
    |--------------------------------------------------------------------------
    */

    const getDeliveryNumber = (delivery) => {
        return (
            delivery?.dr_number ||
            delivery?.delivery_number ||
            delivery?.dr_no ||
            delivery?.reference_number ||
            `Delivery #${delivery?.id || "N/A"}`
        );
    };

    /*
    |--------------------------------------------------------------------------
    | RECIPIENT
    |--------------------------------------------------------------------------
    */

    const getRecipient = (delivery) => {
        return (
            delivery?.recipient_name ||
            delivery?.recipient ||
            delivery?.customer_name ||
            delivery?.receiver_name ||
            "N/A"
        );
    };

    /*
    |--------------------------------------------------------------------------
    | DESTINATION
    |--------------------------------------------------------------------------
    */

    const getDestination = (delivery) => {
        return (
            delivery?.delivery_address ||
            delivery?.destination ||
            delivery?.destination_address ||
            delivery?.address ||
            "No address available"
        );
    };

    /*
    |--------------------------------------------------------------------------
    | QUANTITY
    |--------------------------------------------------------------------------
    */

    const getQuantity = (delivery) => {
        return (
            delivery?.quantity_order ??
            delivery?.quantity ??
            delivery?.quantity_delivered ??
            0
        );
    };

    /*
    |--------------------------------------------------------------------------
    | DELIVERY DATE
    |--------------------------------------------------------------------------
    */

    const getDeliveryDate = (delivery) => {
        return (
            delivery?.completed_at ||
            delivery?.updated_at ||
            delivery?.delivery_date ||
            delivery?.created_at ||
            null
        );
    };

    /*
    |--------------------------------------------------------------------------
    | FETCH DASHBOARD DATA
    |--------------------------------------------------------------------------
    */

    const fetchDashboardData = useCallback(
        async (silent = false) => {
            try {
                if (silent) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                /*
                |--------------------------------------------------------------------------
                | FETCH ALL DRIVER DASHBOARD DATA
                |--------------------------------------------------------------------------
                |
                | Active:
                | GET /api/driver/my-deliveries
                |
                | Completed:
                | GET /api/driver/archive
                |
                | Available:
                | GET /api/driver/deliveries
                |
                | Incidents:
                | GET /api/driver/incidents
                |
                */

                const [
                    myDeliveriesResult,
                    archiveResult,
                    availableResult,
                    incidentsResult,
                ] = await Promise.allSettled([
                    axiosClient.get(
                        "/driver/my-deliveries"
                    ),

                    axiosClient.get(
                        "/driver/archive"
                    ),

                    axiosClient.get(
                        "/driver/deliveries"
                    ),

                    axiosClient.get(
                        "/driver/incidents"
                    ),
                ]);

                /*
                |--------------------------------------------------------------------------
                | ACTIVE DELIVERIES
                |--------------------------------------------------------------------------
                */

                if (
                    myDeliveriesResult.status ===
                    "fulfilled"
                ) {
                    const active =
                        extractCollection(
                            myDeliveriesResult.value
                        );

                    setDeliveries(active);
                } else {
                    console.error(
                        "My deliveries error:",
                        myDeliveriesResult.reason
                    );

                    setDeliveries([]);

                    /*
                    | Only show this as the main dashboard
                    | error if the primary endpoint failed.
                    */

                    setError(
                        myDeliveriesResult.reason
                            ?.response?.data
                            ?.message ||
                            "Unable to load your deliveries."
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | COMPLETED / ARCHIVED DELIVERIES
                |--------------------------------------------------------------------------
                */

                if (
                    archiveResult.status ===
                    "fulfilled"
                ) {
                    const archived =
                        extractCollection(
                            archiveResult.value
                        );

                    console.log(
                        "Completed / archived deliveries:",
                        archived
                    );

                    setCompletedDeliveries(
                        archived
                    );
                } else {
                    console.error(
                        "Archive deliveries error:",
                        archiveResult.reason
                    );

                    setCompletedDeliveries([]);
                }

                /*
                |--------------------------------------------------------------------------
                | AVAILABLE DELIVERIES
                |--------------------------------------------------------------------------
                */

                if (
                    availableResult.status ===
                    "fulfilled"
                ) {
                    const available =
                        extractCollection(
                            availableResult.value
                        );

                    setAvailableDeliveries(
                        available
                    );
                } else {
                    console.error(
                        "Available deliveries error:",
                        availableResult.reason
                    );

                    setAvailableDeliveries([]);
                }

                /*
                |--------------------------------------------------------------------------
                | DRIVER INCIDENT REPORTS
                |--------------------------------------------------------------------------
                */

               if (incidentsResult.status === "fulfilled") {
    const incidents = extractCollection(
        incidentsResult.value
    );

    console.log(
        "Driver incidents API response:",
        incidentsResult.value
    );

    console.log(
        "Driver incidents extracted:",
        incidents
    );

    setIncidentReports(
        Array.isArray(incidents)
            ? incidents
            : []
    );
} else {
    console.error(
        "Driver incidents error:",
        incidentsResult.reason
    );

    setIncidentReports([]);
}
            } catch (err) {
                console.error(
                    "Driver dashboard error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                        "Unable to load dashboard information."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD + AUTOMATIC REFRESH
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchDashboardData();

        const interval = setInterval(() => {
            if (!document.hidden) {
                fetchDashboardData(true);
            }
        }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [fetchDashboardData]);

    /*
    |--------------------------------------------------------------------------
    | SORT COMPLETED DELIVERIES
    |--------------------------------------------------------------------------
    */

    const sortedCompletedDeliveries =
        useMemo(() => {
            return [...completedDeliveries]
                .filter((delivery) => {
                    return (
                        normalizeStatus(
                            delivery?.status
                        ) === "delivered"
                    );
                })
                .sort((a, b) => {
                    const dateA =
                        new Date(
                            getDeliveryDate(a)
                        ).getTime() || 0;

                    const dateB =
                        new Date(
                            getDeliveryDate(b)
                        ).getTime() || 0;

                    return dateB - dateA;
                });
        }, [completedDeliveries]);

    /*
    |--------------------------------------------------------------------------
    | COMBINE ACTIVE + COMPLETED
    |--------------------------------------------------------------------------
    |
    | Used for overall dashboard statistics and recent
    | delivery activity.
    |
    */

    const allAssignedDeliveries = useMemo(() => {
        const combined = [
            ...deliveries,
            ...sortedCompletedDeliveries,
        ];

        /*
        | Prevent duplicate delivery records
        | if the API ever returns the same delivery
        | in both collections.
        */

        const unique = new Map();

        combined.forEach((delivery) => {
            if (delivery?.id !== undefined) {
                unique.set(
                    delivery.id,
                    delivery
                );
            }
        });

        return Array.from(unique.values());
    }, [
        deliveries,
        sortedCompletedDeliveries,
    ]);

    /*
    |--------------------------------------------------------------------------
    | STATISTICS
    |--------------------------------------------------------------------------
    */

    const stats = useMemo(() => {
        const total =
            allAssignedDeliveries.length;

        const pending =
            allAssignedDeliveries.filter(
                (delivery) =>
                    normalizeStatus(
                        delivery?.status
                    ) === "pending"
            ).length;

        const delivered =
            sortedCompletedDeliveries.length;

        const inProgress =
            allAssignedDeliveries.filter(
                (delivery) => {
                    const status =
                        normalizeStatus(
                            delivery?.status
                        );

                    return (
                        status !== "pending" &&
                        status !== "delivered"
                    );
                }
            ).length;

        /*
        | Incident records are taken directly
        | from /driver/incidents.
        |
        | This is more reliable than relying only
        | on incidents_count on deliveries.
        */

        const incidents =
            incidentReports.length;

        const completionRate =
            total > 0
                ? Math.round(
                      (delivered / total) *
                          100
                  )
                : 0;

        return {
            total,
            pending,
            inProgress,
            delivered,
            incidents,
            completionRate,
        };
    }, [
        allAssignedDeliveries,
        sortedCompletedDeliveries,
        incidentReports,
    ]);

    /*
    |--------------------------------------------------------------------------
    | ACTIVE DELIVERY
    |--------------------------------------------------------------------------
    */

    const activeDelivery = useMemo(() => {
        return [...deliveries]
            .filter((delivery) => {
                return (
                    normalizeStatus(
                        delivery?.status
                    ) !== "delivered"
                );
            })
            .sort((a, b) => {
                const dateA =
                    new Date(
                        a.updated_at ||
                            a.created_at ||
                            0
                    ).getTime() || 0;

                const dateB =
                    new Date(
                        b.updated_at ||
                            b.created_at ||
                            0
                    ).getTime() || 0;

                return dateB - dateA;
            })[0] || null;
    }, [deliveries]);

    /*
    |--------------------------------------------------------------------------
    | RECENT DELIVERIES
    |--------------------------------------------------------------------------
    */

    const recentDeliveries = useMemo(() => {
        return [...allAssignedDeliveries]
            .sort((a, b) => {
                const dateA =
                    new Date(
                        getDeliveryDate(a)
                    ).getTime() || 0;

                const dateB =
                    new Date(
                        getDeliveryDate(b)
                    ).getTime() || 0;

                return dateB - dateA;
            })
            .slice(0, 5);
    }, [allAssignedDeliveries]);

    /*
    |--------------------------------------------------------------------------
    | STATUS DISTRIBUTION
    |--------------------------------------------------------------------------
    */

    const statusDistribution = useMemo(() => {
        return statusOrder.map((status) => ({
            status,
            label: statusLabels[status],

            count: allAssignedDeliveries.filter(
                (delivery) =>
                    normalizeStatus(
                        delivery?.status
                    ) === status
            ).length,
        }));
    }, [allAssignedDeliveries]);

    /*
    |--------------------------------------------------------------------------
    | WEEKLY ACTIVITY
    |--------------------------------------------------------------------------
    */

    const weeklyActivity = useMemo(() => {
        const now = new Date();

        return Array.from(
            { length: 7 },
            (_, index) => {
                const date = new Date(now);

                date.setDate(
                    now.getDate() -
                        (6 - index)
                );

                const dateKey = date
                    .toISOString()
                    .split("T")[0];

                const count =
                    allAssignedDeliveries.filter(
                        (delivery) => {
                            const deliveryDate =
                                delivery?.delivery_date ||
                                delivery?.completed_at ||
                                delivery?.created_at;

                            if (!deliveryDate) {
                                return false;
                            }

                            return (
                                new Date(
                                    deliveryDate
                                )
                                    .toISOString()
                                    .split("T")[0] ===
                                dateKey
                            );
                        }
                    ).length;

                return {
                    label: date.toLocaleDateString(
                        "en-US",
                        {
                            weekday: "short",
                        }
                    ),

                    date: dateKey,

                    count,
                };
            }
        );
    }, [allAssignedDeliveries]);

    /*
    |--------------------------------------------------------------------------
    | PROGRESS
    |--------------------------------------------------------------------------
    */

    const getProgress = (status) => {
        const normalizedStatus =
            normalizeStatus(status);

        const index =
            statusOrder.indexOf(
                normalizedStatus
            );

        if (index === -1) {
            return 0;
        }

        if (
            normalizedStatus ===
            "delivered"
        ) {
            return 100;
        }

        return Math.round(
            (index /
                (statusOrder.length - 1)) *
                100
        );
    };

    /*
    |--------------------------------------------------------------------------
    | FORMAT DATE
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
        }

        return parsedDate.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric",
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | FORMAT STATUS
    |--------------------------------------------------------------------------
    */

    const formatStatus = (status) => {
        if (!status) {
            return "Unknown";
        }

        const normalizedStatus =
            normalizeStatus(status);

        if (
            normalizedStatus ===
            "delivered"
        ) {
            return "Completed";
        }

        return (
            statusLabels[
                normalizedStatus
            ] ||
            String(status)
                .replace(/_/g, " ")
                .replace(/\b\w/g, (letter) =>
                    letter.toUpperCase()
                )
        );
    };

    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
                <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

                  <p className="text-sm text-gray-500">Please wait a moment...</p>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-screen bg-[#f5f7fb] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">

                {/* ============================================================
                    HEADER
                ============================================================ */}

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-[#1f2937] sm:text-3xl">
                                Driver Dashboard
                            </h1>

                            {refreshing && (
                                <ArrowPathIcon className="h-4 w-4 animate-spin text-[#2563eb]" />
                            )}
                        </div>

                        <p className="mt-1 text-sm text-[#637895]">
                            Welcome back,{" "}
                            <span className="font-semibold text-[#334155]">
                                {user?.username ||
                                    "Driver"}
                            </span>
                            . Here's your delivery
                            overview.
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                            <TruckIcon className="h-5 w-5 text-[#2563eb]" />

                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wide text-[#94a3b8]">
                                    Available Deliveries
                                </p>

                                <p className="text-lg font-bold text-[#1f2937]">
                                    {
                                        availableDeliveries.length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================================
                    ERROR
                ============================================================ */}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <div className="flex items-start gap-2">
                            <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />

                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* ============================================================
                    MAIN STATISTICS
                ============================================================ */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {/* TOTAL */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#64748b]">
                                    Total Deliveries
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-[#1f2937]">
                                    {stats.total}
                                </h2>

                                <p className="mt-2 text-xs text-[#94a3b8]">
                                    All assigned deliveries
                                </p>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-3">
                                <TruckIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* IN PROGRESS */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#64748b]">
                                    In Progress
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-[#1f2937]">
                                    {stats.inProgress}
                                </h2>

                                <p className="mt-2 text-xs text-[#94a3b8]">
                                    Currently being handled
                                </p>
                            </div>

                            <div className="rounded-xl bg-orange-50 p-3">
                                <ClockIcon className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    {/* COMPLETED */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#64748b]">
                                    Completed
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-[#1f2937]">
                                    {
                                        sortedCompletedDeliveries.length
                                    }
                                </h2>

                                <p className="mt-2 text-xs text-[#94a3b8]">
                                    Successfully completed
                                </p>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-3">
                                <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    {/* INCIDENTS */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#64748b]">
                                    Incidents
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-[#1f2937]">
                                    {stats.incidents}
                                </h2>

                                <p className="mt-2 text-xs text-[#94a3b8]">
                                    Your reported incidents
                                </p>
                            </div>

                            <div className="rounded-xl bg-red-50 p-3">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================================
                    ANALYTICS
                ============================================================ */}

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* COMPLETION RATE */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-[#1f2937]">
                                    Completion Rate
                                </h2>

                                <p className="mt-1 text-xs text-[#94a3b8]">
                                    Delivery completion overview
                                </p>
                            </div>

                            <ChartBarIcon className="h-6 w-6 text-[#2563eb]" />
                        </div>

                        <div className="mt-6 flex items-center justify-center">
                            <div
                                className="relative flex h-40 w-40 items-center justify-center rounded-full"
                                style={{
                                    background: `conic-gradient(#2563eb ${stats.completionRate}%, #dbeafe ${stats.completionRate}% 100%)`,
                                }}
                            >
                                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-[#1f2937]">
                                            {
                                                stats.completionRate
                                            }
                                            %
                                        </p>

                                        <p className="text-xs text-[#94a3b8]">
                                            Completed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-gray-50 p-3">
                                <p className="text-xs text-[#94a3b8]">
                                    Completed
                                </p>

                                <p className="mt-1 text-lg font-bold text-emerald-600">
                                    {
                                        sortedCompletedDeliveries.length
                                    }
                                </p>
                            </div>

                            <div className="rounded-xl bg-gray-50 p-3">
                                <p className="text-xs text-[#94a3b8]">
                                    Remaining
                                </p>

                                <p className="mt-1 text-lg font-bold text-orange-600">
                                    {Math.max(
                                        stats.total -
                                            sortedCompletedDeliveries.length,
                                        0
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* WEEKLY ACTIVITY */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-[#1f2937]">
                                    Delivery Activity
                                </h2>

                                <p className="mt-1 text-xs text-[#94a3b8]">
                                    Delivery activity over the last
                                    7 days
                                </p>
                            </div>

                            <CalendarDaysIcon className="h-6 w-6 text-[#2563eb]" />
                        </div>

                        <div className="mt-8 flex h-48 items-end justify-between gap-2 sm:gap-4">
                            {weeklyActivity.map(
                                (day) => {
                                    const maxCount =
                                        Math.max(
                                            ...weeklyActivity.map(
                                                (item) =>
                                                    item.count
                                            ),
                                            1
                                        );

                                    const height =
                                        day.count ===
                                        0
                                            ? 8
                                            : Math.max(
                                                  (day.count /
                                                      maxCount) *
                                                      100,
                                                  15
                                              );

                                    return (
                                        <div
                                            key={
                                                day.date
                                            }
                                            className="flex h-full flex-1 flex-col items-center justify-end"
                                        >
                                            <div className="mb-2 text-xs font-semibold text-[#475569]">
                                                {
                                                    day.count
                                                }
                                            </div>

                                            <div className="flex h-32 w-full items-end justify-center">
                                                <div
                                                    className="w-full max-w-10 rounded-t-lg bg-blue-500 transition-all"
                                                    style={{
                                                        height: `${height}%`,
                                                    }}
                                                />
                                            </div>

                                            <p className="mt-2 text-[10px] font-medium text-[#94a3b8] sm:text-xs">
                                                {
                                                    day.label
                                                }
                                            </p>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================================
                    DTR + ACTIVE DELIVERY
                ============================================================ */}

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* DTR */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-[#1f2937]">
                                    DTR Summary
                                </h2>

                                <p className="mt-1 text-xs text-[#94a3b8]">
                                    Daily Trip Report overview
                                </p>
                            </div>

                            <ClipboardDocumentListIcon className="h-6 w-6 text-[#2563eb]" />
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">

                            <div className="rounded-xl bg-blue-50 p-4">
                                <p className="text-xs font-medium text-[#64748b]">
                                    Total Trips
                                </p>

                                <p className="mt-1 text-2xl font-bold text-blue-600">
                                    {stats.total}
                                </p>

                                <p className="mt-1 text-[10px] text-[#94a3b8]">
                                    Assigned deliveries
                                </p>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-4">
                                <p className="text-xs font-medium text-[#64748b]">
                                    Completed
                                </p>

                                <p className="mt-1 text-2xl font-bold text-emerald-600">
                                    {
                                        sortedCompletedDeliveries.length
                                    }
                                </p>

                                <p className="mt-1 text-[10px] text-[#94a3b8]">
                                    Delivered trips
                                </p>
                            </div>

                            <div className="rounded-xl bg-orange-50 p-4">
                                <p className="text-xs font-medium text-[#64748b]">
                                    In Progress
                                </p>

                                <p className="mt-1 text-2xl font-bold text-orange-600">
                                    {stats.inProgress}
                                </p>

                                <p className="mt-1 text-[10px] text-[#94a3b8]">
                                    Active trips
                                </p>
                            </div>

                            <div className="rounded-xl bg-amber-50 p-4">
                                <p className="text-xs font-medium text-[#64748b]">
                                    Pending
                                </p>

                                <p className="mt-1 text-2xl font-bold text-amber-600">
                                    {stats.pending}
                                </p>

                                <p className="mt-1 text-[10px] text-[#94a3b8]">
                                    Waiting trips
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-[#334155]">
                                        DTR Report
                                    </p>

                                    <p className="mt-1 text-[10px] text-[#94a3b8]">
                                        Track your daily delivery
                                        activity
                                    </p>
                                </div>

                                <ChartBarIcon className="h-5 w-5 text-[#64748b]" />
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wide text-[#94a3b8]">
                                        Completion Rate
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-[#1f2937]">
                                        {
                                            stats.completionRate
                                        }
                                        %
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase tracking-wide text-[#94a3b8]">
                                        Incidents
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-red-600">
                                        {stats.incidents}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTIVE DELIVERY */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-[#1f2937]">
                                    Active Delivery
                                </h2>

                                <p className="mt-1 text-xs text-[#94a3b8]">
                                    Your current delivery
                                </p>
                            </div>

                            <TruckIcon className="h-6 w-6 text-[#2563eb]" />
                        </div>

                        {activeDelivery ? (
                            <div className="mt-5 rounded-xl border border-gray-100 bg-[#f8fafc] p-4">

                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs text-[#94a3b8]">
                                            DR Number
                                        </p>

                                        <p className="mt-1 text-lg font-bold text-[#1f2937]">
                                            {getDeliveryNumber(
                                                activeDelivery
                                            )}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${
                                            statusStyles[
                                                normalizeStatus(
                                                    activeDelivery.status
                                                )
                                            ] ||
                                            "border-gray-200 bg-gray-50 text-gray-600"
                                        }`}
                                    >
                                        {formatStatus(
                                            activeDelivery.status
                                        )}
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <div className="mb-2 flex justify-between text-xs">
                                        <span className="text-[#94a3b8]">
                                            Delivery Progress
                                        </span>

                                        <span className="font-semibold text-[#334155]">
                                            {getProgress(
                                                activeDelivery.status
                                            )}
                                            %
                                        </span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            className="h-full rounded-full bg-blue-600 transition-all"
                                            style={{
                                                width: `${getProgress(
                                                    activeDelivery.status
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 space-y-3">

                                    <div className="flex items-start gap-3">
                                        <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#64748b]" />

                                        <div>
                                            <p className="text-[10px] uppercase tracking-wide text-[#94a3b8]">
                                                Address
                                            </p>

                                            <p className="text-sm font-medium text-[#334155]">
                                                {getDestination(
                                                    activeDelivery
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <CubeIcon className="h-4 w-4 text-[#64748b]" />

                                        <div>
                                            <p className="text-[10px] uppercase tracking-wide text-[#94a3b8]">
                                                Quantity
                                            </p>

                                            <p className="text-sm font-medium text-[#334155]">
                                                {getQuantity(
                                                    activeDelivery
                                                )}{" "}
                                                items
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />

                                        <div>
                                            <p className="text-[10px] uppercase tracking-wide text-[#94a3b8]">
                                                Incidents
                                            </p>

                                            <p className="text-sm font-medium text-[#334155]">
                                                {getIncidentCount(
                                                    activeDelivery
                                                )}{" "}
                                                reported
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-10 text-center">
                                <CheckCircleIcon className="h-10 w-10 text-emerald-500" />

                                <p className="mt-3 text-sm font-semibold text-[#334155]">
                                    No active delivery
                                </p>

                                <p className="mt-1 text-xs text-[#94a3b8]">
                                    You're ready for your next
                                    delivery.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ============================================================
                    COMPLETED DELIVERIES
                ============================================================ */}

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-50 p-2">
                                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                            </div>

                            <div>
                                <h2 className="text-base font-bold text-[#1f2937]">
                                    Completed Deliveries
                                </h2>

                                <p className="mt-1 text-xs text-[#94a3b8]">
                                    Successfully delivered trips
                                </p>
                            </div>
                        </div>

                        <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                            {
                                sortedCompletedDeliveries.length
                            }{" "}
                            completed
                        </div>
                    </div>

                    {sortedCompletedDeliveries.length >
                    0 ? (
                        <>
                            {/* DESKTOP */}

                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                                DR Number
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                                Customer 
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                                Address
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                                Quantity
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                                Completed
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                                Incidents
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {sortedCompletedDeliveries.map(
                                            (
                                                delivery
                                            ) => (
                                                <tr
                                                    key={
                                                        delivery.id
                                                    }
                                                    className="border-b border-gray-50 last:border-0 hover:bg-emerald-50/30"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <TruckIcon className="h-4 w-4 text-emerald-500" />

                                                            <span className="text-sm font-semibold text-[#334155]">
                                                                {getDeliveryNumber(
                                                                    delivery
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-[#475569]">
                                                        {getRecipient(
                                                            delivery
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex max-w-xs items-center gap-2">
                                                            <MapPinIcon className="h-4 w-4 shrink-0 text-[#94a3b8]" />

                                                            <span className="truncate text-sm text-[#475569]">
                                                                {getDestination(
                                                                    delivery
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm font-medium text-[#475569]">
                                                        {getQuantity(
                                                            delivery
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-[#64748b]">
                                                        {formatDate(
                                                            getDeliveryDate(
                                                                delivery
                                                            )
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <ExclamationTriangleIcon
                                                                className={`h-4 w-4 ${
                                                                    getIncidentCount(
                                                                        delivery
                                                                    ) >
                                                                    0
                                                                        ? "text-red-500"
                                                                        : "text-gray-300"
                                                                }`}
                                                            />

                                                            <span
                                                                className={`text-sm font-semibold ${
                                                                    getIncidentCount(
                                                                        delivery
                                                                    ) >
                                                                    0
                                                                        ? "text-red-600"
                                                                        : "text-gray-400"
                                                                }`}
                                                            >
                                                                {getIncidentCount(
                                                                    delivery
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                                                            <CheckCircleIcon className="h-3.5 w-3.5" />

                                                            Completed
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE */}

                            <div className="space-y-3 p-4 md:hidden">
                                {sortedCompletedDeliveries.map(
                                    (
                                        delivery
                                    ) => (
                                        <div
                                            key={
                                                delivery.id
                                            }
                                            className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircleIcon className="h-5 w-5 text-emerald-600" />

                                                        <p className="text-sm font-bold text-[#334155]">
                                                            {getDeliveryNumber(
                                                                delivery
                                                            )}
                                                        </p>
                                                    </div>

                                                    <p className="mt-1 text-xs text-[#64748b]">
                                                        {getRecipient(
                                                            delivery
                                                        )}
                                                    </p>
                                                </div>

                                                <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[9px] font-semibold text-emerald-700">
                                                    Completed
                                                </span>
                                            </div>

                                            <div className="mt-4 space-y-3 border-t border-emerald-100 pt-3">

                                                <div className="flex items-start gap-2">
                                                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#64748b]" />

                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-wide text-[#94a3b8]">
                                                            Address
                                                        </p>

                                                        <p className="text-xs font-medium text-[#475569]">
                                                            {getDestination(
                                                                delivery
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-wide text-[#94a3b8]">
                                                            Quantity
                                                        </p>

                                                        <p className="mt-1 text-xs font-semibold text-[#475569]">
                                                            {getQuantity(
                                                                delivery
                                                            )}{" "}
                                                            items
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-wide text-[#94a3b8]">
                                                            Completed
                                                        </p>

                                                        <p className="mt-1 text-xs font-semibold text-[#475569]">
                                                            {formatDate(
                                                                getDeliveryDate(
                                                                    delivery
                                                                )
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] uppercase tracking-wide text-[#94a3b8]">
                                                        Incidents
                                                    </span>

                                                    <span
                                                        className={`text-xs font-semibold ${
                                                            getIncidentCount(
                                                                delivery
                                                            ) >
                                                            0
                                                                ? "text-red-600"
                                                                : "text-gray-400"
                                                        }`}
                                                    >
                                                        {getIncidentCount(
                                                            delivery
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="px-5 py-12 text-center">
                            <CheckCircleIcon className="mx-auto h-10 w-10 text-gray-300" />

                            <p className="mt-3 text-sm font-semibold text-[#475569]">
                                No completed deliveries
                            </p>

                            <p className="mt-1 text-xs text-[#94a3b8]">
                                Completed deliveries will appear
                                here after you finish a delivery.
                            </p>
                        </div>
                    )}
                </div>

                {/* ============================================================
                    RECENT DELIVERIES
                ============================================================ */}

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-[#1f2937]">
                                Recent Deliveries
                            </h2>

                            <p className="mt-1 text-xs text-[#94a3b8]">
                                Your latest delivery activity
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#64748b]">
                            <UserIcon className="h-4 w-4" />

                            {user?.username || "Driver"}
                        </div>
                    </div>

                    {/* DESKTOP */}

                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                        DR Number
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                        Customer 
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                        Date
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                        Incidents
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentDeliveries.length >
                                0 ? (
                                    recentDeliveries.map(
                                        (
                                            delivery
                                        ) => (
                                            <tr
                                                key={
                                                    delivery.id
                                                }
                                                className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <TruckIcon className="h-4 w-4 text-blue-500" />

                                                        <span className="text-sm font-semibold text-[#334155]">
                                                            {getDeliveryNumber(
                                                                delivery
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-[#475569]">
                                                    {getRecipient(
                                                        delivery
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-[#64748b]">
                                                    {formatDate(
                                                        getDeliveryDate(
                                                            delivery
                                                        )
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold ${
                                                            statusStyles[
                                                                normalizeStatus(
                                                                    delivery.status
                                                                )
                                                            ] ||
                                                            "border-gray-200 bg-gray-50 text-gray-600"
                                                        }`}
                                                    >
                                                        {formatStatus(
                                                            delivery.status
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <ExclamationTriangleIcon
                                                            className={`h-4 w-4 ${
                                                                getIncidentCount(
                                                                    delivery
                                                                ) >
                                                                0
                                                                    ? "text-red-500"
                                                                    : "text-gray-300"
                                                            }`}
                                                        />

                                                        <span
                                                            className={`text-sm font-semibold ${
                                                                getIncidentCount(
                                                                    delivery
                                                                ) >
                                                                0
                                                                    ? "text-red-600"
                                                                    : "text-gray-400"
                                                            }`}
                                                        >
                                                            {getIncidentCount(
                                                                delivery
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <ChevronRightIcon className="h-4 w-4 text-[#94a3b8]" />
                                                </td>
                                            </tr>
                                        )
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-5 py-12 text-center"
                                        >
                                            <TruckIcon className="mx-auto h-8 w-8 text-gray-300" />

                                            <p className="mt-2 text-sm text-[#94a3b8]">
                                                No delivery
                                                records yet.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE */}

                    <div className="space-y-3 p-4 md:hidden">
                        {recentDeliveries.length >
                        0 ? (
                            recentDeliveries.map(
                                (
                                    delivery
                                ) => (
                                    <div
                                        key={
                                            delivery.id
                                        }
                                        className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <TruckIcon className="h-4 w-4 text-blue-500" />

                                                    <p className="text-sm font-bold text-[#334155]">
                                                        {getDeliveryNumber(
                                                            delivery
                                                        )}
                                                    </p>
                                                </div>

                                                <p className="mt-1 text-xs text-[#64748b]">
                                                    {getRecipient(
                                                        delivery
                                                    )}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold ${
                                                    statusStyles[
                                                        normalizeStatus(
                                                            delivery.status
                                                        )
                                                    ] ||
                                                    "border-gray-200 bg-white text-gray-600"
                                                }`}
                                            >
                                                {formatStatus(
                                                    delivery.status
                                                )}
                                            </span>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                                            <div className="flex items-center gap-2 text-xs text-[#64748b]">
                                                <CalendarDaysIcon className="h-4 w-4" />

                                                {formatDate(
                                                    getDeliveryDate(
                                                        delivery
                                                    )
                                                )}
                                            </div>

                                            <div className="flex items-center justify-end gap-2 text-xs">
                                                <ExclamationTriangleIcon
                                                    className={`h-4 w-4 ${
                                                        getIncidentCount(
                                                            delivery
                                                        ) >
                                                        0
                                                            ? "text-red-500"
                                                            : "text-gray-300"
                                                    }`}
                                                />

                                                <span
                                                    className={
                                                        getIncidentCount(
                                                            delivery
                                                        ) >
                                                        0
                                                            ? "font-semibold text-red-600"
                                                            : "text-gray-400"
                                                    }
                                                >
                                                    {getIncidentCount(
                                                        delivery
                                                    )}{" "}
                                                    incidents
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="py-10 text-center">
                                <TruckIcon className="mx-auto h-8 w-8 text-gray-300" />

                                <p className="mt-2 text-sm text-[#94a3b8]">
                                    No delivery records yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ============================================================
                    DELIVERY WORKFLOW
                ============================================================ */}

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white p-2 shadow-sm">
                            <TruckIcon className="h-5 w-5 text-blue-600" />
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-[#1e3a8a]">
                                Delivery Workflow
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-[#475569]">
                                Deliveries follow the
                                driver-controlled workflow:
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {statusOrder.map(
                                    (
                                        status,
                                        index
                                    ) => (
                                        <React.Fragment
                                            key={
                                                status
                                            }
                                        >
                                            <span className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#475569] shadow-sm">
                                                {
                                                    statusLabels[
                                                        status
                                                    ]
                                                }
                                            </span>

                                            {index <
                                                statusOrder.length -
                                                    1 && (
                                                <ChevronRightIcon className="h-3 w-3 text-blue-300" />
                                            )}
                                        </React.Fragment>
                                    )
                                )}
                            </div>

                            <p className="mt-3 text-[10px] text-[#64748b]">
                                Drivers control delivery status.
                                Staff and administrators only
                                monitor delivery progress.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;