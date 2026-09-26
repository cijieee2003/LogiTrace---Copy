import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../../api/axiosClient";

import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CubeIcon,
  DocumentTextIcon,
  EyeIcon,
  HashtagIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
  UserIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
|
| Staff DOES NOT change delivery status.
|
| Staff:
|   - Creates delivery
|   - Views delivery
|   - Edits delivery information
|   - Deletes delivery
|   - Views incident reports
|   - Downloads incident report PDF
|
| Driver:
|   pending
|      ↓
|
|   pick_up
|      ↓
|   arrival
|      ↓
|   queuing
|      ↓
|   unloading
|      ↓
|   checking
|      ↓
|   delivered
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| STATUS STYLE
|--------------------------------------------------------------------------
*/

const getStatusStyle = (status) => {
  switch (status) {
    case "pending":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "pick_up":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";

    case "arrival":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "queuing":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";

    case "unloading":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "checking":
      return "border-purple-200 bg-purple-50 text-purple-700";

    case "delivered":
      return "border-green-200 bg-green-50 text-green-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
};

/*
|--------------------------------------------------------------------------
| STATUS LABEL
|--------------------------------------------------------------------------
*/

const getStatusLabel = (status) => {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
};

/*
|--------------------------------------------------------------------------
| STATUS ICON
|--------------------------------------------------------------------------
*/

const getStatusIcon = (status) => {
  switch (status) {
    case "delivered":
      return CheckCircleIcon;

    case "pending":
      return ArrowPathIcon;

    default:
      return TruckIcon;
  }
};

/*
|--------------------------------------------------------------------------
| DELIVERY FORM
|--------------------------------------------------------------------------
*/

const DeliveryForm = ({
  edit = false,
  formData,
  formError,
  saving,
  handleInputChange,
  handleCreateDelivery,
  handleUpdateDelivery,
}) => {
  return (
    <form
      onSubmit={edit ? handleUpdateDelivery : handleCreateDelivery}
      className="space-y-5"
    >
      {/* FORM ERROR */}

      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XMarkIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <p className="text-sm font-medium text-red-700">
              {formError}
            </p>
          </div>
        </div>
      )}

      {/* DR NUMBER */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          DR Number
        </label>

        <div className="relative">
          <HashtagIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            name="dr_number"
            value={formData.dr_number}
            onChange={handleInputChange}
            placeholder="Enter DR number"
            autoComplete="off"
            required
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* RECIPIENT */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Customer Name
        </label>

        <div className="relative">
          <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            name="recipient_name"
            value={formData.recipient_name}
            onChange={handleInputChange}
            placeholder="Enter recipient name"
            autoComplete="off"
            required
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* QUANTITY */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Quantity Order
        </label>

        <div className="relative">
          <CubeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type="number"
            name="quantity_order"
            value={formData.quantity_order}
            onChange={handleInputChange}
            placeholder="Enter quantity"
            min="1"
            required
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <p className="mt-1 text-xs text-gray-400">
          Enter the number of items included in the order.
        </p>
      </div>

      {/* ADDRESS */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Delivery Address
        </label>

        <div className="relative">
          <MapPinIcon className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />

          <textarea
            name="delivery_address"
            value={formData.delivery_address}
            onChange={handleInputChange}
            rows="3"
            placeholder="Enter delivery address"
            required
            className="w-full resize-none rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* DELIVERY DATE */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Delivery Date
        </label>

        <div className="relative">
          <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type="date"
            name="delivery_date"
            value={formData.delivery_date}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* STATUS INFORMATION */}

      {!edit && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <ArrowPathIcon className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />

            <div>
              <p className="text-sm font-semibold text-yellow-800">
                Initial Delivery Status
              </p>

              <p className="mt-1 text-xs leading-5 text-yellow-700">
                This delivery will automatically be created with a{" "}
                <strong>Pending</strong> status. The driver will update the
                delivery status from the Driver panel.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BUTTON */}

      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />

              {edit ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              {edit ? (
                <PencilSquareIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}

              {edit ? "Save Changes" : "Create Delivery"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

const StaffDeliveryAccept = () => {
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [deliveries, setDeliveries] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [saving, setSaving] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formError, setFormError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | INCIDENT STATE
  |--------------------------------------------------------------------------
  */

  const [showIncidentModal, setShowIncidentModal] = useState(false);

  const [selectedIncident, setSelectedIncident] = useState(null);

  const [incidentLoading, setIncidentLoading] = useState(false);

  const [incidentError, setIncidentError] = useState("");

  const [pdfLoading, setPdfLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION STATE
  |--------------------------------------------------------------------------
  */

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  /*
  |--------------------------------------------------------------------------
  | FORM DATA
  |--------------------------------------------------------------------------
  */

  const [formData, setFormData] = useState({
    dr_number: "",
    recipient_name: "",
    quantity_order: "",
    delivery_address: "",
    delivery_date: "",
  });

  /*
  |--------------------------------------------------------------------------
  | FETCH DELIVERIES
  |--------------------------------------------------------------------------
  */

  const fetchDeliveries = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response = await axiosClient.get("/staff/deliveries");

      const data = response.data?.deliveries;

      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load deliveries.",
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchDeliveries(true);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | AUTO REFRESH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDeliveries(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | INPUT
  |--------------------------------------------------------------------------
  */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  };

  /*
  |--------------------------------------------------------------------------
  | RESET FORM
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {
    setFormData({
      dr_number: "",
      recipient_name: "",
      quantity_order: "",
      delivery_address: "",
      delivery_date: "",
    });

    setFormError("");
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE MODAL
  |--------------------------------------------------------------------------
  */

  const openCreateModal = () => {
    setSelectedDelivery(null);

    resetForm();

    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (saving) {
      return;
    }

    setShowCreateModal(false);

    resetForm();
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE DELIVERY
  |--------------------------------------------------------------------------
  */

  const handleCreateDelivery = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      setFormError("");

      const response = await axiosClient.post(
        "/staff/deliveries",
        {
          dr_number: formData.dr_number,
          recipient_name: formData.recipient_name,
          quantity_order: Number(formData.quantity_order),
          delivery_address: formData.delivery_address,
          delivery_date: formData.delivery_date || null,
        },
      );

      const newDelivery = response.data?.delivery;

      if (newDelivery) {
        setDeliveries((previous) => [
          newDelivery,
          ...previous,
        ]);

        setCurrentPage(1);
      } else {
        await fetchDeliveries(false);
      }

      setShowCreateModal(false);

      resetForm();
    } catch (err) {
      console.error("Failed to create delivery:", err);

      const validationErrors = err.response?.data?.errors;

      if (validationErrors) {
        const firstError =
          Object.values(validationErrors)[0];

        setFormError(
          Array.isArray(firstError)
            ? firstError[0]
            : "Please check the form.",
        );
      } else {
        setFormError(
          err.response?.data?.message ||
            "Failed to create delivery.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | VIEW DELIVERY
  |--------------------------------------------------------------------------
  */

  const handleView = (delivery) => {
    setSelectedDelivery(delivery);

    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);

    setSelectedDelivery(null);
  };

  /*
  |--------------------------------------------------------------------------
  | EDIT DELIVERY
  |--------------------------------------------------------------------------
  */

  const handleEdit = (delivery) => {
    setSelectedDelivery(delivery);

    setFormData({
      dr_number: delivery.dr_number || "",

      recipient_name: delivery.recipient_name || "",

      quantity_order: delivery.quantity_order ?? "",

      delivery_address:
        delivery.delivery_address || "",

      delivery_date: delivery.delivery_date
        ? String(delivery.delivery_date).substring(0, 10)
        : "",
    });

    setFormError("");

    setShowViewModal(false);

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setShowEditModal(false);

    setSelectedDelivery(null);

    resetForm();
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE DELIVERY
  |--------------------------------------------------------------------------
  */

  const handleUpdateDelivery = async (event) => {
    event.preventDefault();

    if (!selectedDelivery) {
      return;
    }

    try {
      setSaving(true);

      setFormError("");

      const response = await axiosClient.put(
        `/staff/deliveries/${selectedDelivery.id}`,
        {
          dr_number: formData.dr_number,

          recipient_name: formData.recipient_name,

          quantity_order: Number(formData.quantity_order),

          delivery_address: formData.delivery_address,

          delivery_date: formData.delivery_date || null,
        },
      );

      const updatedDelivery =
        response.data?.delivery;

      if (updatedDelivery) {
        setDeliveries((previous) =>
          previous.map((delivery) =>
            delivery.id === selectedDelivery.id
              ? updatedDelivery
              : delivery,
          ),
        );
      } else {
        await fetchDeliveries(false);
      }

      setShowEditModal(false);

      setSelectedDelivery(null);

      resetForm();
    } catch (err) {
      console.error(
        "Failed to update delivery:",
        err,
      );

      const validationErrors =
        err.response?.data?.errors;

      if (validationErrors) {
        const firstError =
          Object.values(validationErrors)[0];

        setFormError(
          Array.isArray(firstError)
            ? firstError[0]
            : "Please check the form.",
        );
      } else {
        setFormError(
          err.response?.data?.message ||
            "Failed to update delivery.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE DELIVERY
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this delivery?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);

      await axiosClient.delete(
        `/staff/deliveries/${id}`,
      );

      setDeliveries((previous) =>
        previous.filter(
          (delivery) => delivery.id !== id,
        ),
      );

      if (selectedDelivery?.id === id) {
        setSelectedDelivery(null);

        setShowViewModal(false);

        setShowEditModal(false);
      }
    } catch (err) {
      console.error(
        "Failed to delete delivery:",
        err,
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete delivery.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DRIVER INFORMATION
  |--------------------------------------------------------------------------
  */

  const getDriverInfo = (delivery) => {
    if (!delivery?.driver) {
      return null;
    }

    return (
      delivery.driver.driver_info ||
      delivery.driver.driverInfo ||
      delivery.driver.driver ||
      null
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DRIVER NAME
  |--------------------------------------------------------------------------
  */

  const getDriverName = (delivery) => {
    const driverInfo = getDriverInfo(delivery);

    if (driverInfo) {
      const fullName = [
        driverInfo.first_name,
        driverInfo.middle_name,
        driverInfo.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      if (fullName.trim()) {
        return fullName;
      }
    }

    if (delivery?.driver?.username) {
      return delivery.driver.username;
    }

    return "Waiting for driver";
  };

  /*
  |--------------------------------------------------------------------------
  | TRUCK NAME
  |--------------------------------------------------------------------------
  */

  const getTruckName = (delivery) => {
    const driverInfo = getDriverInfo(delivery);

    return (
      driverInfo?.truck_name ||
      delivery?.driver?.truck_name ||
      "Not assigned"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | PLATE NUMBER
  |--------------------------------------------------------------------------
  */

  const getPlateNumber = (delivery) => {
    const driverInfo = getDriverInfo(delivery);

    return (
      driverInfo?.truck_plate_number ||
      delivery?.driver?.truck_plate_number ||
      "Not assigned"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "Not scheduled";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | INCIDENT HELPERS
  |--------------------------------------------------------------------------
  */

  const getIncidentReports = (delivery) => {
    return (
      delivery?.incident_reports ||
      delivery?.incidentReports ||
      []
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE INCIDENT MODAL
  |--------------------------------------------------------------------------
  */

  const closeIncidentModal = () => {
    if (pdfLoading || incidentLoading) {
      return;
    }

    setShowIncidentModal(false);

    setSelectedIncident(null);

    setIncidentError("");
  };

  /*
  |--------------------------------------------------------------------------
  | DOWNLOAD INCIDENT PDF
  |--------------------------------------------------------------------------
  */

  const handleDownloadIncidentPdf = async () => {
    if (!selectedIncident?.id) {
      return;
    }

    try {
      setPdfLoading(true);

      const response = await axiosClient.get(
        `/incidents/${selectedIncident.id}/pdf`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = `${
        selectedIncident.incident_number ||
        "incident-report"
      }.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Failed to download incident PDF:",
        err,
      );

      window.alert(
        err.response?.data?.message ||
          "Failed to download incident report PDF.",
      );
    } finally {
      setPdfLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER DELIVERIES
  |--------------------------------------------------------------------------
  */

  const filteredDeliveries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return deliveries.filter((delivery) => {
      const matchesSearch =
        !query ||
        [
          delivery.dr_number,
          delivery.recipient_name,
          delivery.quantity_order,
          delivery.delivery_address,
          delivery.delivery_date,
          delivery.status,
          getDriverName(delivery),
          getTruckName(delivery),
          getPlateNumber(delivery),
        ]
          .filter(
            (value) =>
              value !== null &&
              value !== undefined,
          )
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        delivery.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deliveries, search, statusFilter]);

  /*
  |--------------------------------------------------------------------------
  | RESET PAGINATION WHEN FILTER CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.ceil(
    filteredDeliveries.length / itemsPerPage,
  );

  const safeCurrentPage =
    totalPages > 0
      ? Math.min(currentPage, totalPages)
      : 1;

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredDeliveries.length,
  );

  const paginatedDeliveries =
    filteredDeliveries.slice(
      startIndex,
      endIndex,
    );

  /*
  |--------------------------------------------------------------------------
  | KEEP PAGE VALID AFTER DELETE / AUTO REFRESH
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
  }, [totalPages, currentPage]);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION PAGE NUMBERS
  |--------------------------------------------------------------------------
  */

  const getPaginationPages = () => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1,
      );
    }

    if (safeCurrentPage <= 4) {
      return [
        1,
        2,
        3,
        4,
        5,
        "...",
        totalPages,
      ];
    }

    if (safeCurrentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      totalPages,
    ];
  };

  /*
  |--------------------------------------------------------------------------
  | GO TO PAGE
  |--------------------------------------------------------------------------
  */

  const goToPage = (page) => {
    if (
      page === "..." ||
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

          <p className="text-sm text-gray-500">
            Please wait a moment...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <TruckIcon className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#17243d] sm:text-3xl">
              Deliveries
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage delivery orders.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
        >
          <PlusIcon className="h-5 w-5" />

          Create Delivery
        </button>
      </div>

      {/* =========================================================
          ERROR
      ========================================================= */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XMarkIcon className="h-5 w-5 shrink-0 text-red-600" />

            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => fetchDeliveries(true)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                <ArrowPathIcon className="h-4 w-4" />

                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SEARCH + FILTER
      ========================================================= */}

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">

          {/* SEARCH */}

          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search DR number, recipient, driver, truck..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* STATUS FILTER */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

            <option value="queuing">
              Queuing
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

        <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredDeliveries.length === 0
                ? 0
                : startIndex + 1}
              -
              {endIndex}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">
              {filteredDeliveries.length}
            </span>{" "}
            filtered deliveries
          </p>

          <p className="text-xs text-gray-400">
            Total deliveries:{" "}
            <span className="font-semibold text-gray-600">
              {deliveries.length}
            </span>
          </p>
        </div>
      </div>

      {/* =========================================================
          DESKTOP TABLE
      ========================================================= */}

      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full">

            <thead className="bg-gray-50">
              <tr>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  DR Number
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Driver
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Truck
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Customer
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Quantity
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {paginatedDeliveries.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-14 text-center"
                  >
                    <TruckIcon className="mx-auto h-10 w-10 text-gray-300" />

                    <p className="mt-3 text-sm font-medium text-gray-600">
                      No deliveries found.
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedDeliveries.map((delivery) => {
                  const StatusIcon =
                    getStatusIcon(
                      delivery.status,
                    );

                  return (
                    <tr
                      key={delivery.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* DR NUMBER */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <HashtagIcon className="h-5 w-5 text-blue-600" />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {delivery.dr_number}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                              ID #{delivery.id}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* DRIVER */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                            <UserIcon className="h-4 w-4 text-gray-500" />
                          </div>

                          <p className="max-w-[170px] truncate text-sm font-medium text-gray-700">
                            {getDriverName(delivery)}
                          </p>

                        </div>
                      </td>

                      {/* TRUCK */}

                      <td className="px-5 py-4">
                        <div>

                          <div className="flex items-center gap-2">
                            <TruckIcon className="h-4 w-4 text-gray-500" />

                            <span className="max-w-[150px] truncate text-sm font-medium text-gray-700">
                              {getTruckName(delivery)}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-2">
                            <HashtagIcon className="h-3.5 w-3.5 text-gray-400" />

                            <span className="text-xs text-gray-500">
                              {getPlateNumber(delivery)}
                            </span>
                          </div>

                        </div>
                      </td>

                      {/* RECIPIENT */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">

                          <UserIcon className="h-4 w-4 text-gray-400" />

                          <p className="max-w-[170px] truncate text-sm font-medium text-gray-700">
                            {delivery.recipient_name}
                          </p>

                        </div>
                      </td>

                      {/* QUANTITY */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">

                          <CubeIcon className="h-4 w-4 text-gray-400" />

                          <span className="text-sm font-semibold text-gray-700">
                            {delivery.quantity_order}
                          </span>

                          <span className="text-xs text-gray-400">
                            items
                          </span>

                        </div>
                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">

                          <CalendarDaysIcon className="h-4 w-4 text-gray-400" />

                          <span className="text-sm text-gray-600">
                            {formatDate(
                              delivery.delivery_date,
                            )}
                          </span>

                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            delivery.status,
                          )}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />

                          {getStatusLabel(
                            delivery.status,
                          )}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-1.5">

                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              handleView(delivery)
                            }
                            title="View Delivery"
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(delivery)
                            }
                            title="Edit Delivery"
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-yellow-200 hover:bg-yellow-50 hover:text-yellow-600"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            disabled={deleteLoading}
                            onClick={() =>
                              handleDelete(
                                delivery.id,
                              )
                            }
                            title="Delete Delivery"
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>
        </div>
      </div>

      {/* =========================================================
          MOBILE CARDS
      ========================================================= */}

      <div className="space-y-4 md:hidden">

        {paginatedDeliveries.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center shadow-sm">

            <TruckIcon className="mx-auto h-10 w-10 text-gray-300" />

            <p className="mt-3 text-sm font-medium text-gray-600">
              No deliveries found.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Try changing your search or filter.
            </p>

          </div>
        ) : (
          paginatedDeliveries.map((delivery) => {
            const StatusIcon =
              getStatusIcon(delivery.status);

            return (
              <div
                key={delivery.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >

                {/* CARD HEADER */}

                <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <TruckIcon className="h-5 w-5 text-blue-600" />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-gray-800">
                        {delivery.dr_number}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Delivery #{delivery.id}
                      </p>

                    </div>

                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusStyle(
                      delivery.status,
                    )}`}
                  >
                    <StatusIcon className="h-3 w-3" />

                    {getStatusLabel(
                      delivery.status,
                    )}
                  </span>

                </div>

                {/* CARD CONTENT */}

                <div className="space-y-4 p-4">

                  {/* DRIVER */}

                  <div className="flex items-start gap-3">

                    <UserIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Driver
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {getDriverName(delivery)}
                      </p>

                    </div>

                  </div>

                  {/* TRUCK */}

                  <div className="flex items-start gap-3">

                    <TruckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Truck
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {getTruckName(delivery)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Plate:{" "}
                        {getPlateNumber(
                          delivery,
                        )}
                      </p>

                    </div>

                  </div>

                  {/* RECIPIENT */}

                  <div className="flex items-start gap-3">

                    <UserIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Customer
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {delivery.recipient_name}
                      </p>

                    </div>

                  </div>

                  {/* QUANTITY */}

                  <div className="flex items-start gap-3">

                    <CubeIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

                    <div>

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Quantity Order
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {delivery.quantity_order}{" "}
                        <span className="text-xs font-normal text-gray-500">
                          items
                        </span>
                      </p>

                    </div>

                  </div>

                  {/* ADDRESS */}

                  <div className="flex items-start gap-3">

                    <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Delivery Address
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-600">
                        {delivery.delivery_address}
                      </p>

                    </div>

                  </div>

                  {/* DATE */}

                  <div className="flex items-center gap-3">

                    <CalendarDaysIcon className="h-5 w-5 shrink-0 text-gray-400" />

                    <div>

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Delivery Date
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {formatDate(
                          delivery.delivery_date,
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* CARD ACTIONS */}

                <div className="grid grid-cols-2 gap-2 border-t border-gray-100 bg-gray-50 p-3">

                  {/* VIEW */}

                  <button
                    type="button"
                    onClick={() =>
                      handleView(delivery)
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-semibold text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <EyeIcon className="h-4 w-4" />

                    View
                  </button>

                  {/* EDIT */}

                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(delivery)
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-semibold text-gray-600 transition hover:border-yellow-200 hover:bg-yellow-50 hover:text-yellow-600"
                  >
                    <PencilSquareIcon className="h-4 w-4" />

                    Edit
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    disabled={deleteLoading}
                    onClick={() =>
                      handleDelete(
                        delivery.id,
                      )
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <TrashIcon className="h-4 w-4" />

                    Delete
                  </button>

                </div>

              </div>
            );
          })
        )}

      </div>

      {/* =========================================================
          PAGINATION
      ========================================================= */}

      {totalPages > 1 && (
        <div className="mt-5 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* PAGINATION INFO */}

            <div className="text-center text-xs text-gray-500 sm:text-left">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {endIndex}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {filteredDeliveries.length}
              </span>{" "}
              deliveries
            </div>

            {/* PAGINATION CONTROLS */}

            <div className="flex items-center justify-center gap-1.5">

              {/* PREVIOUS */}

              <button
                type="button"
                onClick={() =>
                  goToPage(safeCurrentPage - 1)
                }
                disabled={safeCurrentPage === 1}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Previous
                </span>
              </button>

              {/* PAGE NUMBERS */}

              <div className="flex items-center gap-1">
                {getPaginationPages().map(
                  (page, index) => {
                    if (page === "...") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="flex h-9 w-9 items-center justify-center text-xs font-semibold text-gray-400"
                        >
                          ...
                        </span>
                      );
                    }

                    const isActive =
                      page === safeCurrentPage;

                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          goToPage(page)
                        }
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition ${
                          isActive
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  },
                )}
              </div>

              {/* NEXT */}

              <button
                type="button"
                onClick={() =>
                  goToPage(safeCurrentPage + 1)
                }
                disabled={
                  safeCurrentPage === totalPages
                }
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="hidden sm:inline">
                  Next
                </span>

                <ChevronRightIcon className="h-4 w-4" />
              </button>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          CREATE MODAL
      ========================================================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[95vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Create Delivery
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Enter the delivery order information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

            </div>

            <div className="max-h-[calc(95vh-80px)] overflow-y-auto p-5 sm:p-6">

              <DeliveryForm
                formData={formData}
                formError={formError}
                saving={saving}
                handleInputChange={
                  handleInputChange
                }
                handleCreateDelivery={
                  handleCreateDelivery
                }
                handleUpdateDelivery={
                  handleUpdateDelivery
                }
              />

            </div>

          </div>

        </div>
      )}

      {/* =========================================================
          EDIT MODAL
      ========================================================= */}

      {showEditModal &&
        selectedDelivery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[95vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">

                <div>

                  <h2 className="text-lg font-bold text-gray-800">
                    Edit Delivery
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Update delivery information.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

              </div>

              <div className="max-h-[calc(95vh-80px)] overflow-y-auto p-5 sm:p-6">

                <DeliveryForm
                  edit
                  formData={formData}
                  formError={formError}
                  saving={saving}
                  handleInputChange={
                    handleInputChange
                  }
                  handleCreateDelivery={
                    handleCreateDelivery
                  }
                  handleUpdateDelivery={
                    handleUpdateDelivery
                  }
                />

              </div>

            </div>

          </div>
        )}

      {/* =========================================================
          VIEW DELIVERY MODAL
      ========================================================= */}

      {showViewModal &&
        selectedDelivery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">

                <div className="min-w-0">

                  <h2 className="text-lg font-bold text-[#17243d]">
                    Delivery Information
                  </h2>

                  <p className="mt-1 truncate text-xs text-gray-400">
                    DR Number:{" "}
                    {selectedDelivery.dr_number}
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

              {/* BODY */}

              <div className="space-y-6 p-5 sm:p-6">

                {/* STATUS */}

                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Current Status
                    </p>

                    <span
                      className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        selectedDelivery.status,
                      )}`}
                    >
                      {React.createElement(
                        getStatusIcon(
                          selectedDelivery.status,
                        ),
                        {
                          className:
                            "h-3.5 w-3.5",
                        },
                      )}

                      {getStatusLabel(
                        selectedDelivery.status,
                      )}
                    </span>

                  </div>

                  <TruckIcon className="h-9 w-9 text-blue-500" />

                </div>

                {/* DRIVER / TRUCK */}

                <div>

                  <h3 className="mb-3 text-sm font-semibold text-gray-800">
                    Driver & Vehicle
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                    <div className="rounded-lg border border-gray-200 p-3">

                      <div className="flex items-center gap-2 text-gray-400">

                        <UserIcon className="h-4 w-4" />

                        <span className="text-[11px] font-semibold uppercase">
                          Driver
                        </span>

                      </div>

                      <p className="mt-2 break-words text-sm font-semibold text-gray-700">
                        {getDriverName(
                          selectedDelivery,
                        )}
                      </p>

                    </div>

                    <div className="rounded-lg border border-gray-200 p-3">

                      <div className="flex items-center gap-2 text-gray-400">

                        <TruckIcon className="h-4 w-4" />

                        <span className="text-[11px] font-semibold uppercase">
                          Truck
                        </span>

                      </div>

                      <p className="mt-2 break-words text-sm font-semibold text-gray-700">
                        {getTruckName(
                          selectedDelivery,
                        )}
                      </p>

                    </div>

                    <div className="rounded-lg border border-gray-200 p-3">

                      <div className="flex items-center gap-2 text-gray-400">

                        <HashtagIcon className="h-4 w-4" />

                        <span className="text-[11px] font-semibold uppercase">
                          Plate
                        </span>

                      </div>

                      <p className="mt-2 break-words text-sm font-semibold text-gray-700">
                        {getPlateNumber(
                          selectedDelivery,
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* ORDER */}

                <div>

                  <h3 className="mb-3 text-sm font-semibold text-gray-800">
                    Order Information
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                    <div className="rounded-lg border border-gray-200 p-4">

                      <div className="flex items-center gap-2 text-gray-400">

                        <HashtagIcon className="h-4 w-4" />

                        <span className="text-[11px] font-semibold uppercase">
                          DR Number
                        </span>

                      </div>

                      <p className="mt-2 text-sm font-semibold text-gray-700">
                        {selectedDelivery.dr_number}
                      </p>

                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">

                      <div className="flex items-center gap-2 text-gray-400">

                        <UserIcon className="h-4 w-4" />

                        <span className="text-[11px] font-semibold uppercase">
                          Customer
                        </span>

                      </div>

                      <p className="mt-2 break-words text-sm font-semibold text-gray-700">
                        {selectedDelivery.recipient_name}
                      </p>

                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">

                      <div className="flex items-center gap-2 text-gray-400">

                        <CubeIcon className="h-4 w-4" />

                        <span className="text-[11px] font-semibold uppercase">
                          Quantity
                        </span>

                      </div>

                      <p className="mt-2 text-sm font-semibold text-gray-700">
                        {selectedDelivery.quantity_order}{" "}
                        <span className="text-xs font-normal text-gray-500">
                          items
                        </span>
                      </p>

                    </div>

                  </div>

                </div>

                {/* ADDRESS */}

                <div>

                  <h3 className="mb-3 text-sm font-semibold text-gray-800">
                    Delivery Address
                  </h3>

                  <div className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">

                    <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />

                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Address
                      </p>

                      <p className="mt-1 break-words text-sm leading-6 text-gray-700">
                        {selectedDelivery.delivery_address}
                      </p>

                    </div>

                  </div>

                </div>

                {/* DATE */}

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">

                  <CalendarDaysIcon className="h-5 w-5 shrink-0 text-gray-400" />

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Delivery Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {formatDate(
                        selectedDelivery.delivery_date,
                      )}
                    </p>

                  </div>

                </div>

                {/* INCIDENT NOTICE */}

                {getIncidentReports(selectedDelivery).length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                    <div className="flex items-start gap-3">

                      <DocumentTextIcon className="h-5 w-5 shrink-0 text-red-600" />

                      <div className="flex-1">

                        <p className="text-sm font-semibold text-red-800">
                          Incident Report Available
                        </p>

                        <p className="mt-1 text-xs leading-5 text-red-700">
                          This delivery has an incident report submitted by the
                          driver.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      {/* =========================================================
          INCIDENT REPORT MODAL
      ========================================================= */}

      {showIncidentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <DocumentTextIcon className="h-5 w-5 text-red-600" />
                </div>

                <div className="min-w-0">

                  <h2 className="text-lg font-bold text-gray-900">
                    Incident Report
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Delivery incident details
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeIncidentModal}
                disabled={
                  pdfLoading ||
                  incidentLoading
                }
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

            </div>

            {/* CONTENT */}

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">

              {/* LOADING */}

              {incidentLoading && (
                <div className="flex min-h-[300px] items-center justify-center">

                  <div className="text-center">

                    <ArrowPathIcon className="mx-auto h-9 w-9 animate-spin text-red-500" />

                    <p className="mt-3 text-sm font-medium text-gray-600">
                      Loading incident report...
                    </p>

                  </div>

                </div>
              )}

              {/* ERROR */}

              {!incidentLoading &&
                incidentError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-5">

                    <div className="flex items-start gap-3">

                      <DocumentTextIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                      <div>

                        <p className="text-sm font-semibold text-red-800">
                          Unable to load incident
                        </p>

                        <p className="mt-1 text-sm leading-6 text-red-700">
                          {incidentError}
                        </p>

                      </div>

                    </div>

                  </div>
                )}

              {/* INCIDENT */}

              {!incidentLoading &&
                !incidentError &&
                selectedIncident && (
                  <div className="space-y-6">

                    {/* INCIDENT HEADER */}

                    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          Incident Number
                        </p>

                        <p className="mt-1 font-mono text-sm font-bold text-gray-900">
                          {selectedIncident.incident_number}
                        </p>

                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                          selectedIncident.status ===
                          "resolved"
                            ? "bg-green-100 text-green-700"
                            : selectedIncident.status ===
                                "under_review"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {(
                          selectedIncident.status ||
                          "open"
                        )
                          .replace("_", " ")
                          .replace(
                            /\b\w/g,
                            (char) =>
                              char.toUpperCase(),
                          )}
                      </span>

                    </div>

                    {/* DELIVERY INFORMATION */}

                    <div>

                      <h3 className="mb-3 text-sm font-bold text-gray-900">
                        Delivery Information
                      </h3>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                        <div className="rounded-xl border border-gray-200 p-4">

                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            DR Number
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {selectedIncident
                              .delivery
                              ?.dr_number || "—"}
                          </p>

                        </div>

                        <div className="rounded-xl border border-gray-200 p-4">

                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            Customer
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {selectedIncident
                              .delivery
                              ?.recipient_name ||
                              "—"}
                          </p>

                        </div>

                        <div className="rounded-xl border border-gray-200 p-4">

                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            Quantity Ordered
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {selectedIncident
                              .delivery
                              ?.quantity_order ??
                              "—"}
                          </p>

                        </div>

                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                          <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">
                            Affected Quantity
                          </p>

                          <p className="mt-1 text-sm font-bold text-red-700">
                            {selectedIncident
                              .quantity_affected ??
                              "—"}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* DRIVER */}

                    <div>

                      <h3 className="mb-3 text-sm font-bold text-gray-900">
                        Driver Information
                      </h3>

                      <div className="rounded-xl border border-gray-200 p-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                            <UserIcon className="h-5 w-5 text-gray-500" />
                          </div>

                          <div className="min-w-0">

                            <p className="text-sm font-semibold text-gray-900">
                              {selectedIncident.driver
                                ? [
                                    selectedIncident
                                      .driver
                                      .first_name,
                                    selectedIncident
                                      .driver
                                      .middle_name,
                                    selectedIncident
                                      .driver
                                      .last_name,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")
                                : "Driver information unavailable"}
                            </p>

                            {selectedIncident
                              .driver
                              ?.license_number && (
                              <p className="mt-1 text-xs text-gray-500">
                                License:{" "}
                                {
                                  selectedIncident
                                    .driver
                                    .license_number
                                }
                              </p>
                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* INCIDENT DETAILS */}

                    <div>

                      <h3 className="mb-3 text-sm font-bold text-gray-900">
                        Incident Details
                      </h3>

                      <div className="space-y-3">

                        {/* INCIDENT TYPE */}

                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                          <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">
                            Incident Type
                          </p>

                          <p className="mt-1 text-base font-bold text-red-700">
                            {selectedIncident.incident_type ||
                              "—"}
                          </p>

                          <p className="mt-1 text-xs text-red-500">
                            This is the incident type selected by the driver.
                          </p>

                        </div>

                        {/* DEPARTMENT */}

                        <div className="rounded-xl border border-gray-200 p-4">

                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            Department Concerned
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {selectedIncident
                              .department_concerned ||
                              "—"}
                          </p>

                        </div>

                        {/* DEPARTMENT EMAIL */}

                        <div className="rounded-xl border border-gray-200 p-4">

                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            Department Email
                          </p>

                          <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                            {selectedIncident
                              .department_email ||
                              "—"}
                          </p>

                        </div>

                        {/* DESCRIPTION */}

                        <div className="rounded-xl border border-gray-200 p-4">

                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            Description
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                            {selectedIncident.description ||
                              "No description provided."}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* EVIDENCE PHOTO */}

                    {(selectedIncident.evidence_photo_url ||
                      selectedIncident.evidence_photo) && (
                      <div>

                        <h3 className="mb-3 text-sm font-bold text-gray-900">
                          Evidence Photo
                        </h3>

                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">

                          <img
                            src={
                              selectedIncident.evidence_photo_url ||
                              selectedIncident.evidence_photo
                            }
                            alt="Incident evidence"
                            className="max-h-[450px] w-full object-contain"
                          />

                        </div>

                      </div>
                    )}

                    {/* STAFF REMARKS */}

                    {selectedIncident.staff_remarks && (
                      <div>

                        <h3 className="mb-3 text-sm font-bold text-gray-900">
                          Staff Remarks
                        </h3>

                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

                          <p className="whitespace-pre-wrap text-sm leading-6 text-blue-900">
                            {
                              selectedIncident.staff_remarks
                            }
                          </p>

                        </div>

                      </div>
                    )}

                    {/* REPORTER */}

                    <div className="rounded-xl border border-gray-200 p-4">

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Reported By
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {selectedIncident
                          .reporter
                          ?.username ||
                          selectedIncident
                            .reporter?.email ||
                          "Driver"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {selectedIncident.created_at
                          ? new Date(
                              selectedIncident.created_at,
                            ).toLocaleString()
                          : "—"}
                      </p>

                    </div>

                  </div>
                )}

            </div>

            {/* FOOTER */}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end">

              {selectedIncident && (
                <button
                  type="button"
                  onClick={
                    handleDownloadIncidentPdf
                  }
                  disabled={
                    pdfLoading ||
                    incidentLoading
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pdfLoading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />

                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="h-4 w-4" />

                      Download PDF
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={closeIncidentModal}
                disabled={
                  pdfLoading ||
                  incidentLoading
                }
                className="inline-flex items-center justify-center rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StaffDeliveryAccept;