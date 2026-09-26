
import React, { useEffect, useState } from "react";
import {
  ExclamationTriangleIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

import axiosClient from "../../../api/axiosClient";

const IncidentClassification = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    incident_type: "",
    department: "",
    department_email: "",
    quantity_required: false,
  });

  const [classifications, setClassifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH CLASSIFICATIONS
  |--------------------------------------------------------------------------
  */

  const fetchClassifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get(
        "/incident-classifications",
      );

      setClassifications(
        response.data?.classifications || [],
      );
    } catch (error) {
      console.error(
        "Fetch classifications error:",
        error,
      );

      setError(
        error.response?.data?.message ||
          "Failed to load incident classifications.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchClassifications();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | HANDLE INPUT
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | RESET FORM
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {
    setFormData({
      incident_type: "",
      department: "",
      department_email: "",
      quantity_required: false,
    });

    setEditingId(null);
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN CREATE FORM
  |--------------------------------------------------------------------------
  */

  const openCreateForm = () => {
    resetForm();

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT FORM
  |--------------------------------------------------------------------------
  */

  const openEditForm = (item) => {
    setEditingId(item.id);

    setFormData({
      incident_type: item.incident_type || "",
      department: item.department || "",
      department_email: item.department_email || "",
      quantity_required: Boolean(item.quantity_required),
    });

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE FORM
  |--------------------------------------------------------------------------
  */

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);

    resetForm();

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE / UPDATE
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const incidentType =
      formData.incident_type.trim();

    const department =
      formData.department.trim();

    const departmentEmail =
      formData.department_email.trim();

    /*
    |--------------------------------------------------------------------------
    | FRONTEND VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      !incidentType ||
      !department ||
      !departmentEmail
    ) {
      setError("Please complete all fields.");

      return;
    }

    try {
      setSaving(true);

      /*
      |--------------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------------
      */

      if (editingId) {
        const response = await axiosClient.put(
          `/incident-classifications/${editingId}`,
          {
            incident_type: incidentType,

            department: department,

            department_email: departmentEmail,

            quantity_required:
              formData.quantity_required,
          },
        );

        const updatedClassification =
          response.data?.classification;

        if (updatedClassification) {
          setClassifications((previous) =>
            previous.map((item) =>
              item.id === editingId
                ? updatedClassification
                : item,
            ),
          );
        } else {
          await fetchClassifications();
        }

        setSuccess(
          "Incident classification updated successfully.",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE
      |--------------------------------------------------------------------------
      */

      else {
        const response = await axiosClient.post(
          "/incident-classifications",
          {
            incident_type: incidentType,

            department: department,

            department_email: departmentEmail,

            quantity_required:
              formData.quantity_required,
          },
        );

        const newClassification =
          response.data?.classification;

        if (newClassification) {
          setClassifications((previous) => [
            ...previous,
            newClassification,
          ]);
        } else {
          await fetchClassifications();
        }

        setSuccess(
          "Incident classification created successfully.",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CLOSE MODAL
      |--------------------------------------------------------------------------
      */

      setShowForm(false);

      resetForm();
    } catch (error) {
      console.error(
        "Save classification error:",
        error,
      );

      /*
      |--------------------------------------------------------------------------
      | LARAVEL VALIDATION ERROR
      |--------------------------------------------------------------------------
      */

      const validationErrors =
        error.response?.data?.errors;

      if (validationErrors) {
        const firstError =
          Object.values(validationErrors)?.[0]?.[0];

        setError(
          firstError ||
            "Please check the information you entered.",
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to save incident classification.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this classification?",
      )
    ) {
      return;
    }

    try {
      setDeletingId(id);

      await axiosClient.delete(
        `/incident-classifications/${id}`,
      );

      setSuccess(
        "Incident classification deleted successfully.",
      );

      await fetchClassifications();
    } catch (error) {
      if (error.response?.status === 409) {
        setError(
          error.response.data.message,
        );

        return;
      }

      console.error(
        "Failed to delete incident classification:",
        error,
      );

      setError(
        "Failed to delete incident classification.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =========================================================
            HEADER
        ========================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Incident Management
              </span>

            </div>

            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
              Incident Classification & Department Routing
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Create incident classifications and assign
              each incident to the specific department
              responsible for handling it.
            </p>

          </div>

          {/* CREATE BUTTON */}

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <PlusIcon className="h-5 w-5" />

            Create Classification
          </button>

        </div>

        {/* =========================================================
            SUCCESS MESSAGE
        ========================================================== */}

        {success && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-4 rounded p-1 text-green-500 hover:bg-green-100"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>

          </div>
        )}

        {/* =========================================================
            ERROR MESSAGE
        ========================================================== */}

        {error && !showForm && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-4 rounded p-1 text-red-500 hover:bg-red-100"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>

          </div>
        )}

        {/* =========================================================
            INFORMATION CARD
        ========================================================== */}

        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">

          <div className="flex gap-3">

            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">

              <BuildingOffice2Icon className="h-4 w-4 text-blue-600" />

            </div>

            <div>

              <h2 className="text-sm font-semibold text-blue-900">
                Department Routing
              </h2>

              <p className="mt-1 text-xs leading-5 text-blue-700 sm:text-sm">
                Each incident classification is connected
                to one specific department and email address.
                When a driver reports an incident, the system
                can use this information to automatically route
                the incident to the correct department.
              </p>

            </div>

          </div>

        </div>

        {/* =========================================================
            CLASSIFICATION LIST
        ========================================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">

            <h2 className="text-sm font-bold text-slate-800 sm:text-base">
              Incident Classifications
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {classifications.length} classification
              {classifications.length !== 1
                ? "s"
                : ""}{" "}
              configured
            </p>

          </div>

          {/* =======================================================
              LOADING
          ======================================================== */}

          {loading ? (
            <div className="flex min-h-screen items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

                <p className="text-sm font-medium text-gray-500">
                  Please wait a moment...
                </p>
              </div>
            </div>
          ) : classifications.length === 0 ? (

            /* =====================================================
               EMPTY STATE
            ====================================================== */

            <div className="px-5 py-12 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                <ExclamationTriangleIcon className="h-6 w-6 text-slate-400" />

              </div>

              <h3 className="mt-3 text-sm font-semibold text-slate-800">
                No classifications configured
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first incident classification
                to configure department routing.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <PlusIcon className="h-4 w-4" />

                Create Classification
              </button>

            </div>

          ) : (

            <>

              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-slate-200 bg-slate-50">

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Incident Classification
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Department
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Department Email
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Quantity
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {classifications.map((item) => (

                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* INCIDENT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">

                              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />

                            </div>

                            <span className="text-sm font-semibold text-slate-800">
                              {item.incident_type}
                            </span>

                          </div>

                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <BuildingOffice2Icon className="h-4 w-4 text-slate-400" />

                            <span className="text-sm text-slate-700">
                              {item.department}
                            </span>

                          </div>

                        </td>

                        {/* EMAIL */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <EnvelopeIcon className="h-4 w-4 text-slate-400" />

                            <span className="text-sm text-slate-600">
                              {item.department_email}
                            </span>

                          </div>

                        </td>

                        {/* QUANTITY */}

                        <td className="px-5 py-4">

                          {item.quantity_required ? (
                            <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                              Required
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                              Not Required
                            </span>
                          )}

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(item)
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              title="Edit"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  MOBILE CARDS
              ================================================== */}

              <div className="divide-y divide-slate-100 md:hidden">

                {classifications.map((item) => (

                  <div
                    key={item.id}
                    className="p-4"
                  >

                    <div className="mb-4 flex items-start justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">

                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />

                        </div>

                        <div>

                          <p className="text-sm font-semibold text-slate-800">
                            {item.incident_type}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Incident classification
                          </p>

                        </div>

                      </div>

                      <div className="flex gap-1">

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(item)
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          disabled={
                            deletingId === item.id
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === item.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-red-600" />
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>

                      </div>

                    </div>

                    <div className="space-y-3 rounded-lg bg-slate-50 p-3">

                      {/* DEPARTMENT */}

                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Department
                        </p>

                        <div className="mt-1 flex items-center gap-2">

                          <BuildingOffice2Icon className="h-4 w-4 text-slate-400" />

                          <p className="text-sm font-medium text-slate-700">
                            {item.department}
                          </p>

                        </div>

                      </div>

                      {/* EMAIL */}

                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Department Email
                        </p>

                        <div className="mt-1 flex items-center gap-2">

                          <EnvelopeIcon className="h-4 w-4 text-slate-400" />

                          <p className="break-all text-sm text-slate-600">
                            {item.department_email}
                          </p>

                        </div>

                      </div>

                      {/* QUANTITY */}

                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Quantity Required
                        </p>

                        <div className="mt-1">

                          {item.quantity_required ? (
                            <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                              Required
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500">
                              Not Required
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </>

          )}

        </div>

      </div>

      {/* =========================================================
          CREATE / EDIT MODAL
      ========================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">

              <div>

                <h2 className="text-base font-bold text-slate-800">

                  {editingId
                    ? "Edit Incident Classification"
                    : "Create Incident Classification"}

                </h2>

                <p className="mt-1 text-xs text-slate-500">

                  {editingId
                    ? "Update the classification and department routing."
                    : "Define an incident and its responsible department."}

                </p>

              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >

              {/* FORM ERROR */}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* =================================================
                  INCIDENT CLASSIFICATION
              ================================================== */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Incident Classification
                </label>

                <div className="relative">

                  <ExclamationTriangleIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="incident_type"
                    value={formData.incident_type}
                    onChange={handleChange}
                    placeholder="e.g. Damaged Item"
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />

                </div>

              </div>

              {/* =================================================
                  DEPARTMENT
              ================================================== */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Specific Department
                </label>

                <div className="relative">

                  <BuildingOffice2Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Warehouse"
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />

                </div>

              </div>

              {/* =================================================
                  DEPARTMENT EMAIL
              ================================================== */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Department Email
                </label>

                <div className="relative">

                  <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="email"
                    name="department_email"
                    value={
                      formData.department_email
                    }
                    onChange={handleChange}
                    placeholder="department@company.com"
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />

                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Incident notifications will be sent to
                  this email.
                </p>

              </div>

              {/* =================================================
                  QUANTITY REQUIRED
              ================================================== */}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="flex items-start gap-3">

                  <input
                    type="checkbox"
                    id="quantity_required"
                    name="quantity_required"
                    checked={
                      formData.quantity_required
                    }
                    onChange={handleChange}
                    disabled={saving}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <div className="flex-1">

                    <label
                      htmlFor="quantity_required"
                      className="cursor-pointer text-sm font-semibold text-slate-700"
                    >
                      Quantity Required
                    </label>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Enable this if the driver must enter
                      the number of affected items when
                      reporting this incident.
                    </p>

                  </div>

                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2">

                  {formData.quantity_required ? (
                    <p className="text-xs font-medium text-orange-600">
                      ✓ Driver must enter the affected
                      quantity.
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-slate-500">
                      Quantity is not applicable for this
                      incident type.
                    </p>
                  )}

                </div>

              </div>

              {/* =================================================
                  ACTIONS
              ================================================== */}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">

                {/* <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button> */}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving ? (

                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      {editingId
                        ? "Updating..."
                        : "Creating..."}
                    </>

                  ) : (

                    <>
                      {editingId ? (
                        <PencilSquareIcon className="h-4 w-4" />
                      ) : (
                        <CheckIcon className="h-4 w-4" />
                      )}

                      {editingId
                        ? "Update Classification"
                        : "Create Classification"}
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default IncidentClassification;

