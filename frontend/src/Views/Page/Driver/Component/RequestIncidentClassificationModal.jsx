import React, { useState } from "react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import axiosClient from "../../../../api/axiosClient";

const RequestIncidentClassificationModal = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [incidentType, setIncidentType] = useState("");
  const [reason, setReason] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!incidentType.trim()) {
      setError("Please enter the new incident type.");
      return;
    }

    if (!reason.trim()) {
      setError("Please explain why this incident type is needed.");
      return;
    }

    try {
      setSaving(true);

      const response = await axiosClient.post(
        "/driver/incident-classification-requests",
        {
          incident_type: incidentType.trim(),
          reason: reason.trim(),
        }
      );

      setSuccess(
        response.data.message ||
          "Your request has been sent to the administrator."
      );

      setIncidentType("");
      setReason("");

      if (onSuccess) {
        onSuccess(response.data.request);
      }

      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 1500);
    } catch (error) {
      console.error(
        "Failed to submit incident classification request:",
        error
      );

      if (error.response?.status === 409) {
        setError(
          error.response?.data?.message ||
            "This incident classification already exists or you already have a pending request."
        );

        return;
      }

      if (error.response?.status === 422) {
        const validationErrors =
          error.response?.data?.errors;

        if (validationErrors) {
          const firstError = Object.values(
            validationErrors
          )[0]?.[0];

          setError(
            firstError ||
              "Please check the information you entered."
          );
        } else {
          setError(
            error.response?.data?.message ||
              "Please check the information you entered."
          );
        }

        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to submit your request."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    setIncidentType("");
    setReason("");
    setError("");
    setSuccess("");

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-800">
                Request New Incident Type
              </h2>

              <p className="text-xs text-slate-500">
                Can't find the incident in the list?
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >
          {/* Explanation */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs leading-5 text-amber-800">
              Submit the new incident type and explain why
              it is needed. An administrator will review
              your request and decide which department should
              handle it.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-medium text-emerald-700">
                {success}
              </p>
            </div>
          )}

          {/* Incident Type */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              New Incident Type
            </label>

            <input
              type="text"
              value={incidentType}
              onChange={(e) =>
                setIncidentType(e.target.value)
              }
              placeholder="Example: Damaged Security Seal"
              maxLength={255}
              disabled={saving}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Reason / Explanation
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              placeholder="Explain what happened and why this incident type should be added."
              rows={5}
              maxLength={5000}
              disabled={saving}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            {/* <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button> */}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestIncidentClassificationModal;