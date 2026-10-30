
import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../../api/axiosClient";

import {
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  XCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  MapPinIcon,
  UserIcon,
  CalendarDaysIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

function AdminDelivery() {
  // =========================================================
  // DATA
  // =========================================================
  const [deliveries, setDeliveries] = useState([]);

  // =========================================================
  // UI STATES
  // =========================================================
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // FETCH DELIVERIES
  // =========================================================
  const fetchDeliveries = async (silent = false) => {
    try {
      if (!silent) {
        setRefreshing(true);
      }

      const response = await axiosClient.get("/staff/deliveries");

      setDeliveries(response.data?.deliveries || []);
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load delivery transactions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================
  useEffect(() => {
    fetchDeliveries();
  }, []);

  // =========================================================
  // AUTO REFRESH
  // =========================================================
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchDeliveries(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // VIEW DELIVERY
  // =========================================================
  const openViewModal = (delivery) => {
    setSelectedDelivery(delivery);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedDelivery(null);
  };

  // =========================================================
  // FORMAT STATUS
  // =========================================================
  const formatStatus = (deliveryStatus) => {
    if (!deliveryStatus) {
      return "Unknown";
    }

    return String(deliveryStatus)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================
  const getStatusStyle = (deliveryStatus) => {
    switch (deliveryStatus) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "pick_up":
        return "bg-blue-100 text-blue-700";

      case "arrival":
        return "bg-indigo-100 text-indigo-700";

      case "queueing":
        return "bg-orange-100 text-orange-700";

      case "unloading":
        return "bg-orange-100 text-orange-700";

      case "checking":
        return "bg-purple-100 text-purple-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================================
  // STATUS ICON
  // =========================================================
  const getStatusIcon = (deliveryStatus) => {
    switch (deliveryStatus) {
      case "delivered":
        return <CheckCircleIcon className="h-4 w-4" />;

      case "pending":
        return <ClockIcon className="h-4 w-4" />;

      default:
        return <TruckIcon className="h-4 w-4" />;
    }
  };

  // =========================================================
  // DRIVER NAME
  // =========================================================
  const getDriverName = (delivery) => {
    if (!delivery) {
      return "Unassigned";
    }

    return (
      delivery.driver?.name ||
      delivery.driver?.username ||
      delivery.driver?.user?.name ||
      delivery.driver?.user?.username ||
      "Unassigned"
    );
  };

  // =========================================================
  // FILTER DELIVERIES
  // =========================================================
  const filteredDeliveries = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return deliveries.filter((delivery) => {
      const matchesSearch =
        !keyword ||
        String(delivery.dr_number || "")
          .toLowerCase()
          .includes(keyword) ||
        String(delivery.recipient_name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(delivery.delivery_address || "")
          .toLowerCase()
          .includes(keyword) ||
        String(getDriverName(delivery))
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        status === "all" ||
        String(delivery.status || "").toLowerCase() === status;

      return matchesSearch && matchesStatus;
    });
  }, [deliveries, search, status]);

  // =========================================================
  // SUMMARY
  // =========================================================
  const totalDeliveries = deliveries.length;

  const deliveredCount = deliveries.filter(
    (delivery) => delivery.status === "delivered"
  ).length;

  const pendingCount = deliveries.filter(
    (delivery) => delivery.status === "pending"
  ).length;

  const inProgressCount = deliveries.filter((delivery) =>
    [
      "pick_up",
      "arrival",
      "queueing",
      "unloading",
      "checking",
    ].includes(delivery.status)
  ).length;

  // =========================================================
  // LOADING SCREEN
  // =========================================================
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
    <div className="min-h-screen bg-gray-50">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Delivery Management
            </h1>

          </div>

          <p className="mt-1 text-sm text-gray-500">
            View and monitor all delivery transactions.
          </p>
        </div>

      </div>

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}
      {errorMessage && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          <div className="flex items-center gap-2">
            <XCircleIcon className="h-5 w-5" />

            <span className="font-medium">
              {errorMessage}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="rounded-lg p-1 transition hover:bg-red-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Deliveries
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {totalDeliveries}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>

          </div>

        </div>

        {/* DELIVERED */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Delivered
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {deliveredCount}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
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
                {pendingCount}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>

          </div>

        </div>

        {/* IN PROGRESS */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                In Progress
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {inProgressCount}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <TruckIcon className="h-6 w-6 text-purple-600" />
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          DELIVERY TABLE
      ====================================================== */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* TABLE HEADER */}
        <div className="border-b border-gray-200 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* SEARCH */}
            <div className="relative w-full lg:max-w-md">

              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Search delivery..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* STATUS FILTER */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="pick_up">
                Pick Up
              </option>

              <option value="arrival">
                Arrival
              </option>

              <option value="queueing">
                Queueing
              </option>

              <option value="unloading">
                Unloading
              </option>

              <option value="checking">
                Checking
              </option>

              <option value="delivered">
                Delivered
              </option>

            </select>

          </div>

          <p className="mt-3 text-xs text-gray-400">
            Showing {filteredDeliveries.length} of{" "}
            {deliveries.length} deliveries
          </p>

        </div>

        {/* ===================================================
            TABLE
        ==================================================== */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px] text-left">

            <thead className="bg-gray-50 text-xs uppercase text-gray-500">

              <tr>

                <th className="px-6 py-4 font-semibold">
                  DR Number
                </th>

                <th className="px-6 py-4 font-semibold">
                  Customer 
                </th>

                <th className="px-6 py-4 font-semibold">
                  Address
                </th>

                <th className="px-6 py-4 font-semibold">
                  Driver
                </th>

                <th className="px-6 py-4 font-semibold">
                  Date
                </th>

                <th className="px-6 py-4 font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 text-center font-semibold">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredDeliveries.length > 0 ? (

                filteredDeliveries.map((delivery) => (

                  <tr
                    key={delivery.id}
                    className="transition hover:bg-gray-50"
                  >

                    {/* DR NUMBER */}
                    <td className="whitespace-nowrap px-6 py-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">

                          <TruckIcon className="h-5 w-5 text-blue-600" />

                        </div>

                        <div>

                          <p className="text-sm font-semibold text-gray-800">
                            {delivery.dr_number || "N/A"}
                          </p>

                          <p className="text-xs text-gray-400">
                            #{delivery.id}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* RECIPIENT */}
                    <td className="whitespace-nowrap px-6 py-4">

                      <p className="text-sm font-medium text-gray-700">
                        {delivery.recipient_name || "N/A"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Quantity:{" "}
                        {delivery.quantity_order ?? "N/A"}
                      </p>

                    </td>

                    {/* DESTINATION */}
                    <td className="max-w-[250px] px-6 py-4">

                      <div className="flex items-start gap-2">

                        <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                        <p className="text-sm text-gray-600">
                          {delivery.delivery_address || "N/A"}
                        </p>

                      </div>

                    </td>

                    {/* DRIVER */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">

                          <UserIcon className="h-4 w-4 text-gray-500" />

                        </div>

                        <p className="text-sm text-gray-700">
                          {getDriverName(delivery)}
                        </p>

                      </div>

                    </td>

                    {/* DATE */}
                    <td className="whitespace-nowrap px-6 py-4">

                      <div className="flex items-center gap-2">

                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />

                        <span className="text-sm text-gray-600">

                          {delivery.delivery_date
                            ? new Date(
                                delivery.delivery_date
                              ).toLocaleDateString()
                            : "N/A"}

                        </span>

                      </div>

                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          delivery.status
                        )}`}
                      >

                        {getStatusIcon(delivery.status)}

                        {formatStatus(delivery.status)}

                      </span>

                    </td>

                    {/* VIEW */}
                    <td className="px-6 py-4 text-center">

                      <button
                        type="button"
                        onClick={() => openViewModal(delivery)}
                        title="View Delivery"
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                      >

                        <EyeIcon className="h-4 w-4" />

                        View

                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center"
                  >

                    <TruckIcon className="mx-auto h-10 w-10 text-gray-300" />

                    <p className="mt-3 text-sm font-medium text-gray-600">
                      No deliveries found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try changing your search or status filter.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          VIEW DELIVERY MODAL
      ====================================================== */}
      {showViewModal && selectedDelivery && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-4">

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-lg font-bold text-gray-800">
                    Delivery Details
                  </h2>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      selectedDelivery.status
                    )}`}
                  >

                    {getStatusIcon(selectedDelivery.status)}

                    {formatStatus(selectedDelivery.status)}

                  </span>

                </div>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedDelivery.dr_number || "N/A"}
                </p>

              </div>

              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >

                <XMarkIcon className="h-6 w-6" />

              </button>

            </div>

            {/* CONTENT */}
            <div className="p-6">

              {/* DELIVERY INFORMATION */}
              <div className="mb-6">

                <h3 className="mb-4 text-sm font-bold text-gray-800">
                  Delivery Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* DR NUMBER */}
                  <div className="rounded-lg bg-gray-50 p-4">

                    <div className="flex items-center gap-2">

                      <TruckIcon className="h-5 w-5 text-blue-600" />

                      <p className="text-xs font-medium text-gray-400">
                        DR Number
                      </p>

                    </div>

                    <p className="mt-2 text-sm font-bold text-gray-800">
                      {selectedDelivery.dr_number || "N/A"}
                    </p>

                  </div>

                  {/* RECIPIENT */}
                  <div className="rounded-lg bg-gray-50 p-4">

                    <div className="flex items-center gap-2">

                      <UserIcon className="h-5 w-5 text-blue-600" />

                      <p className="text-xs font-medium text-gray-400">
                        Customer 
                      </p>

                    </div>

                    <p className="mt-2 text-sm font-bold text-gray-800">
                      {selectedDelivery.recipient_name || "N/A"}
                    </p>

                  </div>

                  {/* QUANTITY */}
                  <div className="rounded-lg bg-gray-50 p-4">

                    <div className="flex items-center gap-2">

                      <CubeIcon className="h-5 w-5 text-blue-600" />

                      <p className="text-xs font-medium text-gray-400">
                        Quantity Order
                      </p>

                    </div>

                    <p className="mt-2 text-sm font-bold text-gray-800">
                      {selectedDelivery.quantity_order ?? "N/A"}
                    </p>

                  </div>

                  {/* DATE */}
                  <div className="rounded-lg bg-gray-50 p-4">

                    <div className="flex items-center gap-2">

                      <CalendarDaysIcon className="h-5 w-5 text-blue-600" />

                      <p className="text-xs font-medium text-gray-400">
                        Delivery Date
                      </p>

                    </div>

                    <p className="mt-2 text-sm font-bold text-gray-800">

                      {selectedDelivery.delivery_date
                        ? new Date(
                            selectedDelivery.delivery_date
                          ).toLocaleDateString()
                        : "N/A"}

                    </p>

                  </div>

                </div>

              </div>

              {/* ADDRESS */}
              <div className="mb-6">

                <h3 className="mb-3 text-sm font-bold text-gray-800">
                  Delivery Address
                </h3>

                <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">

                  <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <p className="text-sm leading-6 text-gray-700">
                    {selectedDelivery.delivery_address ||
                      "No delivery address provided."}
                  </p>

                </div>

              </div>

              {/* DRIVER */}
              <div className="mb-6">

                <h3 className="mb-3 text-sm font-bold text-gray-800">
                  Assigned Driver
                </h3>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">

                      <UserIcon className="h-5 w-5 text-blue-600" />

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-gray-800">
                        {getDriverName(selectedDelivery)}
                      </p>

                      {selectedDelivery.driver?.email && (
                        <p className="mt-1 text-xs text-gray-500">
                          {selectedDelivery.driver.email}
                        </p>
                      )}

                    </div>

                  </div>

                  {!selectedDelivery.driver && (
                    <p className="mt-3 text-xs leading-5 text-gray-400">
                      No driver has accepted this delivery yet.
                    </p>
                  )}

                </div>

              </div>

              {/* STATUS */}
              <div>

                <h3 className="mb-3 text-sm font-bold text-gray-800">
                  Current Delivery Status
                </h3>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${getStatusStyle(
                        selectedDelivery.status
                      )}`}
                    >

                      {getStatusIcon(selectedDelivery.status)}

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-gray-800">
                        {formatStatus(selectedDelivery.status)}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Current delivery stage
                      </p>

                    </div>

                  </div>

                  {/* PROGRESS */}
                  <div className="mt-5">

                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>Pending</span>
                      <span>Pick Up</span>
                      <span>Arrival</span>
                      <span>Queueing</span>
                      <span>Unloading</span>
                      <span>Checking</span>
                      <span>Delivered</span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">

                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{
                          width:
                            selectedDelivery.status ===
                            "pending"
                              ? "14%"
                              : selectedDelivery.status ===
                                "pick_up"
                              ? "28%"
                              : selectedDelivery.status ===
                                "arrival"
                              ? "42%"
                              : selectedDelivery.status ===
                                "queueing"
                              ? "57%"
                              : selectedDelivery.status ===
                                "unloading"
                              ? "71%"
                              : selectedDelivery.status ===
                                "checking"
                              ? "85%"
                              : selectedDelivery.status ===
                                "delivered"
                              ? "100%"
                              : "0%",
                        }}
                      />

                    </div>

                  </div>

                  <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">

                    <p className="text-xs leading-5 text-blue-700">
                      <span className="font-semibold">
                        View only:
                      </span>{" "}
                      The delivery status is controlled by
                      the driver. Admin can monitor the
                      delivery progress but cannot change
                      the status.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* FOOTER */}   

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminDelivery;

