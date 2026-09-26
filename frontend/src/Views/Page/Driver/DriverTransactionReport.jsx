
import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../../api/axiosClient";

import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PrinterIcon,
  CheckCircleIcon,
  TruckIcon,
  CubeIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  MapPinIcon,
  UserIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

const DriverTransactionReport = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Fetch Deliveries
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
        "/driver/delivery-transaction-reports"
      );

      setDeliveries(response.data.deliveries || []);
    } catch (error) {
      console.error(
        "Failed to load driver transaction reports:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load your delivery transaction reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load + Auto Refresh
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchDeliveries();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchDeliveries(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Driver Name
  |--------------------------------------------------------------------------
  */

  const getDriverName = (delivery) => {
    const driverInfo = delivery?.driver?.driverInfo;

    if (driverInfo) {
      return [
        driverInfo.first_name,
        driverInfo.middle_name,
        driverInfo.last_name,
      ]
        .filter(Boolean)
        .join(" ");
    }

    return delivery?.driver?.username || "N/A";
  };

  /*
  |--------------------------------------------------------------------------
  | Date Formatter
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Search / Filter
  |--------------------------------------------------------------------------
  */

  const filteredDeliveries = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return deliveries;
    }

    return deliveries.filter((delivery) => {
      return (
        delivery?.recipient_name
          ?.toLowerCase()
          .includes(searchText) ||
        delivery?.dr_number
          ?.toLowerCase()
          .includes(searchText) ||
        delivery?.delivery_address
          ?.toLowerCase()
          .includes(searchText)
      );
    });
  }, [deliveries, search]);

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  const totalTransactions = deliveries.length;

  const totalQuantity = deliveries.reduce(
    (total, delivery) =>
      total + Number(delivery?.quantity_order || 0),
    0
  );

  const selectedCount = selectedDeliveries.length;

  /*
  |--------------------------------------------------------------------------
  | Selection
  |--------------------------------------------------------------------------
  */

  const toggleDelivery = (id) => {
    setSelectedDeliveries((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (deliveryId) => deliveryId !== id
        );
      }

      return [...previous, id];
    });
  };

  const allFilteredSelected =
    filteredDeliveries.length > 0 &&
    filteredDeliveries.every((delivery) =>
      selectedDeliveries.includes(delivery.id)
    );

  const selectAll = () => {
    const filteredIds = filteredDeliveries.map(
      (delivery) => delivery.id
    );

    setSelectedDeliveries((previous) => {
      const combined = new Set([
        ...previous,
        ...filteredIds,
      ]);

      return Array.from(combined);
    });
  };

  const deselectAll = () => {
    const filteredIds = new Set(
      filteredDeliveries.map((delivery) => delivery.id)
    );

    setSelectedDeliveries((previous) =>
      previous.filter((id) => !filteredIds.has(id))
    );
  };

  const clearSelection = () => {
    setSelectedDeliveries([]);
  };

  /*
  |--------------------------------------------------------------------------
  | Print DTR
  |--------------------------------------------------------------------------
  */

  const printDTR = async () => {
    if (selectedDeliveries.length === 0) {
      alert("Please select at least one delivered transaction.");
      return;
    }

    try {
      setPrinting(true);

      const response = await axiosClient.post(
        "/driver/delivery-transaction-reports/pdf",
        {
          delivery_ids: selectedDeliveries,
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (error) {
      console.error(
        "Failed to generate driver DTR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to generate the Delivery Transaction Report."
      );
    } finally {
      setPrinting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Clear Search
  |--------------------------------------------------------------------------
  */

  const clearSearch = () => {
    setSearch("");
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <DocumentChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Delivery Transaction Report
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  View and print your completed delivery transactions.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XMarkIcon className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to load transactions
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Total Transactions */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completed Deliveries
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalTransactions}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Total completed transactions
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <CheckCircleIcon className="h-7 w-7 text-green-600" />
              </div>

            </div>
          </div>

          {/* Total Quantity */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Items Delivered
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalQuantity.toLocaleString()}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Across completed deliveries
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <CubeIcon className="h-7 w-7 text-purple-600" />
              </div>

            </div>
          </div>

          {/* Selected */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Selected Reports
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {selectedCount}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Ready for DTR generation
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <PrinterIcon className="h-7 w-7 text-blue-600" />
              </div>

            </div>
          </div>

        </div>

        {/* =====================================================
            SEARCH + ACTIONS
        ====================================================== */}
        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}
            <div className="relative w-full lg:max-w-md">

              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Search D.R. number, customer, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}

            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">

              {allFilteredSelected ? (
                <button
                  type="button"
                  onClick={deselectAll}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Deselect All
                </button>
              ) : (
                <button
                  type="button"
                  onClick={selectAll}
                  disabled={filteredDeliveries.length === 0}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Select All
                </button>
              )}

              <button
                type="button"
                onClick={clearSelection}
                disabled={selectedCount === 0}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear Selection
              </button>

              <button
                type="button"
                onClick={printDTR}
                disabled={
                  printing ||
                  selectedCount === 0
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PrinterIcon
                  className={`h-5 w-5 ${
                    printing ? "animate-pulse" : ""
                  }`}
                />

                {printing
                  ? "Generating..."
                  : `Print DTR${
                      selectedCount > 0
                        ? ` (${selectedCount})`
                        : ""
                    }`}
              </button>

            </div>

          </div>

          {/* Selection Info */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">

            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredDeliveries.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {deliveries.length}
              </span>{" "}
              completed deliveries
            </p>

            {selectedCount > 0 && (
              <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                <CheckIcon className="h-4 w-4" />
                {selectedCount} transaction
                {selectedCount !== 1 ? "s" : ""} selected
              </div>
            )}

          </div>
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {loading ? (
            <div className="flex min-h-screen items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

                <p className="text-sm font-medium text-gray-500">
                  Please wait a moment...
                </p>
              </div>
            </div>
          ) : filteredDeliveries.length === 0 ? (

            /* EMPTY */
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                {search ? (
                  <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                ) : (
                  <TruckIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>

              <h3 className="mt-4 text-base font-semibold text-gray-800">
                {search
                  ? "No matching transactions"
                  : "No completed deliveries"}
              </h3>

              <p className="mt-1 max-w-md text-sm text-gray-500">
                {search
                  ? "Try changing your search keywords."
                  : "Your completed delivery transactions will appear here once deliveries are marked as delivered."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                >
                  Clear Search
                </button>
              )}

            </div>
          ) : (

            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}
              <div className="hidden overflow-x-auto lg:block">

                <table className="min-w-full text-left">

                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>

                      <th className="w-12 px-5 py-4">
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={() =>
                            allFilteredSelected
                              ? deselectAll()
                              : selectAll()
                          }
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        D.R. Number
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Quantity
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Address
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Delivery Date
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {filteredDeliveries.map((delivery) => {

                      const isSelected =
                        selectedDeliveries.includes(
                          delivery.id
                        );

                      return (
                        <tr
                          key={delivery.id}
                          className={`transition ${
                            isSelected
                              ? "bg-blue-50/60"
                              : "hover:bg-gray-50"
                          }`}
                        >

                          {/* Checkbox */}
                          <td className="px-5 py-4">

                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                toggleDelivery(
                                  delivery.id
                                )
                              }
                              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />

                          </td>

                          {/* D.R. Number */}
                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                                <TruckIcon className="h-5 w-5 text-blue-600" />
                              </div>

                              <div>
                                <p className="font-semibold text-gray-900">
                                  {delivery.dr_number ||
                                    "N/A"}
                                </p>

                                <p className="text-xs text-gray-400">
                                  Delivery Record
                                </p>
                              </div>

                            </div>

                          </td>

                          {/* Customer */}
                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <UserIcon className="h-4 w-4 text-gray-400" />

                              <span className="font-medium text-gray-800">
                                {delivery.recipient_name ||
                                  "N/A"}
                              </span>

                            </div>

                          </td>

                          {/* Quantity */}
                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <CubeIcon className="h-4 w-4 text-gray-400" />

                              <span className="font-semibold text-gray-800">
                                {Number(
                                  delivery.quantity_order ||
                                    0
                                ).toLocaleString()}
                              </span>

                            </div>

                          </td>

                          {/* Address */}
                          <td className="max-w-xs px-5 py-4">

                            <div className="flex items-start gap-2">

                              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                              <span className="line-clamp-2 text-sm text-gray-600">
                                {delivery.delivery_address ||
                                  "N/A"}
                              </span>

                            </div>

                          </td>

                          {/* Date */}
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

                          {/* Status */}
                          <td className="px-5 py-4">

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">

                              <CheckCircleIcon className="h-4 w-4" />

                              Delivered

                            </span>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  MOBILE CARDS
              ================================================== */}
              <div className="divide-y divide-gray-100 lg:hidden">

                {filteredDeliveries.map((delivery) => {

                  const isSelected =
                    selectedDeliveries.includes(
                      delivery.id
                    );

                  return (
                    <div
                      key={delivery.id}
                      className={`p-4 transition ${
                        isSelected
                          ? "bg-blue-50/60"
                          : "bg-white"
                      }`}
                    >

                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-center gap-3">

                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              toggleDelivery(
                                delivery.id
                              )
                            }
                            className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                            <TruckIcon className="h-5 w-5 text-blue-600" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {delivery.dr_number ||
                                "N/A"}
                            </p>

                            <p className="text-xs text-gray-400">
                              Delivery Record
                            </p>
                          </div>

                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">

                          <CheckCircleIcon className="h-3.5 w-3.5" />

                          Delivered

                        </span>

                      </div>

                      {/* Customer */}
                      <div className="mt-4 rounded-xl bg-gray-50 p-3">

                        <div className="flex items-center gap-2">

                          <UserIcon className="h-4 w-4 text-gray-400" />

                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                              Customer
                            </p>

                            <p className="mt-0.5 text-sm font-semibold text-gray-800">
                              {delivery.recipient_name ||
                                "N/A"}
                            </p>
                          </div>

                        </div>

                      </div>

                      {/* Details */}
                      <div className="mt-3 grid grid-cols-2 gap-3">

                        {/* Quantity */}
                        <div className="rounded-xl border border-gray-100 bg-white p-3">

                          <div className="flex items-center gap-2">

                            <CubeIcon className="h-4 w-4 text-purple-500" />

                            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                              Quantity
                            </span>

                          </div>

                          <p className="mt-1 text-sm font-bold text-gray-800">
                            {Number(
                              delivery.quantity_order ||
                                0
                            ).toLocaleString()}
                          </p>

                        </div>

                        {/* Date */}
                        <div className="rounded-xl border border-gray-100 bg-white p-3">

                          <div className="flex items-center gap-2">

                            <CalendarDaysIcon className="h-4 w-4 text-blue-500" />

                            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                              Date
                            </span>

                          </div>

                          <p className="mt-1 text-sm font-bold text-gray-800">
                            {formatDate(
                              delivery.delivery_date
                            )}
                          </p>

                        </div>

                      </div>

                      {/* Address */}
                      <div className="mt-3 rounded-xl border border-gray-100 bg-white p-3">

                        <div className="flex items-start gap-2">

                          <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                              Delivery Address
                            </p>

                            <p className="mt-1 text-sm leading-5 text-gray-700">
                              {delivery.delivery_address ||
                                "N/A"}
                            </p>
                          </div>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            </>
          )}

        </div>

        {/* =====================================================
            FOOTER INFO
        ====================================================== */}
        {!loading && filteredDeliveries.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">

            <p>
              Select completed transactions to generate
              your Delivery Transaction Report.
            </p>

            <p>
              Last updated automatically every 10 seconds.
            </p>

          </div>
        )}

      </div>
    </div>
  );
};

export default DriverTransactionReport;

