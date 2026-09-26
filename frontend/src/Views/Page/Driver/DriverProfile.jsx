import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";

const DriverProfile = () => {
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    birth_date: "",
    age: "",
    gender: "",
    address: "",
    contact_number: "",
    license_number: "",
    license_expiration: "",
    truck_plate_number: "",
    truck_name: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  /*
    |--------------------------------------------------------------------------
    | GET DRIVER INFORMATION
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    getDriverInfo();
  }, []);

  const getDriverInfo = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/driver/info");

      console.log("Driver information:", response.data);

      const driver = response.data.driver_info;

      if (driver) {
        setHasProfile(true);

        setForm({
          first_name: driver.first_name || "",

          middle_name: driver.middle_name || "",

          last_name: driver.last_name || "",

          birth_date: driver.birth_date
            ? String(driver.birth_date).substring(0, 10)
            : "",

          age: driver.age || "",

          gender: driver.gender || "",

          address: driver.address || "",

          contact_number: driver.contact_number || "",

          license_number: driver.license_number || "",

          license_expiration: driver.license_expiration
            ? String(driver.license_expiration).substring(0, 10)
            : "",

          truck_plate_number: driver.truck_plate_number || "",
          truck_name: driver.truck_name || "",
        });

        setEditing(false);
      } else {
        setHasProfile(false);
        setEditing(true);
      }
    } catch (error) {
      console.error("Failed to load driver information:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your driver information.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    |--------------------------------------------------------------------------
    | CALCULATE AGE
    |--------------------------------------------------------------------------
    */

  const calculateAge = (birthDateValue) => {
    if (!birthDateValue) {
      return "";
    }

    const birthDate = new Date(birthDateValue);

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : "";
  };

  /*
    |--------------------------------------------------------------------------
    | HANDLE CHANGE
    |--------------------------------------------------------------------------
    */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMessage("");
    setError("");

    if (name === "birth_date") {
      const calculatedAge = calculateAge(value);

      setForm((previous) => ({
        ...previous,
        birth_date: value,
        age: calculatedAge,
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await axiosClient.post("/driver/info", form);

      setMessage(
        response.data.message || "Driver information saved successfully.",
      );

      const driver = response.data.driver_info;

      if (driver) {
        setForm({
          first_name: driver.first_name || "",

          middle_name: driver.middle_name || "",

          last_name: driver.last_name || "",

          birth_date: driver.birth_date
            ? String(driver.birth_date).substring(0, 10)
            : "",

          age: driver.age || "",

          gender: driver.gender || "",

          address: driver.address || "",

          contact_number: driver.contact_number || "",

          license_number: driver.license_number || "",

          license_expiration: driver.license_expiration
            ? String(driver.license_expiration).substring(0, 10)
            : "",

          truck_plate_number: driver.truck_plate_number || "",
          truck_name: driver.truck_name || "",
        });
      }

      setHasProfile(true);
      setEditing(false);
    } catch (error) {
      console.error("Failed to save driver information:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        const firstError = Object.values(errors)[0]?.[0];

        setError(firstError || "Please check your information.");
      } else {
        setError(
          error.response?.data?.message || "Failed to save information.",
        );
      }
    } finally {
      setSaving(false);
    }
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

  /*
    |--------------------------------------------------------------------------
    | VIEW MODE
    |--------------------------------------------------------------------------
    */

  if (hasProfile && !editing) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#17243d] sm:text-3xl">
              Driver Profile
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Your driver information.
            </p>
          </div>

          <button
            onClick={() => {
              setEditing(true);
              setMessage("");
              setError("");
            }}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Edit
          </button>
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* PERSONAL INFORMATION */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#17243d]">
            Personal Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
            <InfoItem label="First Name" value={form.first_name} />

            <InfoItem label="Middle Name" value={form.middle_name} />

            <InfoItem label="Last Name" value={form.last_name} />

            <InfoItem label="Birth Date" value={form.birth_date} />

            <InfoItem label="Age" value={form.age} />

            <InfoItem label="Gender" value={form.gender} />

            <InfoItem label="Contact Number" value={form.contact_number} />

            <div className="md:col-span-2">
              <InfoItem label="Address" value={form.address} />
            </div>
          </div>
        </div>

        {/* LICENSE */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#17243d]">
            Driver's License Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <InfoItem label="License Number" value={form.license_number} />

            <InfoItem
              label="License Expiration"
              value={form.license_expiration}
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#17243d]">
            Driver's Truck Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <InfoItem label="Plate Number" value={form.truck_plate_number} />
            <InfoItem label="Truck Name" value={form.truck_name} />
          </div>
        </div>
      </div>
    );
  }

  /*
    |--------------------------------------------------------------------------
    | EDIT / CREATE MODE
    |--------------------------------------------------------------------------
    */

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#17243d] sm:text-3xl">
          Driver Profile
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Complete your personal and driver's license information.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      >
        {/* PERSONAL */}

        <section>
          <h2 className="text-lg font-semibold text-[#17243d]">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter your personal details.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
            <FormInput
              label="First Name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
            />

            <FormInput
              label="Middle Name"
              name="middle_name"
              value={form.middle_name}
              onChange={handleChange}
            />

            <FormInput
              label="Last Name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
            />

            {/* BIRTH DATE */}

            <div>
              <label
                htmlFor="birth_date"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Birth Date
              </label>

              <input
                id="birth_date"
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            {/* AGE */}

            <div>
              <label
                htmlFor="age"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Age
              </label>

              <input
                id="age"
                type="number"
                value={form.age}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-600 outline-none"
              />

              <p className="mt-1 text-xs text-gray-400">
                Automatically calculated.
              </p>
            </div>

            {/* GENDER */}

            <div>
              <label
                htmlFor="gender"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Gender
              </label>

              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              >
                <option value="">Select gender</option>

                <option value="Male">Male</option>

                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* ADDRESS */}

          <div className="mt-5">
            <label
              htmlFor="address"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Address
            </label>

            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* CONTACT */}

          <div className="mt-5">
            <label
              htmlFor="contact_number"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Contact Number
            </label>

            <input
              id="contact_number"
              type="tel"
              name="contact_number"
              value={form.contact_number}
              onChange={handleChange}
              placeholder="09XXXXXXXXX"
              maxLength={20}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>
        </section>

        {/* LICENSE */}

        <section className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-[#17243d]">
            Driver's License Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormInput
              label="License Number"
              name="license_number"
              value={form.license_number}
              onChange={handleChange}
              required
            />

            <div>
              <label
                htmlFor="license_expiration"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                License Expiration
              </label>

              <input
                id="license_expiration"
                type="date"
                name="license_expiration"
                value={form.license_expiration}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          </div>
        </section>

        <section className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-[#17243d]">
            Driver's Truck Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormInput
              label="Plate Number"
              name="truck_plate_number"
              value={form.truck_plate_number}
              onChange={handleChange}
              required
            />
            <div>
              <FormInput
                label="Truck Name"
                name="truck_name"
                value={form.truck_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </section>

        {/* BUTTONS */}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
          {hasProfile && (
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setMessage("");
                setError("");
              }}
              className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : hasProfile
                ? "Update Information"
                : "Save Information"}
          </button>
        </div>
      </form>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| FORM INPUT
|--------------------------------------------------------------------------
*/

const FormInput = ({ label, name, value, onChange, required = false }) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <input
        id={name}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        required={required}
      />
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| INFORMATION ITEM
|--------------------------------------------------------------------------
*/

const InfoItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-800">
        {value || "Not provided"}
      </p>
    </div>
  );
};

export default DriverProfile;
