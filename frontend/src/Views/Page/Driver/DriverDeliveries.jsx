
import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../../api/axiosClient";

import {
    TruckIcon,
    MapPinIcon,
    UserIcon,
    CubeIcon,
    CalendarDaysIcon,
    ArrowRightIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    FunnelIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";

const DriverDeliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [acceptingId, setAcceptingId] = useState(null);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const [confirmModalOpen, setConfirmModalOpen] =
        useState(false);

    const [selectedDelivery, setSelectedDelivery] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | FETCH AVAILABLE DELIVERIES
    |--------------------------------------------------------------------------
    */

    const fetchDeliveries = async (silent = false) => {
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await axiosClient.get(
                "/driver/deliveries"
            );

            setDeliveries(
                response.data?.deliveries || []
            );
        } catch (error) {
            console.error(
                "Failed to fetch available deliveries:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Failed to load available deliveries."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD + AUTO REFRESH
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchDeliveries();

        const interval = setInterval(() => {
            if (!document.hidden) {
                fetchDeliveries(true);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | FILTER DELIVERIES
    |--------------------------------------------------------------------------
    */

    const filteredDeliveries = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return deliveries.filter((delivery) => {
            const matchesSearch =
                !keyword ||
                delivery.dr_number
                    ?.toLowerCase()
                    .includes(keyword) ||
                delivery.recipient_name
                    ?.toLowerCase()
                    .includes(keyword) ||
                delivery.delivery_address
                    ?.toLowerCase()
                    .includes(keyword);

            const matchesDate =
                !dateFilter ||
                delivery.delivery_date === dateFilter;

            return matchesSearch && matchesDate;
        });
    }, [deliveries, search, dateFilter]);

    /*
    |--------------------------------------------------------------------------
    | SUMMARY
    |--------------------------------------------------------------------------
    */

    const totalQuantity = useMemo(() => {
        return filteredDeliveries.reduce(
            (total, delivery) =>
                total +
                Number(delivery.quantity_order || 0),
            0
        );
    }, [filteredDeliveries]);

    /*
    |--------------------------------------------------------------------------
    | OPEN ACCEPT CONFIRMATION
    |--------------------------------------------------------------------------
    */

    const openAcceptConfirmation = (delivery) => {
        setSelectedDelivery(delivery);
        setError("");
        setConfirmModalOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | CLOSE ACCEPT CONFIRMATION
    |--------------------------------------------------------------------------
    */

    const closeAcceptConfirmation = () => {
        if (acceptingId !== null) {
            return;
        }

        setConfirmModalOpen(false);
        setSelectedDelivery(null);
    };

    /*
    |--------------------------------------------------------------------------
    | ACCEPT DELIVERY
    |--------------------------------------------------------------------------
    */

    const acceptDelivery = async () => {
        if (!selectedDelivery) {
            return;
        }

        const deliveryId = selectedDelivery.id;

        try {
            setAcceptingId(deliveryId);
            setError("");

            await axiosClient.post(
                `/driver/deliveries/${deliveryId}/accept`
            );

            setDeliveries((previous) =>
                previous.filter(
                    (delivery) =>
                        delivery.id !== deliveryId
                )
            );

            setConfirmModalOpen(false);
            setSelectedDelivery(null);
        } catch (error) {
            console.error(
                "Failed to accept delivery:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Failed to accept the delivery."
            );
        } finally {
            setAcceptingId(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | FORMAT DATE
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) {
            return "Not specified";
        }

        return new Date(date).toLocaleDateString(
            "en-US",
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

    return (
        <div className="min-h-screen w-full min-w-0 bg-[#f5f7fb] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl">

                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="mb-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="p-4 sm:p-5 lg:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 sm:h-14 sm:w-14">
                                    <TruckIcon className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h1 className="truncate text-xl font-bold tracking-tight text-gray-800 sm:text-2xl">
                                            Available Deliveries
                                        </h1>

                                        {refreshing && (
                                            <ArrowPathIcon className="h-4 w-4 shrink-0 animate-spin text-blue-600" />
                                        )}
                                    </div>

                                    <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                                        Review available delivery
                                        requests and accept a trip
                                        that is ready for pickup.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-2 border-t border-gray-100 sm:grid-cols-3">
                        <div className="border-r border-gray-100 px-4 py-4 sm:px-6">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Available
                            </p>

                            <p className="mt-1 text-xl font-bold text-blue-600 sm:text-2xl">
                                {deliveries.length}
                            </p>
                        </div>

                        <div className="px-4 py-4 sm:px-6 sm:border-r sm:border-gray-100">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Total Quantity
                            </p>

                            <p className="mt-1 text-xl font-bold text-gray-800 sm:text-2xl">
                                {totalQuantity}
                            </p>
                        </div>

                        <div className="hidden px-4 py-4 sm:block sm:px-6">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Current Status
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />

                                <span className="text-sm font-semibold text-amber-700">
                                    Waiting for Driver
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    ERROR
                ===================================================== */}

                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                        <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />

                        <div className="min-w-0">
                            <p className="font-semibold">
                                Unable to process request
                            </p>

                            <p className="mt-0.5 break-words text-xs sm:text-sm">
                                {error}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="ml-auto shrink-0 rounded-lg p-1 transition hover:bg-red-100"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}

                

                {/* =====================================================
                    EMPTY STATE
                ===================================================== */}

                {deliveries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center shadow-sm sm:px-8">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
                            <TruckIcon className="h-10 w-10 text-blue-300" />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-gray-700">
                            No Available Deliveries
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                            There are currently no pending
                            deliveries waiting for a driver.
                            New delivery requests will appear
                            here automatically.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                fetchDeliveries(true)
                            }
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            <ArrowPathIcon className="h-4 w-4" />
                            Check Again
                        </button>
                    </div>
                ) : filteredDeliveries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                            <MagnifyingGlassIcon className="h-8 w-8 text-gray-300" />
                        </div>

                        <h2 className="mt-4 text-base font-bold text-gray-700">
                            No Matching Deliveries
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Try changing your search or date
                            filter.
                        </p>
                    </div>
                ) : (

                    /* =================================================
                       DELIVERY GRID
                    ================================================= */

                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">

                        {filteredDeliveries.map(
                            (delivery) => (
                                <div
                                    key={delivery.id}
                                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                                >

                                    {/* Card top accent */}
                                    <div className="h-1 bg-blue-600" />

                                    {/* Header */}
                                    <div className="p-4 pb-3 sm:p-5 sm:pb-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                                        <TruckIcon className="h-5 w-5 text-blue-600" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                                                            Delivery Receipt
                                                        </p>

                                                        <h2 className="mt-0.5 break-all text-sm font-bold text-gray-800 sm:text-base">
                                                            {delivery.dr_number ||
                                                                "N/A"}
                                                        </h2>
                                                    </div>
                                                </div>
                                            </div>

                                            <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                Pending
                                            </span>
                                        </div>
                                    </div>

                                    {/* A highlight */}
                                    <div className="mx-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 sm:mx-5">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                                                <MapPinIcon className="h-4 w-4 text-red-500" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                                                    Address
                                                </p>

                                                <p className="mt-0.5 break-words text-xs font-semibold leading-5 text-gray-700">
                                                    {delivery.delivery_address ||
                                                        "No address available"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Information */}
                                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                                        <div className="grid grid-cols-2 gap-3">

                                            {/* Customer  */}
                                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="h-4 w-4 text-blue-500" />

                                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                                                        Customer 
                                                    </p>
                                                </div>

                                                <p className="mt-2 break-words text-xs font-semibold leading-4 text-gray-700">
                                                    {delivery.recipient_name ||
                                                        "N/A"}
                                                </p>
                                            </div>

                                            {/* Quantity */}
                                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                                <div className="flex items-center gap-2">
                                                    <CubeIcon className="h-4 w-4 text-purple-500" />

                                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                                                        Quantity
                                                    </p>
                                                </div>

                                                <p className="mt-2 text-xs font-semibold text-gray-700">
                                                    {delivery.quantity_order ??
                                                        "N/A"}{" "}
                                                    items
                                                </p>
                                            </div>

                                            {/* Delivery Date */}
                                            <div className="col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDaysIcon className="h-4 w-4 text-green-600" />

                                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                                                        Delivery Date
                                                    </p>
                                                </div>

                                                <p className="mt-2 text-xs font-semibold text-gray-700">
                                                    {formatDate(
                                                        delivery.delivery_date
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Accept */}
                                        <div className="mt-5 border-t border-gray-100 pt-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openAcceptConfirmation(
                                                        delivery
                                                    )
                                                }
                                                disabled={
                                                    acceptingId !==
                                                    null
                                                }
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Accept Delivery

                                                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </button>

                                            <p className="mt-2 text-center text-[9px] text-gray-400">
                                                Accepting assigns this
                                                delivery to your account.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* =====================================================
                    FOOTER INFORMATION
                ===================================================== */}

                {deliveries.length > 0 && (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                            <TruckIcon className="h-5 w-5 text-blue-600" />
                        </div>

                        <div>
                            <p className="text-xs font-bold text-blue-900">
                                Driver Assignment
                            </p>

                            <p className="mt-1 text-[11px] leading-5 text-blue-700">
                                Available deliveries are waiting for
                                a driver to accept them. Once you
                                accept a delivery, it is assigned to
                                your account and the delivery moves
                                to the Pick Up stage.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* =========================================================
                ACCEPT CONFIRMATION MODAL
            ========================================================= */}

            {confirmModalOpen &&
                selectedDelivery && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">

                        <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">

                            {/* Modal header */}
                            <div className="relative border-b border-gray-100 px-5 pb-5 pt-7 sm:px-6">
                                <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-gray-200 sm:hidden" />

                                <button
                                    type="button"
                                    onClick={
                                        closeAcceptConfirmation
                                    }
                                    disabled={
                                        acceptingId !== null
                                    }
                                    className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 sm:right-5 sm:top-5"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>

                                <div className="flex flex-col items-center text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                                        <TruckIcon className="h-8 w-8 text-blue-600" />
                                    </div>

                                    <h2 className="mt-4 text-xl font-bold text-gray-800">
                                        Accept Delivery?
                                    </h2>

                                    <p className="mt-1 max-w-sm text-sm leading-5 text-gray-500">
                                        Please review the delivery
                                        details before accepting this
                                        trip.
                                    </p>
                                </div>
                            </div>

                            {/* Delivery details */}
                            <div className="p-5 sm:p-6">
                                <div className="overflow-hidden rounded-2xl border border-gray-200">
                                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
                                        <div>
                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                                                Delivery Receipt
                                            </p>

                                            <p className="mt-1 text-base font-bold text-gray-800">
                                                {
                                                    selectedDelivery.dr_number
                                                }
                                            </p>
                                        </div>

                                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase text-amber-700">
                                            Pending
                                        </span>
                                    </div>

                                    <div className="space-y-4 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                                <UserIcon className="h-4 w-4 text-blue-600" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                                                    Customer 
                                                </p>

                                                <p className="mt-1 break-words text-sm font-semibold text-gray-700">
                                                    {selectedDelivery.recipient_name ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                                                <MapPinIcon className="h-4 w-4 text-red-500" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                                                    Address
                                                </p>

                                                <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-700">
                                                    {selectedDelivery.delivery_address ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-xl bg-gray-50 p-3">
                                                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                                                    Quantity
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-gray-700">
                                                    {selectedDelivery.quantity_order ??
                                                        "N/A"}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-gray-50 p-3">
                                                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                                                    Delivery Date
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-gray-700">
                                                    {formatDate(
                                                        selectedDelivery.delivery_date
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                                    <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                                    <div>
                                        <p className="text-xs font-bold text-blue-900">
                                            Before accepting
                                        </p>

                                        <p className="mt-1 text-[11px] leading-5 text-blue-700">
                                            Once accepted, this delivery
                                            will be assigned to your
                                            driver account and removed
                                            from the available delivery
                                            list.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal actions */}
                            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-end sm:px-6">
                               

                                <button
                                    type="button"
                                    onClick={acceptDelivery}
                                    disabled={
                                        acceptingId ===
                                        selectedDelivery.id
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {acceptingId ===
                                    selectedDelivery.id ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Accepting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="h-5 w-5" />
                                            Yes, Accept Delivery
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default DriverDeliveries;

