
import React, { useEffect, useState } from "react";
import {
  Outlet,
  useLocation,
  Link,
  Navigate,
} from "react-router-dom";

import { useStateContext } from "../../context/AuthProvider";
import LoadingScreen from "../Components/LoadingScreen";
import Logo from "../../assets/images/qwerty.png";

import {
  HomeIcon,
  TruckIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  FolderIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  KeyIcon,
  ChevronDownIcon,
  InboxArrowDownIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  ShieldCheckIcon,
  ClockIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  ClipboardDocumentCheckIcon,
  RectangleStackIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const Default = () => {
  const { user, logout } = useStateContext();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [driverMenuOpen, setDriverMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setDriverMenuOpen(false);
  }, [location.pathname]);

  /*
  ============================================================
  DRIVER ONBOARDING REDIRECT
  ============================================================

  Driver flow:

  1. profile_completed = false
        ↓
     /driver/profile

  2. profile_completed = true
     password_changed = false
        ↓
     /driver/change-password

  3. profile_completed = true
     password_changed = true
        ↓
     Driver can access the normal system
  ============================================================
  */

  if (user?.role === "driver") {

    // --------------------------------------------------------
    // STEP 1: PROFILE NOT COMPLETED
    // --------------------------------------------------------
    if (!user.profile_completed) {
      if (location.pathname !== "/driver/profile") {
        return (
          <Navigate
            to="/driver/profile"
            replace
          />
        );
      }
    }

    // --------------------------------------------------------
    // STEP 2: PROFILE COMPLETED
    // BUT PASSWORD HAS NOT BEEN CHANGED
    // --------------------------------------------------------
    if (
      user.profile_completed &&
      !user.password_changed
    ) {
      if (location.pathname !== "/driver/change-password") {
        return (
          <Navigate
            to="/driver/change-password"
            replace
          />
        );
      }
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    group flex items-center rounded-xl px-4 py-3
    text-sm font-medium transition-all duration-200
    ${
      isActive(path)
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
    }
  `;

  const iconClass = (path) => `
    mr-3 h-5 w-5 shrink-0 transition-colors
    ${
      isActive(path)
        ? "text-white"
        : "text-gray-500 group-hover:text-blue-600"
    }
  `;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =========================================================
          MOBILE HEADER
      ========================================================= */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
        <div className="flex items-center">
          <img
            src={Logo}
            alt="LogiTrace Logo"
            className="h-10 w-10 object-contain"
          />

          <span className="ml-2 text-lg font-bold text-blue-600">
            LogiTrace
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-7 w-7" />
        </button>
      </header>

      {/* =========================================================
          MOBILE OVERLAY
      ========================================================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 flex-col
          border-r border-gray-200 bg-white shadow-lg
          transition-transform duration-300
          lg:translate-x-0 lg:shadow-sm
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* =====================================================
            LOGO
        ===================================================== */}
        <div className="relative flex h-24 shrink-0 items-center justify-center border-b border-gray-200 px-5">
          <img
            src={Logo}
            alt="LogiTrace Logo"
            className="h-20 w-20 object-contain"
          />

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute right-3 top-3 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-blue-600 lg:hidden"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* =====================================================
            NAVIGATION
        ===================================================== */}
        <nav className="flex-1 overflow-y-auto p-4">

          {/* ===================================================
              ADMIN
          =================================================== */}
          {user?.role === "admin" && (
            <div>
              <div className="mb-3 px-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Administration
                </p>
              </div>

              <ul className="list-none space-y-2">

                {/* Dashboard */}
                <li>
                  <Link
                    to="/admin/dashboard"
                    className={linkClass("/admin/dashboard")}
                  >
                    <HomeIcon
                      className={iconClass("/admin/dashboard")}
                    />
                    Dashboard
                  </Link>
                </li>

                {/* Delivery Tracking */}
                <li>
                  <Link
                    to="/admin/delivery"
                    className={linkClass("/admin/delivery")}
                  >
                    <TruckIcon
                      className={iconClass("/admin/delivery")}
                    />
                    Delivery Tracking
                  </Link>
                </li>

                {/* Drivers */}
                <li>
                  <Link
                    to="/admin/driver"
                    className={linkClass("/admin/driver")}
                  >
                    <UsersIcon
                      className={iconClass("/admin/driver")}
                    />
                     Create Drivers
                  </Link>
                </li>

                {/* Incident Classification Requests */}
                <li>
                  <Link
                    to="/admin/incident-classification-requests"
                    className={linkClass(
                      "/admin/incident-classification-requests"
                    )}
                  >
                    <ClipboardDocumentCheckIcon
                      className={iconClass(
                        "/admin/incident-classification-requests"
                      )}
                    />
                    Incident Classification Requests
                  </Link>
                </li>

                {/* Incident Classification */}
                <li>
                  <Link
                    to="/admin/incidentclassification"
                    className={linkClass(
                      "/admin/incidentclassification"
                    )}
                  >
                    <ClipboardDocumentListIcon
                      className={iconClass(
                        "/admin/incidentclassification"
                      )}
                    />
                    Incident Classification
                  </Link>
                </li>

                {/* Incident Reports */}
                <li>
                  <Link
                    to="/admin/incidents"
                    className={linkClass("/admin/incidents")}
                  >
                    <ExclamationTriangleIcon
                      className={iconClass("/admin/incidents")}
                    />
                    Incident Reports
                  </Link>
                </li>

                {/* Admin History */}
                <li>
                  <Link
                    to="/admin/history"
                    className={linkClass("/admin/history")}
                  >
                    <ClockIcon
                      className={iconClass("/admin/history")}
                    />
                    Admin History
                  </Link>
                </li>

              </ul>
            </div>
          )}

          {/* ===================================================
              DRIVER
          =================================================== */}
          {user?.role === "driver" && (
            <div>
              <div className="mb-3 px-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Driver Menu
                </p>
              </div>

              <ul className="list-none space-y-2">

                {/* Dashboard */}
                <li>
                  <Link
                    to="/driver/dashboard"
                    className={linkClass("/driver/dashboard")}
                  >
                    <HomeIcon
                      className={iconClass("/driver/dashboard")}
                    />
                    Dashboard
                  </Link>
                </li>

                {/* Available Deliveries */}
                <li>
                  <Link
                    to="/driver/driverdeliveries"
                    className={linkClass(
                      "/driver/driverdeliveries"
                    )}
                  >
                    <InboxArrowDownIcon
                      className={iconClass(
                        "/driver/driverdeliveries"
                      )}
                    />
                    Available Deliveries
                  </Link>
                </li>

                {/* My Deliveries */}
                <li>
                  <Link
                    to="/driver/delivery"
                    className={linkClass("/driver/delivery")}
                  >
                    <TruckIcon
                      className={iconClass("/driver/delivery")}
                    />
                    My Deliveries
                  </Link>
                </li>

                {/* Delivery Transaction Report */}
                <li>
                  <Link
                    to="/driver/delivery-transaction-report"
                    className={linkClass(
                      "/driver/delivery-transaction-report"
                    )}
                  >
                    <DocumentChartBarIcon
                      className={iconClass(
                        "/driver/delivery-transaction-report"
                      )}
                    />
                    Delivery Transaction Report
                  </Link>
                </li>
                <li>
                  <Link
                    to="/driver/archive"
                    className={linkClass("/driver/archive")}
                  >
                    <TruckIcon
                      className={iconClass("/driver/archive")}
                    />
                    My Archive
                  </Link>
                </li>

                

              </ul>
            </div>
          )}

          {/* ===================================================
              STAFF
          =================================================== */}
          {user?.role === "staff" && (
            <div>
              <div className="mb-3 px-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Staff Menu
                </p>
              </div>

              <ul className="list-none space-y-2">

                {/* Dashboard */}
                <li>
                  <Link
                    to="/staff/dashboard"
                    className={linkClass("/staff/dashboard")}
                  >
                    <HomeIcon
                      className={iconClass("/staff/dashboard")}
                    />
                    Dashboard
                  </Link>
                </li>

                {/* Delivery */}
                <li>
                  <Link
                    to="/staff/delivery"
                    className={linkClass("/staff/delivery")}
                  >
                    <TruckIcon
                      className={iconClass("/staff/delivery")}
                    />
                    Delivery Tracking
                  </Link>
                </li>

                {/* Accept Delivery */}
                <li>
                  <Link
                    to="/staff/acceptdelivery"
                    className={linkClass("/staff/acceptdelivery")}
                  >
                    <ClipboardDocumentCheckIcon
                      className={iconClass(
                        "/staff/acceptdelivery"
                      )}
                    />
                    Create Delivery
                  </Link>
                </li>

                {/* Transaction Report */}
                <li>
                  <Link
                    to="/staff/delivery-transaction-report"
                    className={linkClass(
                      "/staff/delivery-transaction-report"
                    )}
                  >
                    <DocumentChartBarIcon
                      className={iconClass(
                        "/staff/delivery-transaction-report"
                      )}
                    />
                    Delivery Transaction Report
                  </Link>
                </li>

              </ul>
            </div>
          )}

          {/* ===================================================
              SUPERADMIN
          =================================================== */}
          {user?.role === "superadmin" && (
            <div>
              <div className="mb-3 px-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  System Administration
                </p>
              </div>

              <ul className="list-none space-y-2">

                {/* Dashboard */}
                <li>
                  <Link
                    to="/superadmin/dashboard"
                    className={linkClass(
                      "/superadmin/dashboard"
                    )}
                  >
                    <ShieldCheckIcon
                      className={iconClass(
                        "/superadmin/dashboard"
                      )}
                    />
                    Dashboard
                  </Link>
                </li>

                {/* Files */}
                <li>
                  <Link
                    to="/superadmin/files"
                    className={linkClass("/superadmin/files")}
                  >
                    <FolderIcon
                      className={iconClass(
                        "/superadmin/files"
                      )}
                    />
                    Files
                  </Link>
                </li>

              </ul>
            </div>
          )}

        </nav>

        {/* =====================================================
            BOTTOM ACCOUNT AREA
        ===================================================== */}
        <div className="shrink-0 border-t border-gray-200 p-4">

          {/* ===================================================
              DRIVER ACCOUNT
          =================================================== */}
          {user?.role === "driver" && (
            <div className="mb-2">

              {/* Account Button */}
              <button
                type="button"
                onClick={() =>
                  setDriverMenuOpen(!driverMenuOpen)
                }
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-gray-700 transition hover:bg-gray-100"
              >
                <div className="flex min-w-0 items-center">

                  <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <UserCircleIcon className="h-6 w-6 text-blue-600" />
                  </div>

                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {user?.username || "Driver"}
                    </p>

                    <p className="text-xs text-gray-500">
                      Driver Account
                    </p>
                  </div>
                </div>

                <ChevronDownIcon
                  className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${
                    driverMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Account Dropdown */}
              {driverMenuOpen && (
                <div className="mt-2 space-y-1 rounded-xl bg-gray-50 p-2">

                  {/* Driver Profile */}
                  <Link
                    to="/driver/profile"
                    className={`
                      flex items-center rounded-lg px-3 py-2.5
                      text-sm font-medium transition
                      ${
                        isActive("/driver/profile")
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-700 hover:bg-white hover:text-blue-600"
                      }
                    `}
                  >
                    <UserCircleIcon className="mr-3 h-5 w-5" />
                    Driver Profile
                  </Link>

                  {/* Change Password */}
                  <Link
                    to="/driver/change-password"
                    className={`
                      flex items-center rounded-lg px-3 py-2.5
                      text-sm font-medium transition
                      ${
                        isActive("/driver/change-password")
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-700 hover:bg-white hover:text-blue-600"
                      }
                    `}
                  >
                    <KeyIcon className="mr-3 h-5 w-5" />
                    Change Password
                  </Link>

                </div>
              )}
            </div>
          )}

          {/* ===================================================
              LOGOUT
          =================================================== */}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center rounded-xl px-4 py-3 text-red-600 transition hover:bg-red-50"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
            Logout
          </button>

        </div>
      </aside>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="min-h-screen lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-10">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default Default;
