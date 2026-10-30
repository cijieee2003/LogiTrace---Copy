    import React, { useEffect, useMemo, useState } from "react";
    import axiosClient from "../../../api/axiosClient";

    import {
        ArrowPathIcon,
        TruckIcon,
        CheckCircleIcon,
        ClockIcon,
        CubeIcon,
        ExclamationTriangleIcon,
        MapPinIcon,
        ChartBarIcon,
        CalendarDaysIcon,
        UserGroupIcon,
        ArrowTrendingUpIcon,
    } from "@heroicons/react/24/outline";

    const STATUS_ORDER = [
        "pending",
        "pick_up",
        "arrival",
        "queueing",
        "unloading",
        "checking",
        "delivered",
    ];

    const STATUS_LABELS = {
        pending: "Pending",
        pick_up: "Pick Up",
        arrival: "Arrival",
        queueing: "Queueing",
        unloading: "Unloading",
        checking: "Checking",
        delivered: "Delivered",
    };

    const STATUS_STYLES = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        pick_up: "bg-cyan-50 text-cyan-700 border-cyan-200",
        arrival: "bg-blue-50 text-blue-700 border-blue-200",
        queueing: "bg-indigo-50 text-indigo-700 border-indigo-200",
        unloading: "bg-orange-50 text-orange-700 border-orange-200",
        checking: "bg-purple-50 text-purple-700 border-purple-200",
        delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };

    const STATUS_BAR_STYLES = {
        pending: "bg-amber-500",
        pick_up: "bg-cyan-500",
        arrival: "bg-blue-500",
        queueing: "bg-indigo-500",
        unloading: "bg-orange-500",
        checking: "bg-purple-500",
        delivered: "bg-emerald-500",
    };

    const getStatusLabel = (status) => {
        return STATUS_LABELS[status] || status || "Unknown";
    };

    const getStatusStyle = (status) => {
        return (
            STATUS_STYLES[status] ||
            "bg-gray-50 text-gray-600 border-gray-200"
        );
    };

    const getStatusBarStyle = (status) => {
        return STATUS_BAR_STYLES[status] || "bg-gray-400";
    };

    const formatDate = (date) => {
        if (!date) return "Not scheduled";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return String(date);
        }

        return parsed.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "N/A";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return String(date);
        }

        return parsed.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getDriverInfo = (delivery) => {
        return (
            delivery?.driver?.driver_info ||
            delivery?.driver?.driverInfo ||
            delivery?.driver?.driver ||
            null
        );
    };

    const getDriverName = (delivery) => {
        const info = getDriverInfo(delivery);

        if (info) {
            const name = [
                info.first_name,
                info.middle_name,
                info.last_name,
            ]
                .filter(Boolean)
                .join(" ");

            if (name) return name;
        }

        return (
            delivery?.driver?.username ||
            delivery?.driver?.name ||
            "Waiting for driver"
        );
    };

    const StatCard = ({
        title,
        value,
        description,
        icon: Icon,
        iconClass,
    }) => {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            {title}
                        </p>

                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-800">
                            {value}
                        </p>

                        {description && (
                            <p className="mt-1 text-xs text-gray-400">
                                {description}
                            </p>
                        )}
                    </div>

                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                    >
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </div>
        );
    };

    const PercentageBar = ({
        label,
        value,
        total,
        barClass,
    }) => {
        const percentage =
            total > 0 ? Math.round((value / total) * 100) : 0;

        return (
            <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-gray-600">
                        {label}
                    </span>

                    <div className="text-right">
                        <span className="text-sm font-bold text-gray-800">
                            {value}
                        </span>

                        <span className="ml-1 text-xs text-gray-400">
                            ({percentage}%)
                        </span>
                    </div>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                        style={{
                            width: `${percentage}%`,
                        }}
                    />
                </div>
            </div>
        );
    };

    const LogisticDashboard = () => {
        const [deliveries, setDeliveries] = useState([]);
        const [loading, setLoading] = useState(true);
        const [refreshing, setRefreshing] = useState(false);
        const [error, setError] = useState("");
        const [lastUpdated, setLastUpdated] = useState(null);

        const fetchDeliveries = async (showLoader = false) => {
            try {
                if (showLoader) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }

                setError("");

                const response = await axiosClient.get(
                    "/staff/deliveries"
                );

                const data = response.data?.deliveries;

                setDeliveries(Array.isArray(data) ? data : []);
                setLastUpdated(new Date());
            } catch (err) {
                console.error(
                    "Failed to fetch dashboard deliveries:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                        "Failed to load dashboard data."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        useEffect(() => {
            fetchDeliveries(true);
        }, []);

        useEffect(() => {
            const interval = setInterval(() => {
                fetchDeliveries(false);
            }, 10000);

            return () => clearInterval(interval);
        }, []);

        /*
        |--------------------------------------------------------------------------
        | MAIN STATISTICS
        |--------------------------------------------------------------------------
        */

        const statistics = useMemo(() => {
            const total = deliveries.length;

            const pending = deliveries.filter(
                (item) => item.status === "pending"
            ).length;

            const active = deliveries.filter((item) =>
                [
                    "pick_up",
                    "arrival",
                    "queueing",
                    "unloading",
                    "checking",
                ].includes(item.status)
            ).length;

            const delivered = deliveries.filter(
                (item) => item.status === "delivered"
            ).length;

            const totalItems = deliveries.reduce(
                (sum, item) =>
                    sum + Number(item.quantity_order || 0),
                0
            );

            const deliveredItems = deliveries
                .filter((item) => item.status === "delivered")
                .reduce(
                    (sum, item) =>
                        sum + Number(item.quantity_order || 0),
                    0
                );

            const withDrivers = deliveries.filter(
                (item) => item.driver
            ).length;

            const withoutDrivers = deliveries.filter(
                (item) => !item.driver
            ).length;

            const incidents = deliveries.filter(
                (item) =>
                    Array.isArray(item.incident_reports) &&
                    item.incident_reports.length > 0
            ).length;

            const completionRate =
                total > 0
                    ? Math.round((delivered / total) * 100)
                    : 0;

            const activeRate =
                total > 0
                    ? Math.round((active / total) * 100)
                    : 0;

            const pendingRate =
                total > 0
                    ? Math.round((pending / total) * 100)
                    : 0;

            const assignmentRate =
                total > 0
                    ? Math.round((withDrivers / total) * 100)
                    : 0;

            const incidentRate =
                total > 0
                    ? Math.round((incidents / total) * 100)
                    : 0;

            const remainingItems =
                Math.max(totalItems - deliveredItems, 0);

            return {
                total,
                pending,
                active,
                delivered,
                totalItems,
                deliveredItems,
                remainingItems,
                withDrivers,
                withoutDrivers,
                incidents,
                completionRate,
                activeRate,
                pendingRate,
                assignmentRate,
                incidentRate,
            };
        }, [deliveries]);

        /*
        |--------------------------------------------------------------------------
        | STATUS ANALYTICS
        |--------------------------------------------------------------------------
        */

        const statusCounts = useMemo(() => {
            return STATUS_ORDER.reduce((result, status) => {
                result[status] = deliveries.filter(
                    (delivery) => delivery.status === status
                ).length;

                return result;
            }, {});
        }, [deliveries]);

        /*
        |--------------------------------------------------------------------------
        | DAILY ANALYTICS
        |--------------------------------------------------------------------------
        */

        const dailyAnalytics = useMemo(() => {
            const today = new Date();

            const last7Days = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);

                date.setHours(0, 0, 0, 0);
                date.setDate(today.getDate() - i);

                const dateKey = date.toISOString().split("T")[0];

                const total = deliveries.filter((delivery) => {
                    const deliveryDate =
                        delivery.delivery_date ||
                        delivery.created_at;

                    if (!deliveryDate) return false;

                    const parsed = new Date(deliveryDate);

                    if (Number.isNaN(parsed.getTime())) {
                        return false;
                    }

                    return (
                        parsed.toISOString().split("T")[0] ===
                        dateKey
                    );
                }).length;

                const delivered = deliveries.filter((delivery) => {
                    const deliveryDate =
                        delivery.delivery_date ||
                        delivery.created_at;

                    if (!deliveryDate) return false;

                    const parsed = new Date(deliveryDate);

                    if (Number.isNaN(parsed.getTime())) {
                        return false;
                    }

                    return (
                        parsed.toISOString().split("T")[0] ===
                            dateKey &&
                        delivery.status === "delivered"
                    );
                }).length;

                last7Days.push({
                    date: dateKey,
                    label: date.toLocaleDateString("en-US", {
                        weekday: "short",
                    }),
                    shortDate: date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    }),
                    total,
                    delivered,
                });
            }

            return last7Days;
        }, [deliveries]);

        const maxDailyValue = useMemo(() => {
            const max = Math.max(
                ...dailyAnalytics.map((item) => item.total),
                1
            );

            return max;
        }, [dailyAnalytics]);

        /*
        |--------------------------------------------------------------------------
        | RECENT DELIVERIES
        |--------------------------------------------------------------------------
        */

        const recentDeliveries = useMemo(() => {
            return [...deliveries]
                .sort((a, b) => {
                    const first = new Date(
                        a.created_at ||
                            a.delivery_date ||
                            0
                    ).getTime();

                    const second = new Date(
                        b.created_at ||
                            b.delivery_date ||
                            0
                    ).getTime();

                    return second - first;
                })
                .slice(0, 6);
        }, [deliveries]);

        /*
        |--------------------------------------------------------------------------
        | TOP DRIVER ANALYTICS
        |--------------------------------------------------------------------------
        */

        const driverAnalytics = useMemo(() => {
            const driverMap = {};

            deliveries.forEach((delivery) => {
                if (!delivery.driver) return;

                const driverId =
                    delivery.driver.id ||
                    delivery.driver.user_id ||
                    getDriverName(delivery);

                if (!driverMap[driverId]) {
                    driverMap[driverId] = {
                        id: driverId,
                        name: getDriverName(delivery),
                        total: 0,
                        delivered: 0,
                        active: 0,
                    };
                }

                driverMap[driverId].total += 1;

                if (delivery.status === "delivered") {
                    driverMap[driverId].delivered += 1;
                }

                if (
                    [
                        "pick_up",
                        "arrival",
                        "queueing",
                        "unloading",
                        "checking",
                    ].includes(delivery.status)
                ) {
                    driverMap[driverId].active += 1;
                }
            });

            return Object.values(driverMap)
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);
        }, [deliveries]);

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

        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">

                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-50 p-3">
                                    <ChartBarIcon className="h-7 w-7 text-blue-600" />
                                </div>

                                <div>
                                    <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
                                        Logistics Dashboard
                                    </h1>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Monitor deliveries and logistics
                                        performance.
                                    </p>
                                </div>
                            </div>

                            {lastUpdated && (
                                <p className="mt-3 text-xs text-gray-400">
                                    Last updated{" "}
                                    {formatDateTime(lastUpdated)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* =====================================================
                        ERROR
                    ====================================================== */}

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                            <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-600" />

                            <div>
                                <p className="text-sm font-semibold text-red-700">
                                    Dashboard Error
                                </p>

                                <p className="mt-1 text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* =====================================================
                        PRIMARY STATISTICS
                    ====================================================== */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        <StatCard
                            title="Total Deliveries"
                            value={statistics.total}
                            description="All delivery records"
                            icon={TruckIcon}
                            iconClass="bg-blue-50 text-blue-600"
                        />

                        <StatCard
                            title="Pending"
                            value={statistics.pending}
                            description={`${statistics.pendingRate}% of total deliveries`}
                            icon={ClockIcon}
                            iconClass="bg-amber-50 text-amber-600"
                        />

                        <StatCard
                            title="In Progress"
                            value={statistics.active}
                            description={`${statistics.activeRate}% currently active`}
                            icon={ArrowTrendingUpIcon}
                            iconClass="bg-cyan-50 text-cyan-600"
                        />

                        <StatCard
                            title="Delivered"
                            value={statistics.delivered}
                            description={`${statistics.completionRate}% completion rate`}
                            icon={CheckCircleIcon}
                            iconClass="bg-emerald-50 text-emerald-600"
                        />

                    </div>

                    {/* =====================================================
                        SECONDARY STATISTICS
                    ====================================================== */}

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        <StatCard
                            title="Total Items"
                            value={statistics.totalItems}
                            description="Across all deliveries"
                            icon={CubeIcon}
                            iconClass="bg-purple-50 text-purple-600"
                        />

                        <StatCard
                            title="Assigned"
                            value={statistics.withDrivers}
                            description={`${statistics.assignmentRate}% assigned to drivers`}
                            icon={UserGroupIcon}
                            iconClass="bg-indigo-50 text-indigo-600"
                        />

                        <StatCard
                            title="Unassigned"
                            value={statistics.withoutDrivers}
                            description="Waiting for driver assignment"
                            icon={TruckIcon}
                            iconClass="bg-gray-50 text-gray-600"
                        />

                        <StatCard
                            title="Incidents"
                            value={statistics.incidents}
                            description={`${statistics.incidentRate}% of deliveries`}
                            icon={ExclamationTriangleIcon}
                            iconClass="bg-orange-50 text-orange-600"
                        />

                    </div>

                    {/* =====================================================
                        ANALYTICS OVERVIEW
                    ====================================================== */}

                    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

                        {/* DELIVERY COMPLETION */}

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">
                                        Delivery Performance
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Overall delivery completion
                                        analytics.
                                    </p>
                                </div>

                                <div className="rounded-xl bg-emerald-50 p-3">
                                    <ChartBarIcon className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-6">

                                <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[12px] border-emerald-100">

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-800">
                                                {
                                                    statistics.completionRate
                                                }
                                                %
                                            </p>

                                            <p className="text-[10px] uppercase tracking-wide text-gray-400">
                                                Complete
                                            </p>
                                        </div>
                                    </div>

                                </div>

                                <div className="min-w-0 flex-1 space-y-5">

                                    <PercentageBar
                                        label="Delivered"
                                        value={
                                            statistics.delivered
                                        }
                                        total={
                                            statistics.total
                                        }
                                        barClass="bg-emerald-500"
                                    />

                                    <PercentageBar
                                        label="In Progress"
                                        value={
                                            statistics.active
                                        }
                                        total={
                                            statistics.total
                                        }
                                        barClass="bg-cyan-500"
                                    />

                                    <PercentageBar
                                        label="Pending"
                                        value={
                                            statistics.pending
                                        }
                                        total={
                                            statistics.total
                                        }
                                        barClass="bg-amber-500"
                                    />

                                </div>
                            </div>

                        </div>

                        {/* ITEM ANALYTICS */}

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">
                                        Item Analytics
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Item movement across deliveries.
                                    </p>
                                </div>

                                <div className="rounded-xl bg-purple-50 p-3">
                                    <CubeIcon className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>

                            <div className="mt-6">

                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-gray-800">
                                            {
                                                statistics.deliveredItems
                                            }
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Items delivered
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-700">
                                            {
                                                statistics.totalItems
                                            }{" "}
                                            total
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            {
                                                statistics.remainingItems
                                            }{" "}
                                            remaining
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 h-4 overflow-hidden rounded-full bg-gray-100">

                                    <div
                                        className="h-full rounded-full bg-purple-500 transition-all duration-500"
                                        style={{
                                            width: `${
                                                statistics.totalItems >
                                                0
                                                    ? Math.min(
                                                        Math.round(
                                                            (statistics.deliveredItems /
                                                                statistics.totalItems) *
                                                                100
                                                        ),
                                                        100
                                                    )
                                                    : 0
                                            }%`,
                                        }}
                                    />

                                </div>

                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <span className="text-gray-400">
                                        Delivery progress
                                    </span>

                                    <span className="font-bold text-purple-600">
                                        {statistics.totalItems >
                                        0
                                            ? Math.round(
                                                (statistics.deliveredItems /
                                                    statistics.totalItems) *
                                                    100
                                            )
                                            : 0}
                                        %
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* =====================================================
                        LAST 7 DAYS
                    ====================================================== */}

                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <h2 className="text-base font-bold text-gray-800">
                                    Delivery Activity
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Delivery activity over the last 7 days.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-xs">

                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                    <span className="text-gray-500">
                                        Total
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    <span className="text-gray-500">
                                        Delivered
                                    </span>
                                </div>

                            </div>

                        </div>

                        <div className="mt-8 grid grid-cols-7 gap-2 sm:gap-4">

                            {dailyAnalytics.map((day) => {

                                const totalHeight =
                                    day.total > 0
                                        ? Math.max(
                                            (day.total /
                                                maxDailyValue) *
                                                100,
                                            8
                                        )
                                        : 4;

                                const deliveredHeight =
                                    day.delivered > 0
                                        ? Math.max(
                                            (day.delivered /
                                                maxDailyValue) *
                                                100,
                                            5
                                        )
                                        : 0;

                                return (
                                    <div
                                        key={day.date}
                                        className="flex min-w-0 flex-col items-center"
                                    >
                                        <div className="flex h-44 w-full items-end justify-center gap-1 sm:gap-2">

                                            <div className="relative flex h-full w-1/2 items-end justify-center">

                                                <div
                                                    className="group relative w-full max-w-8 rounded-t-lg bg-blue-500 transition-all hover:bg-blue-600"
                                                    style={{
                                                        height: `${totalHeight}%`,
                                                    }}
                                                >
                                                    <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-gray-800 px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                                                        {day.total}
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="relative flex h-full w-1/2 items-end justify-center">

                                                <div
                                                    className="group relative w-full max-w-8 rounded-t-lg bg-emerald-500 transition-all hover:bg-emerald-600"
                                                    style={{
                                                        height: `${
                                                            deliveredHeight ||
                                                            2
                                                        }%`,
                                                    }}
                                                >
                                                    <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-gray-800 px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                                                        {day.delivered}
                                                    </div>
                                                </div>

                                            </div>

                                        </div>

                                        <p className="mt-3 text-[11px] font-semibold text-gray-500 sm:text-xs">
                                            {day.label}
                                        </p>

                                        <p className="mt-0.5 text-[9px] text-gray-400 sm:text-[10px]">
                                            {day.shortDate}
                                        </p>
                                    </div>
                                );
                            })}

                        </div>

                    </div>

                    {/* =====================================================
                        STATUS ANALYTICS
                    ====================================================== */}

                    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

                        {/* STATUS DISTRIBUTION */}

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                            <div className="mb-6">
                                <h2 className="text-base font-bold text-gray-800">
                                    Status Distribution
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Current distribution of deliveries.
                                </p>
                            </div>

                            <div className="space-y-4">

                                {STATUS_ORDER.map((status) => {

                                    const count =
                                        statusCounts[status] ||
                                        0;

                                    const percentage =
                                        statistics.total >
                                        0
                                            ? Math.round(
                                                (count /
                                                    statistics.total) *
                                                    100
                                            )
                                            : 0;

                                    return (
                                        <div key={status}>

                                            <div className="mb-2 flex items-center justify-between gap-3">

                                                <div className="flex min-w-0 items-center gap-2">

                                                    <span
                                                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${getStatusBarStyle(
                                                            status
                                                        )}`}
                                                    />

                                                    <span className="truncate text-sm font-medium text-gray-600">
                                                        {getStatusLabel(
                                                            status
                                                        )}
                                                    </span>

                                                </div>

                                                <div className="flex items-center gap-2">

                                                    <span className="text-sm font-bold text-gray-800">
                                                        {count}
                                                    </span>

                                                    <span className="text-xs text-gray-400">
                                                        {percentage}%
                                                    </span>

                                                </div>

                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${getStatusBarStyle(
                                                        status
                                                    )}`}
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    );
                                })}

                            </div>

                        </div>

                        {/* DRIVER ANALYTICS */}

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                            <div className="mb-6 flex items-start justify-between">

                                <div>
                                    <h2 className="text-base font-bold text-gray-800">
                                        Driver Activity
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Delivery activity by assigned driver.
                                    </p>
                                </div>

                                <div className="rounded-xl bg-indigo-50 p-3">
                                    <UserGroupIcon className="h-5 w-5 text-indigo-600" />
                                </div>

                            </div>

                            {driverAnalytics.length === 0 ? (
                                <div className="flex min-h-48 flex-col items-center justify-center text-center">

                                    <UserGroupIcon className="h-10 w-10 text-gray-300" />

                                    <p className="mt-3 text-sm font-medium text-gray-500">
                                        No driver activity yet.
                                    </p>

                                </div>
                            ) : (
                                <div className="space-y-4">

                                    {driverAnalytics.map(
                                        (driver) => {

                                            const percentage =
                                                driver.total >
                                                0
                                                    ? Math.round(
                                                        (driver.delivered /
                                                            driver.total) *
                                                            100
                                                    )
                                                    : 0;

                                            return (
                                                <div
                                                    key={
                                                        driver.id
                                                    }
                                                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                                                >

                                                    <div className="flex items-center justify-between gap-3">

                                                        <div className="flex min-w-0 items-center gap-3">

                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">

                                                                <TruckIcon className="h-5 w-5" />

                                                            </div>

                                                            <div className="min-w-0">

                                                                <p className="truncate text-sm font-semibold text-gray-800">
                                                                    {
                                                                        driver.name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-gray-400">
                                                                    {
                                                                        driver.total
                                                                    }{" "}
                                                                    deliveries
                                                                </p>

                                                            </div>

                                                        </div>

                                                        <span className="text-sm font-bold text-emerald-600">
                                                            {
                                                                percentage
                                                            }
                                                            %
                                                        </span>

                                                    </div>

                                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">

                                                        <div
                                                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />

                                                    </div>

                                                    <div className="mt-2 flex justify-between text-[11px] text-gray-400">

                                                        <span>
                                                            {
                                                                driver.delivered
                                                            }{" "}
                                                            delivered
                                                        </span>

                                                        <span>
                                                            {
                                                                driver.active
                                                            }{" "}
                                                            active
                                                        </span>

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>
                            )}

                        </div>

                    </div>

                    {/* =====================================================
                        DELIVERY COMPLETION
                    ====================================================== */}

                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <h2 className="text-base font-bold text-gray-800">
                                    Overall Delivery Completion
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Percentage of deliveries that have
                                    reached the delivered status.
                                </p>
                            </div>

                            <span className="text-2xl font-bold text-emerald-600">
                                {statistics.completionRate}%
                            </span>

                        </div>

                        <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">

                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{
                                    width: `${statistics.completionRate}%`,
                                }}
                            />

                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">

                            <span>
                                {statistics.delivered} delivered
                            </span>

                            <span>
                                {statistics.total} total deliveries
                            </span>

                        </div>

                    </div>

                    {/* =====================================================
                        RECENT DELIVERIES
                    ====================================================== */}

                    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                        <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

                            <h2 className="text-base font-bold text-gray-800">
                                Recent Deliveries
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Latest delivery activity.
                            </p>

                        </div>

                        {recentDeliveries.length === 0 ? (
                            <div className="px-6 py-12 text-center">

                                <TruckIcon className="mx-auto h-10 w-10 text-gray-300" />

                                <p className="mt-3 text-sm text-gray-500">
                                    No deliveries found.
                                </p>

                            </div>
                        ) : (
                            <>
                                {/* DESKTOP */}

                                <div className="hidden overflow-x-auto lg:block">

                                    <table className="min-w-full divide-y divide-gray-100">

                                        <thead className="bg-gray-50">

                                            <tr>

                                                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                                    DR Number
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                                    Customer 
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                                    Driver
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                                    Date
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                                    Status
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody className="divide-y divide-gray-100">

                                            {recentDeliveries.map(
                                                (delivery) => (
                                                    <tr
                                                        key={
                                                            delivery.id
                                                        }
                                                        className="transition hover:bg-gray-50"
                                                    >

                                                        <td className="px-5 py-4">

                                                            <span className="text-sm font-bold text-gray-800">
                                                                #
                                                                {delivery.dr_number ||
                                                                    delivery.id}
                                                            </span>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <span className="text-sm text-gray-700">
                                                                {delivery.recipient_name ||
                                                                    "N/A"}
                                                            </span>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <div className="flex items-center gap-2">

                                                                <TruckIcon className="h-4 w-4 text-gray-400" />

                                                                <span className="text-sm text-gray-700">
                                                                    {getDriverName(
                                                                        delivery
                                                                    )}
                                                                </span>

                                                            </div>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <div className="flex items-center gap-2">

                                                                <CalendarDaysIcon className="h-4 w-4 text-gray-400" />

                                                                <span className="text-sm text-gray-600">
                                                                    {formatDate(
                                                                        delivery.delivery_date
                                                                    )}
                                                                </span>

                                                            </div>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <span
                                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                                                    delivery.status
                                                                )}`}
                                                            >
                                                                {getStatusLabel(
                                                                    delivery.status
                                                                )}
                                                            </span>

                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                                {/* MOBILE */}

                                <div className="divide-y divide-gray-100 lg:hidden">

                                    {recentDeliveries.map(
                                        (delivery) => (
                                            <div
                                                key={
                                                    delivery.id
                                                }
                                                className="p-5"
                                            >

                                                <div className="flex items-start justify-between gap-3">

                                                    <div>

                                                        <p className="text-sm font-bold text-gray-800">
                                                            #
                                                            {delivery.dr_number ||
                                                                delivery.id}
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-600">
                                                            {delivery.recipient_name ||
                                                                "N/A"}
                                                        </p>

                                                    </div>

                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                                                            delivery.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(
                                                            delivery.status
                                                        )}
                                                    </span>

                                                </div>

                                                <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-500 sm:grid-cols-2">

                                                    <div className="flex items-center gap-2">

                                                        <TruckIcon className="h-4 w-4" />

                                                        {getDriverName(
                                                            delivery
                                                        )}

                                                    </div>

                                                    <div className="flex items-center gap-2">

                                                        <CubeIcon className="h-4 w-4" />

                                                        {delivery.quantity_order ??
                                                            0}{" "}
                                                        items

                                                    </div>

                                                    <div className="flex items-center gap-2">

                                                        <MapPinIcon className="h-4 w-4" />

                                                        <span className="truncate">
                                                            {delivery.delivery_address ||
                                                                "N/A"}
                                                        </span>

                                                    </div>

                                                    <div className="flex items-center gap-2">

                                                        <CalendarDaysIcon className="h-4 w-4" />

                                                        {formatDate(
                                                            delivery.delivery_date
                                                        )}

                                                    </div>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>
                            </>
                        )}

                    </div>

                </div>
            </div>
        );
    };

    export default LogisticDashboard;