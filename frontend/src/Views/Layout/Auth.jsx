
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../../context/AuthProvider";
import Logo from "../../assets/images/qwerty.png";

const Auth = () => {
  const { token, user } = useStateContext();

  // Redirect authenticated users according to their role
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

          {/* DESKTOP LOGO */}
          <div className="flex items-center">
            <img
              src={Logo}
              alt="LogiTrace Logo"
              className="h-28 w-auto object-contain object-left"
            />
          </div>

          {/* BRAND CONTENT */}
          <div className="w-full max-w-xl">
            <h1 className="max-w-[440px] text-[44px] font-bold leading-[1.1] tracking-tight text-[#17243d] xl:text-[48px]">
              <span className="block">Every</span>
              <span className="block">shipment</span>
              <span className="block">leaves a trail.</span>
            </h1>

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

                {/* ACTIVE BLUE LINE */}
                <div className="absolute left-2 top-2 h-[2px] w-[38%] bg-blue-600" />

                {/* CHECKPOINT DOTS */}
                <div className="relative flex items-center justify-between">
                  <span className="h-[18px] w-[18px] rounded-full border-2 border-white bg-blue-600 shadow-[0_0_0_1px_#2563eb]" />

                  <span className="h-[18px] w-[18px] rounded-full border-2 border-white bg-blue-600 shadow-[0_0_0_1px_#2563eb]" />

                  <span className="h-5 w-5 rounded-full border-[3px] border-blue-100 bg-blue-600 shadow-[0_0_0_1px_#2563eb]" />

                  <span className="h-[18px] w-[18px] rounded-full border-2 border-[#d7e0eb] bg-white" />

                  <span className="h-[18px] w-[18px] rounded-full border-2 border-[#d7e0eb] bg-white" />

                  <span className="h-[18px] w-[18px] rounded-full border-2 border-[#d7e0eb] bg-white" />
                </div>

                {/* CHECKPOINT LABELS */}
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

          {/* DESKTOP FOOTER */}
          <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#7890b0]">
            Delivery Tracking &amp; Incident Reporting
          </div>
        </section>

        {/* RIGHT SIDE - LOGIN */}
        <section className="flex min-h-screen w-full flex-1 flex-col items-center justify-center bg-[#f2f6fc] px-6 py-8 sm:px-10 landscape:py-4 lg:min-h-screen lg:w-[47%] lg:px-12 lg:py-10 xl:px-16">

          {/* MOBILE AND TABLET LOGO */}
          <div className="mb-8 flex w-full max-w-[448px] justify-center lg:hidden landscape:mb-3">
            <img
              src={Logo}
              alt="LogiTrace Logo"
              className="h-24 w-auto max-w-full object-contain sm:h-28 landscape:h-16"
            />
          </div>

          {/* LOGIN CONTENT */}
          <div className="w-full max-w-[448px] landscape:max-w-[430px]">
            <Outlet />
          </div>

          {/* MOBILE AND TABLET FOOTER */}
          <div className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[#7890b0] lg:hidden landscape:mt-3">
            Delivery Tracking &amp; Incident Reporting
          </div>
        </section>
      </div>
    </div>
  );
};

export default Auth;
