import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";

import {
  TruckIcon,
  MapPinIcon,
  UserIcon,
  CubeIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import RequestIncidentClassificationModal from "./Component/RequestIncidentClassificationModal";

const DriverDelivery = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [showRequestClassificationModal, setShowRequestClassificationModal] =
    useState(false);

  const [deliveries, setDeliveries] = useState([]);

  const [loading, setLoading] = useState(true);

  const [updatingId, setUpdatingId] = useState(null);

  const [acceptingId, setAcceptingId] = useState(null);

  const [error, setError] = useState("");

  // =========================================================
  // INCIDENT CLASSIFICATIONS
  // =========================================================

  const [classifications, setClassifications] = useState([]);

  const [classificationLoading, setClassificationLoading] = useState(false);

  // =========================================================
  // INCIDENT MODAL
  // =========================================================

  const [incidentModalOpen, setIncidentModalOpen] = useState(false);

  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const [incidentLoading, setIncidentLoading] = useState(false);

  const [incidentError, setIncidentError] = useState("");

  const [incidentForm, setIncidentForm] = useState({
    incident_classification_id: "",
    incident_type: "",
    description: "",
    quantity_affected: "",
    evidence_photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  // =========================================================
  // STATUS CONFIGURATION
  // =========================================================

  /*
   * BACKEND FLOW:
   *
   * pending
   *    ↓
   * pick_up
   *    ↓
   * arrival
   *    ↓
   * queueing
   *    ↓
   * unloading
   *    ↓
   * checking
   *    ↓
   * delivered
   *
   * pick_up is hidden from the progress UI.
   */

  const statuses = [
    "arrival",
    "queueing",
    "unloading",
    "checking",
    "delivered",
  ];

  const nextStatus = {
    pick_up: "arrival",
    arrival: "queueing",
    queueing: "unloading",
    unloading: "checking",
    checking: "delivered",
  };

  const statusLabels = {
    pending: "Pending",
    pick_up: "Pick Up",
    arrival: "Arrival",
    queueing: "Queueing",
    unloading: "Unloading",
    checking: "Checking",
    delivered: "Delivered",
  };

  const nextStatusLabels = {
    pick_up: "Start Arrival",
    arrival: "Start Queueing",
    queueing: "Start Unloading",
    unloading: "Start Checking",
    checking: "Mark as Delivered",
  };

  // =========================================================
  // INCIDENT RULE
  // =========================================================

  /*
   * Driver can report incidents only during:
   *
   * arrival
   * queueing
   * unloading
   * checking
   *
   * Cannot report during:
   *
   * pending
   * pick_up
   * delivered
   */

  const canReportIncident = (status) => {
    return ["arrival", "queueing", "unloading", "checking"].includes(status);
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getStatusLabel = (status) => {
    return statusLabels[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-600";

      case "pick_up":
        return "bg-cyan-100 text-cyan-700";

      case "arrival":
        return "bg-blue-100 text-blue-700";

      case "queueing":
        return "bg-indigo-100 text-indigo-700";

      case "unloading":
        return "bg-purple-100 text-purple-700";

      case "checking":
        return "bg-orange-100 text-orange-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =========================================================
  // FETCH DELIVERIES
  // =========================================================

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/driver/my-deliveries");

      setDeliveries(response.data?.deliveries || response.data || []);
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);

      setError(
        error.response?.data?.message || "Failed to load your deliveries.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH INCIDENT CLASSIFICATIONS
  // =========================================================

  const fetchClassifications = async () => {
    try {
      setClassificationLoading(true);

      const response = await axiosClient.get("/incident-classifications");

      setClassifications(
        response.data?.classifications || response.data || [],
      );
    } catch (error) {
      console.error("Failed to fetch incident classifications:", error);

      setIncidentError(
        error.response?.data?.message ||
          "Failed to load incident classifications.",
      );
    } finally {
      setClassificationLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchDeliveries();
    fetchClassifications();
  }, []);

  // =========================================================
  // ACCEPT DELIVERY
  // =========================================================

  const acceptDelivery = async (deliveryId) => {
    try {
      setAcceptingId(deliveryId);
      setError("");

      const response = await axiosClient.post(
        `/driver/deliveries/${deliveryId}/accept`,
      );

      const acceptedDelivery = response.data?.delivery;

      if (acceptedDelivery) {
        setDeliveries((previous) =>
          previous.map((delivery) =>
            delivery.id === deliveryId ? acceptedDelivery : delivery,
          ),
        );
      } else {
        await fetchDeliveries();
      }
    } catch (error) {
      console.error("Failed to accept delivery:", error);

      setError(error.response?.data?.message || "Failed to accept delivery.");
    } finally {
      setAcceptingId(null);
    }
  };

  // =========================================================
  // UPDATE DELIVERY STATUS
  // =========================================================

  const updateStatus = async (delivery) => {
    const next = nextStatus[delivery.status];

    if (!next) {
      return;
    }

    try {
      setUpdatingId(delivery.id);
      setError("");

      const response = await axiosClient.patch(
        `/driver/deliveries/${delivery.id}/status`,
        {
          status: next,
        },
      );

      const updatedDelivery = response.data?.delivery;

      if (updatedDelivery) {
        setDeliveries((previous) =>
          previous.map((item) =>
            item.id === delivery.id ? updatedDelivery : item,
          ),
        );
      } else {
        await fetchDeliveries();
      }
    } catch (error) {
      console.error("Failed to update status:", error);

      setError(
        error.response?.data?.message || "Failed to update delivery status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================================
  // OPEN INCIDENT MODAL
  // =========================================================

  const openIncidentModal = (delivery) => {
    if (!canReportIncident(delivery.status)) {
      return;
    }

    setSelectedDelivery(delivery);

    setIncidentError("");

    setIncidentForm({
      incident_classification_id: "",
      incident_type: "",
      description: "",
      quantity_affected: "",
      evidence_photo: null,
    });

    setPhotoPreview(null);

    setIncidentModalOpen(true);
  };

  // =========================================================
  // GET SELECTED CLASSIFICATION
  // =========================================================

  /*
   * IMPORTANT:
   *
   * Do NOT use a separate incidentClassificationId state.
   *
   * The selected classification ID is already stored in:
   *
   * incidentForm.incident_classification_id
   */

  const selectedClassification = classifications.find(
    (classification) =>
      String(classification.id) ===
      String(incidentForm.incident_classification_id),
  );

  // =========================================================
  // HANDLE INCIDENT CLASSIFICATION CHANGE
  // =========================================================

  const handleClassificationChange = (event) => {
    const classificationId = event.target.value;

    const selected = classifications.find(
      (classification) =>
        String(classification.id) === String(classificationId),
    );

    setIncidentForm((previous) => ({
      ...previous,

      incident_classification_id: classificationId,

      incident_type: selected?.incident_type || "",

      /*
       * If this classification does not require quantity,
       * clear the quantity field.
       */
      quantity_affected: selected?.quantity_required
        ? previous.quantity_affected
        : "",
    }));

    setIncidentError("");
  };

  // =========================================================
  // HANDLE INCIDENT FORM
  // =========================================================

  const handleIncidentChange = (event) => {
    const { name, value } = event.target;

    setIncidentForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (incidentError) {
      setIncidentError("");
    }
  };

  // =========================================================
  // HANDLE PHOTO
  // =========================================================

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIncidentForm((previous) => ({
      ...previous,
      evidence_photo: file,
    }));

    const previewUrl = URL.createObjectURL(file);

    setPhotoPreview(previewUrl);
  };

  // =========================================================
  // SUBMIT INCIDENT
  // =========================================================

  const submitIncident = async (event) => {
    event.preventDefault();

    if (!selectedDelivery) {
      return;
    }

    // -------------------------------------------------------
    // CHECK DELIVERY STATUS
    // -------------------------------------------------------

    if (!canReportIncident(selectedDelivery.status)) {
      setIncidentError(
        "Incident reports are not allowed for this delivery status.",
      );

      return;
    }

    // -------------------------------------------------------
    // CHECK CLASSIFICATION
    // -------------------------------------------------------

    if (!incidentForm.incident_classification_id) {
      setIncidentError("Please select an incident type.");

      return;
    }

    // -------------------------------------------------------
    // CHECK DESCRIPTION
    // -------------------------------------------------------

    if (!incidentForm.description.trim()) {
      setIncidentError("Please provide a description of the incident.");

      return;
    }

    // -------------------------------------------------------
    // CHECK QUANTITY
    // -------------------------------------------------------

    if (
      selectedClassification?.quantity_required &&
      (!incidentForm.quantity_affected ||
        Number(incidentForm.quantity_affected) < 1)
    ) {
      setIncidentError(
        "Please enter the quantity affected for this incident type.",
      );

      return;
    }

    try {
      setIncidentLoading(true);
      setIncidentError("");

      const formData = new FormData();

      // -----------------------------------------------------
      // CLASSIFICATION ID
      // -----------------------------------------------------

      formData.append(
        "incident_classification_id",
        incidentForm.incident_classification_id,
      );

      // -----------------------------------------------------
      // DESCRIPTION
      // -----------------------------------------------------

      formData.append(
        "description",
        incidentForm.description.trim(),
      );

      // -----------------------------------------------------
      // QUANTITY
      // -----------------------------------------------------

      /*
       * IMPORTANT:
       *
       * Only send quantity_affected when the classification
       * requires quantity.
       *
       * If quantity_required = false:
       *
       * quantity_affected is NOT sent.
       *
       * Backend will save NULL.
       */

      if (selectedClassification?.quantity_required) {
        formData.append(
          "quantity_affected",
          incidentForm.quantity_affected,
        );
      }

      // -----------------------------------------------------
      // PHOTO
      // -----------------------------------------------------

      if (incidentForm.evidence_photo) {
        formData.append(
          "evidence_photo",
          incidentForm.evidence_photo,
        );
      }

      // -----------------------------------------------------
      // SEND REQUEST
      // -----------------------------------------------------

      await axiosClient.post(
        `/driver/deliveries/${selectedDelivery.id}/incidents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      /*
       * IMPORTANT:
       *
       * Reporting an incident does NOT change the delivery
       * status.
       */

      setDeliveries((previous) =>
        previous.map((item) =>
          item.id === selectedDelivery.id
            ? {
                ...item,
                status: selectedDelivery.status,
              }
            : item,
        ),
      );

      closeIncidentModal();
    } catch (error) {
      console.error("Failed to submit incident:", error);

      // -----------------------------------------------------
      // VALIDATION ERROR
      // -----------------------------------------------------

      const validationErrors = error.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors).flat()[0];

        setIncidentError(
          firstError || "Please check the incident form.",
        );
      } else {
        setIncidentError(
          error.response?.data?.message ||
            "Failed to submit incident report.",
        );
      }
    } finally {
      setIncidentLoading(false);
    }
  };

  // =========================================================
  // CLOSE INCIDENT MODAL
  // =========================================================

  const closeIncidentModal = () => {
    if (incidentLoading) {
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setIncidentModalOpen(false);

    setSelectedDelivery(null);

    setIncidentError("");

    setIncidentForm({
      incident_classification_id: "",
      incident_type: "",
      description: "",
      quantity_affected: "",
      evidence_photo: null,
    });

    setPhotoPreview(null);
  };

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

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                My Deliveries
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your deliveries and report incidents during
                the delivery process.
              </p>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setIncidentError("");
                setShowRequestClassificationModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-cyan-700"
            >
              <span className="text-base leading-none">
                +
              </span>

              Can't find the incident type?
            </button>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-500" />

            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {deliveries.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-300" />

            <h2 className="mt-4 text-lg font-semibold text-gray-700">
              No deliveries available
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              There are currently no deliveries assigned to you.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {deliveries.map((delivery) => {
              const currentVisibleIndex = statuses.indexOf(
                delivery.status,
              );

              return (
                <div
                  key={delivery.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >

                  {/* =================================================
                      DELIVERY HEADER
                  ================================================== */}

                  <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div>
                        <div className="flex flex-wrap items-center gap-3">

                          <h2 className="text-lg font-bold text-gray-800">
                            DR #{delivery.dr_number}
                          </h2>

                          <span
                            className={`
                              inline-flex w-fit items-center
                              rounded-full px-3 py-1.5
                              text-xs font-semibold
                              ${getStatusBadgeClass(
                                delivery.status,
                              )}
                            `}
                          >
                            {getStatusLabel(
                              delivery.status,
                            )}
                          </span>

                        </div>

                        <p className="mt-1 text-xs text-gray-400">
                          Created{" "}
                          {formatDateTime(
                            delivery.created_at,
                          )}
                        </p>
                      </div>

                      {/* =================================================
                          ACTION BUTTONS
                      ================================================== */}

                      <div className="flex flex-col gap-2 sm:flex-row">

                        {/* STATUS BUTTON */}

                        {delivery.status !== "delivered" &&
                          delivery.status !== "pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(delivery)
                              }
                              disabled={
                                updatingId === delivery.id
                              }
                              className={`
                                inline-flex items-center
                                justify-center gap-2
                                rounded-xl px-5 py-3
                                text-sm font-semibold
                                text-white transition
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                ${
                                  delivery.status ===
                                  "checking"
                                    ? "bg-orange-500 hover:bg-orange-600"
                                    : "bg-cyan-600 hover:bg-cyan-700"
                                }
                              `}
                            >
                              {updatingId === delivery.id ? (
                                <>
                                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <TruckIcon className="h-5 w-5" />

                                  {nextStatusLabels[
                                    delivery.status
                                  ] || "Update Status"}
                                </>
                              )}
                            </button>
                          )}

                        {/* ACCEPT BUTTON */}

                        {delivery.status === "pending" && (
                          <button
                            type="button"
                            onClick={() =>
                              acceptDelivery(delivery.id)
                            }
                            disabled={
                              acceptingId === delivery.id
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {acceptingId === delivery.id ? (
                              <>
                                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                Accepting...
                              </>
                            ) : (
                              <>
                                <TruckIcon className="h-5 w-5" />
                                Accept Delivery
                              </>
                            )}
                          </button>
                        )}

                        {/* REPORT INCIDENT BUTTON */}

                        {canReportIncident(
                          delivery.status,
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              openIncidentModal(
                                delivery,
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            <ExclamationTriangleIcon className="h-5 w-5" />

                            Report Incident
                          </button>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      DELIVERY INFORMATION
                  ================================================== */}

                  <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">

                    {/* RECIPIENT */}

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-50 p-2">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Customer 
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {delivery.recipient_name ||
                            "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* QUANTITY */}

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-purple-50 p-2">
                        <CubeIcon className="h-5 w-5 text-purple-600" />
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Quantity
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {delivery.quantity_order ??
                            "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* DATE */}

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-green-50 p-2">
                        <CalendarDaysIcon className="h-5 w-5 text-green-600" />
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Delivery Date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {formatDate(
                            delivery.delivery_date,
                          )}
                        </p>
                      </div>
                    </div>

                    {/* ADDRESS */}

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-orange-50 p-2">
                        <MapPinIcon className="h-5 w-5 text-orange-600" />
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Address
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {delivery.delivery_address ||
                            "N/A"}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* =================================================
                      DELIVERY PROGRESS
                  ================================================== */}

                  <div className="border-t border-gray-100 px-5 py-5 sm:px-6">

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700">
                        Delivery Progress
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Current stage:{" "}
                        <span className="font-semibold text-gray-600">
                          {delivery.status === "pick_up"
                            ? "Arrival"
                            : getStatusLabel(
                                delivery.status,
                              )}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

                      {statuses.map((status, index) => {
                        const active =
                          delivery.status === status;

                        const completed =
                          delivery.status !== "pick_up" &&
                          delivery.status !== "pending" &&
                          currentVisibleIndex >= 0 &&
                          index < currentVisibleIndex;

                        const isDelivered =
                          status === "delivered";

                        return (
                          <div
                            key={status}
                            className={`
                              relative rounded-xl
                              border px-2 py-3
                              text-center
                              transition-all duration-200
                              ${
                                active
                                  ? isDelivered
                                    ? "border-green-300 bg-green-50 text-green-700 shadow-sm"
                                    : "border-cyan-300 bg-cyan-50 text-cyan-700 shadow-sm"
                                  : completed
                                    ? "border-green-200 bg-green-50 text-green-600"
                                    : "border-gray-200 bg-gray-50 text-gray-400"
                              }
                            `}
                          >
                            <div className="mb-1 flex justify-center">

                              {active ? (
                                <CheckCircleIcon
                                  className={`
                                    h-6 w-6
                                    ${
                                      isDelivered
                                        ? "text-green-600"
                                        : "text-cyan-600"
                                    }
                                  `}
                                />
                              ) : completed ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                              )}

                            </div>

                            <p
                              className={`
                                text-xs font-semibold
                                ${
                                  active
                                    ? isDelivered
                                      ? "text-green-700"
                                      : "text-cyan-700"
                                    : completed
                                      ? "text-green-600"
                                      : "text-gray-400"
                                }
                              `}
                            >
                              {getStatusLabel(status)}
                            </p>

                            {active && (
                              <p
                                className={`
                                  mt-1 text-[10px]
                                  font-medium
                                  ${
                                    isDelivered
                                      ? "text-green-600"
                                      : "text-cyan-600"
                                  }
                                `}
                              >
                                Current
                              </p>
                            )}

                          </div>
                        );
                      })}

                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        )}
      </div>

      {/* ===========================================================
          INCIDENT MODAL
      ============================================================ */}

      {incidentModalOpen && selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* ===================================================
                MODAL HEADER
            ==================================================== */}

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Report Incident
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  DR #{selectedDelivery.dr_number}
                  {" • "}
                  {getStatusLabel(
                    selectedDelivery.status,
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={closeIncidentModal}
                disabled={incidentLoading}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

            </div>

            {/* ===================================================
                MODAL BODY
            ==================================================== */}

            <form
              onSubmit={submitIncident}
              className="space-y-5 p-5"
            >

              {/* INCIDENT INFORMATION */}

              <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                <div className="flex items-start gap-3">

                  <ExclamationTriangleIcon className="h-6 w-6 shrink-0 text-red-500" />

                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Delivery Incident
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-600">
                      Report the problem that occurred during
                      this delivery stage.
                    </p>
                  </div>

                </div>
              </div>

              {/* ERROR */}

              {incidentError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">
                    {incidentError}
                  </p>
                </div>
              )}

              {/* =================================================
                  INCIDENT TYPE
              ================================================== */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Incident Type
                </label>

                <select
                  name="incident_classification_id"
                  value={
                    incidentForm.incident_classification_id
                  }
                  onChange={
                    handleClassificationChange
                  }
                  required
                  disabled={classificationLoading}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                >

                  <option value="">
                    {classificationLoading
                      ? "Loading incident types..."
                      : classifications.length === 0
                        ? "No incident types available"
                        : "Select incident type"}
                  </option>

                  {classifications.map(
                    (classification) => (
                      <option
                        key={classification.id}
                        value={classification.id}
                      >
                        {classification.incident_type}
                      </option>
                    ),
                  )}

                </select>

                {!classificationLoading &&
                  classifications.length === 0 && (
                    <p className="mt-2 text-xs text-red-500">
                      No incident classifications have
                      been configured by the administrator.
                    </p>
                  )}

              </div>

              {/* =================================================
                  SELECTED INCIDENT TYPE
              ================================================== */}

              {selectedClassification && (
                <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">

                  <p className="text-xs font-medium text-cyan-600">
                    Selected Incident Type
                  </p>

                  <p className="mt-1 text-sm font-bold text-cyan-800">
                    {selectedClassification.incident_type}
                  </p>

                  <p className="mt-2 text-xs text-cyan-600">
                    Department:{" "}
                    <span className="font-semibold">
                      {selectedClassification.department}
                    </span>
                  </p>

                </div>
              )}

              {/* =================================================
                  QUANTITY
              ================================================== */}

              {selectedClassification?.quantity_required && (
                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Quantity Affected
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="number"
                    name="quantity_affected"
                    min="1"
                    value={
                      incidentForm.quantity_affected
                    }
                    onChange={handleIncidentChange}
                    required
                    placeholder="Enter affected quantity"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-400">
                    Enter the number of items affected by
                    this incident.
                  </p>

                </div>
              )}

              {!selectedClassification?.quantity_required &&
                incidentForm.incident_classification_id && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">

                    <p className="text-xs text-gray-500">
                      Quantity affected is not applicable
                      for this incident type.
                    </p>

                  </div>
                )}

              {/* =================================================
                  DESCRIPTION
              ================================================== */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={incidentForm.description}
                  onChange={handleIncidentChange}
                  required
                  rows={4}
                  placeholder="Describe what happened..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />

              </div>

              {/* =================================================
                  EVIDENCE PHOTO
              ================================================== */}

              {/* <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Evidence Photo
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center transition hover:border-cyan-300 hover:bg-cyan-50">

                  <PhotoIcon className="h-8 w-8 text-gray-400" />

                  <span className="mt-2 text-sm font-semibold text-gray-600">
                    Choose Photo
                  </span>

                  <span className="mt-1 text-xs text-gray-400">
                    JPG, PNG, JPEG or WEBP
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                </label>

                {photoPreview && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">

                    <img
                      src={photoPreview}
                      alt="Incident evidence preview"
                      className="max-h-64 w-full object-cover"
                    />

                  </div>
                )}

              </div> */}

              {/* =================================================
                  BUTTONS
              ================================================== */}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeIncidentModal}
                  disabled={incidentLoading}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    incidentLoading ||
                    classificationLoading ||
                    !incidentForm.incident_classification_id ||
                    !incidentForm.description.trim() ||
                    (selectedClassification?.quantity_required &&
                      (!incidentForm.quantity_affected ||
                        Number(
                          incidentForm.quantity_affected,
                        ) < 1))
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {incidentLoading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-5 w-5" />
                      Submit Incident
                    </>
                  )}

                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          REQUEST INCIDENT CLASSIFICATION MODAL
      ========================================================== */}

      <RequestIncidentClassificationModal
        isOpen={showRequestClassificationModal}
        onClose={() =>
          setShowRequestClassificationModal(false)
        }
        onSuccess={() => {
          fetchClassifications();
        }}
      />

    </div>
  );
};

export default DriverDelivery;