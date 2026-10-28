
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../../context/AuthProvider";

const Auth = () => {
  const { token, user } = useStateContext();

  if (token && user) {
    switch (user.role) {
      case "superadmin":
        return <Navigate to="/superadmin/dashboard" replace />;

      case "admin":
        return <Navigate to="/admin/dashboard" replace />;

      case "staff":
        return <Navigate to="/staff/dashboard" replace />;

      case "driver":
        return <Navigate to="/driver/dashboard" replace />;

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f2f6fc]">
      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* LEFT SIDE - DESKTOP ONLY */}
        <section className="hidden lg:flex lg:min-h-screen lg:w-[53%] lg:flex-col lg:justify-between lg:bg-white lg:px-14 lg:py-8 xl:px-16">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            {/* LOGITRACE LOGO */}
            <div className="flex items-center gap-2 text-[22px] font-bold tracking-tight text-[#17243d]">
              <span className="h-[15px] w-[15px] rounded-full bg-blue-600 shadow-[0_0_0_4px_#dbeafe]" />
              <span>LogiTrace</span>
            </div>
          </div>

          {/* BRAND CONTENT */}
          <div className="w-full max-w-xl">

            {/* MAIN TITLE */}
            <h1 className="max-w-[440px] text-[44px] font-bold leading-[1.1] tracking-tight text-[#17243d] xl:text-[48px]">
              <span className="block">Every</span>
              <span className="block">shipment</span>
              <span className="block">leaves a trail.</span>
            </h1>

            {/* DESCRIPTION */}
            <p className="mt-5 max-w-[430px] text-[16px] leading-6 text-[#5d7392]">
              Track deliveries checkpoint by checkpoint, and the
              moment something goes wrong, route it straight to
              the department that owns it.
            </p>

            {/* DELIVERY TRACK */}
            <div className="mt-12 max-w-[470px]">
              <div className="relative">

                {/* BACKGROUND LINE */}
                <div className="absolute left-2 right-2 top-2 h-[2px] bg-[#d7e0eb]" />

                {/* ACTIVE LINE */}
                <div className="absolute left-2 top-2 h-[2px] w-[38%] bg-blue-600" />

                {/* DOTS */}
                <div className="relative flex items-center justify-between">

                  {/* PENDING */}
                  <span className="h-[18px] w-[18px] rounded-full border-2 border-white bg-blue-600 shadow-[0_0_0_1px_#2563eb]" />

                  {/* ARRIVAL */}
                  <span className="h-[18px] w-[18px] rounded-full border-2 border-white bg-blue-600 shadow-[0_0_0_1px_#2563eb]" />

                  {/* QUEUEING */}
                  <span className="h-5 w-5 rounded-full border-[3px] border-blue-100 bg-blue-600 shadow-[0_0_0_1px_#2563eb]" />

                  {/* UNLOADING */}
                  <span className="h-[18px] w-[18px] rounded-full border-2 border-[#d7e0eb] bg-white" />

                  {/* CHECKING */}
                  <span className="h-[18px] w-[18px] rounded-full border-2 border-[#d7e0eb] bg-white" />

                  {/* DELIVERED */}
                  <span className="h-[18px] w-[18px] rounded-full border-2 border-[#d7e0eb] bg-white" />
                </div>

                {/* LABELS */}
                <div className="mt-3 flex text-center font-mono text-[10px] text-[#637895]">
                  <span className="w-1/6">PENDING</span>
                  <span className="w-1/6">ARRIVAL</span>

                  <span className="w-1/6 font-bold text-blue-700">
                    QUEUEING
                  </span>

                  <span className="w-1/6">UNLOADING</span>
                  <span className="w-1/6">CHECKING</span>
                  <span className="w-1/6">DELIVERED</span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#7890b0]">
            Delivery Tracking &amp; Incident Reporting
          </div>
        </section>

        {/* RIGHT SIDE - LOGIN */}
        <section className="flex min-h-screen w-full flex-1 items-center justify-center bg-[#f2f6fc] px-6 py-8 sm:px-10 landscape:py-4 lg:min-h-screen lg:w-[47%] lg:px-12 lg:py-10 xl:px-16">
          <div className="w-full max-w-[448px] landscape:max-w-[430px]">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Auth;
