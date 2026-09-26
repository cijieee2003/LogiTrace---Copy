import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { useStateContext } from "./context/AuthProvider.jsx";

/*
    |--------------------------------------------------------------------------
    | LAYOUTS/PAGE
    |--------------------------------------------------------------------------
    */
import Auth from "./Views/Layout/Auth.jsx";
import Login from "./Views/Page/Auth/Login.jsx";
import Default from "./Views/Layout/Default.jsx";
/*
    |--------------------------------------------------------------------------
    | COMPONENTS
    |--------------------------------------------------------------------------
    */
import LoadingScreen from "./Views/Components/LoadingScreen.jsx";
import NotFound from "./Views/Components/NotFound.jsx";

/*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */
import AdminDashboard from "./Views/Page/Admin/AdminDashboard.jsx";
import AdminDelivery from "./Views/Page/Admin/AdminDelivery.jsx";
import DriverList from "./Views/Page/Admin/DriverList.jsx";
import RegisterDriver from "./Views/Page/Admin/RegisterDriver.jsx";
import IncidentClassification from "./Views/Page/Admin/IncidentClassification.jsx";
import IncidentClassificationRequests from "./Views/Page/Admin/IncidentClassificationRequests.jsx";
import IncidentReports from "./Views/Page/Admin/IncidentReports.jsx";
import AdminHistory from "./Views/Page/Admin/AdminHistory.jsx";
/*
    |--------------------------------------------------------------------------
    | DRIVER
    |--------------------------------------------------------------------------
    */
import DriverDashboard from "./Views/Page/Driver/DriverDashboard.jsx";
import DriverProfile from "./Views/Page/Driver/DriverProfile.jsx";
import DriverDelivery from "./Views/Page/Driver/DriverDelivery.jsx";
import DriverTransactionReport from "./Views/Page/Driver/DriverTransactionReport.jsx";
import DriverDeliveries from "./Views/Page/Driver/DriverDeliveries.jsx";
import ChangePassword from "./Views/Page/Driver/ChangePassword.jsx";
import DriverArchive from "./Views/Page/Driver/DriverArchive.jsx";

/*
    |--------------------------------------------------------------------------
    | STAFF
    |--------------------------------------------------------------------------
    */

import LogisticDashboard from "./Views/Page/LogisticsStaff/LogisticDashboard.jsx";
import StaffDelivery from "./Views/Page/LogisticsStaff/StaffDelivery.jsx";
import StaffDeliveryAccept from "./Views/Page/LogisticsStaff/StaffDeliveryAccept.jsx";
import DeliveryTransactionReport from "./Views/Page/LogisticsStaff/DeliveryTransactionReport.jsx";

import ResetPassword from "./Views/Page/Auth/ResetPassword.jsx";

function App() {
  const { user, token, loading } = useStateContext();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/" element={<Auth />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* PROTECTED ROUTES */}
        {token ? (
          <Route path="/" element={<Default />}>
            {/* ADMIN */}
            {user?.role === "admin" && (
              <>
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="admin/delivery" element={<AdminDelivery />} />
                <Route path="admin/driver" element={<DriverList />} />
                <Route path="admin/incidents" element={<IncidentReports />} />
                <Route path="admin/history" element={<AdminHistory />} />

                <Route
                  path="/admin/incident-classification-requests"
                  element={<IncidentClassificationRequests />}
                />
                <Route
                  path="admin/registerdriver"
                  element={<RegisterDriver />}
                />

                <Route
                  path="admin/incidentclassification"
                  element={<IncidentClassification />}
                />
              </>
            )}

            {/* DRIVER */}
            {user?.role === "driver" && (
              <>
                <Route path="driver/dashboard" element={<DriverDashboard />} />
                <Route path="driver/delivery" element={<DriverDelivery />} />
                <Route path="driver/archive" element={<DriverArchive />} />
                <Route path="driver/profile" element={<DriverProfile />} />

                <Route
                  path="/driver/delivery-transaction-report"
                  element={<DriverTransactionReport />}
                />
                <Route path="/driver/incident-reports" element={<IncidentReports />} />
                <Route
                  path="driver/driverdeliveries"
                  element={<DriverDeliveries />}
                />
                <Route
                  path="driver/change-password"
                  element={<ChangePassword />}
                />
              </>
            )}

            {/* STAFF */}
            {user?.role === "staff" && (
              <>
                <Route path="staff/dashboard" element={<LogisticDashboard />} />
                <Route path="staff/delivery" element={<StaffDelivery />} />
                <Route
                  path="staff/acceptdelivery"
                  element={<StaffDeliveryAccept />}
                />
                <Route
                  path="staff/delivery-transaction-report"
                  element={<DeliveryTransactionReport />}
                />
              </>
            )}

            {/* SUPERADMIN */}
            {user?.role === "superadmin" && (
              <>
                <Route
                  path="superadmin/dashboard"
                  element={<DriverDashboard />}
                />
                <Route path="superadmin/files" element={<DriverDashboard />} />
              </>
            )}
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}

        {/* 404 */}
        {token && <Route path="*" element={<NotFound />} />}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
