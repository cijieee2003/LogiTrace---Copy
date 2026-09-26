import React from "react";
import { ScaleLoader } from "react-spinners";
import Logo from "../../assets/images/qwerty.png";

const LoadingScreen = ({
  message = "LogiTrace is loading...",
}) => {
  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-gray-100">

      {/* Background Animated Gradient Blobs */}
      <div className="absolute left-[-150px] top-[-150px] h-[500px] w-[500px] rounded-full bg-blue-500 opacity-25 blur-[140px] animate-pulse" />

      <div className="absolute bottom-[-150px] right-[-150px] h-[450px] w-[450px] rounded-full bg-green-400 opacity-20 blur-[140px] animate-pulse" />

      <div className="absolute bottom-[20%] left-[50%] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-purple-400 opacity-15 blur-[160px] animate-pulse" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-5">

        {/* Smaller Logo */}
        <div className="flex h-75 w-75 items-center justify-center">
          <img
            src={Logo}
            alt="LogiTrace"
            className="h-full w-full rounded-full object-contain shadow-xl shadow-blue-500/30 animate-glow"
          />
        </div>

        {/* Loader */}
        <div className="flex justify-center">
          <ScaleLoader
            color="#3F83F8"
            height={30}
            width={4}
            margin={3}
          />
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800 animate-fadeIn">
            {message}
          </p>

          <p className="mt-1 text-sm text-gray-600 animate-fadeIn">
            Please wait while we prepare everything for you...
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoadingScreen;


// import React from "react";
// import Logo from "../../assets/images/qqqq.png";

// const LoadingScreen = ({
//   message = "LogiTrace is loading...",
// }) => {
//   return (
//     <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 via-white to-blue-100">

//       {/* ================= BACKGROUND ================= */}

//       {/* Cloud 1 */}
//       <div className="absolute left-[-80px] top-20 h-20 w-40 rounded-full bg-white/70 blur-sm animate-cloud">
//         <div className="absolute left-10 top-[-20px] h-20 w-20 rounded-full bg-white/70" />
//         <div className="absolute left-20 top-[-10px] h-24 w-24 rounded-full bg-white/70" />
//       </div>

//       {/* Cloud 2 */}
//       <div className="absolute right-[-100px] top-40 h-20 w-44 rounded-full bg-white/60 blur-sm animate-cloud-slow">
//         <div className="absolute left-10 top-[-20px] h-20 w-20 rounded-full bg-white/60" />
//         <div className="absolute left-24 top-[-10px] h-24 w-24 rounded-full bg-white/60" />
//       </div>

//       {/* ================= LOGO ================= */}

//       <div className="relative z-10 flex flex-col items-center px-4 text-center">

//         <img
//           src={Logo}
//           alt="LogiTrace Logo"
//           className="
//             w-36
//             object-contain
//             drop-shadow-lg
//             sm:w-44
//             md:w-52
//             lg:w-60
//             animate-logo
//           "
//         />

//         <h1 className="mt-3 text-2xl font-bold text-blue-700 sm:text-3xl">
//           LogiTrace
//         </h1>

//         <p className="mt-1 text-xs font-medium tracking-[0.25em] text-gray-500 sm:text-sm">
//           MANAGEMENT AND TRACKING SYSTEM
//         </p>

//       </div>

//       {/* ================= LOADING MESSAGE ================= */}

//       <div
//         className="
//           relative
//           z-10
//           mt-8
//           w-[90%]
//           max-w-xl
//           rounded-2xl
//           bg-white
//           p-6
//           text-center
//           shadow-xl
//           sm:p-8
//         "
//       >

//         <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
//           Delivering a better experience...
//         </h2>

//         <p className="mt-2 text-sm text-gray-500">
//           {message}
//         </p>

//         {/* Progress Bar */}
//         <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-gray-200">

//           <div
//             className="
//               h-full
//               w-[70%]
//               rounded-full
//               bg-blue-600
//               animate-progress
//             "
//           />

//         </div>

//         <div className="mt-3 flex justify-center gap-2">

//           <span className="h-2 w-2 rounded-full bg-blue-600 animate-dot-1" />

//           <span className="h-2 w-2 rounded-full bg-blue-400 animate-dot-2" />

//           <span className="h-2 w-2 rounded-full bg-blue-300 animate-dot-3" />

//         </div>

//       </div>

//       {/* ================= ROAD ================= */}

//       <div className="absolute bottom-0 left-0 h-32 w-full bg-gray-800">

//         {/* Road Line */}
//         <div
//           className="
//             absolute
//             left-0
//             top-1/2
//             h-2
//             w-full
//             bg-[repeating-linear-gradient(to_right,white_0px,white_70px,transparent_70px,transparent_140px)]
//             animate-road
//           "
//         />

//       </div>

//       {/* ================= MOVING TRUCK ================= */}

//       <div
//         className="
//           absolute
//           bottom-14
//           left-0
//           z-20
//           animate-truck
//         "
//       >

//         {/* Truck */}
//         <div className="relative flex items-end">

//           {/* Truck Body */}
//           <div className="relative h-20 w-36 rounded-md bg-blue-600 shadow-lg sm:h-24 sm:w-44">

//             {/* Cargo */}
//             <div className="absolute inset-1 rounded bg-white">

//               <div className="flex h-full items-center justify-center">

//                 <img
//                   src={Logo}
//                   alt="LogiTrace"
//                   className="w-20 object-contain sm:w-24"
//                 />

//               </div>

//             </div>

//           </div>

//           {/* Truck Cabin */}
//           <div
//             className="
//               relative
//               h-16
//               w-20
//               rounded-r-xl
//               rounded-t-xl
//               bg-blue-500
//               shadow-lg
//               sm:h-20
//               sm:w-24
//             "
//           >

//             {/* Window */}
//             <div className="absolute right-2 top-2 h-8 w-14 rounded-md bg-blue-950 sm:h-10 sm:w-16" />

//             {/* Headlight */}
//             <div className="absolute bottom-2 right-[-3px] h-3 w-2 rounded-full bg-yellow-300" />

//           </div>

//           {/* Wheels */}
//           <div
//             className="
//               absolute
//               -bottom-4
//               left-8
//               h-10
//               w-10
//               rounded-full
//               border-4
//               border-gray-700
//               bg-gray-900
//               sm:left-10
//               sm:h-12
//               sm:w-12
//               animate-wheel
//             "
//           >
//             <div className="absolute inset-2 rounded-full bg-gray-400" />
//           </div>

//           <div
//             className="
//               absolute
//               -bottom-4
//               right-8
//               h-10
//               w-10
//               rounded-full
//               border-4
//               border-gray-700
//               bg-gray-900
//               sm:right-10
//               sm:h-12
//               sm:w-12
//               animate-wheel
//             "
//           >
//             <div className="absolute inset-2 rounded-full bg-gray-400" />
//           </div>

//         </div>

//         {/* Motion Effect */}
//         <div className="absolute right-full bottom-6 mr-2 flex gap-1">
//           <span className="h-1 w-10 rounded-full bg-blue-400 opacity-70" />
//           <span className="h-1 w-6 rounded-full bg-blue-300 opacity-50" />
//           <span className="h-1 w-3 rounded-full bg-blue-200 opacity-40" />
//         </div>

//       </div>

//       {/* ================= CUSTOM ANIMATIONS ================= */}

//       <style>
//         {`
//           /* Truck moves across screen */
//           @keyframes truck {
//             0% {
//               transform: translateX(-180px);
//             }

//             100% {
//               transform: translateX(calc(100vw + 180px));
//             }
//           }

//           .animate-truck {
//             animation: truck 8s linear infinite;
//           }


//           /* Rotating wheels */
//           @keyframes wheel {
//             from {
//               transform: rotate(0deg);
//             }

//             to {
//               transform: rotate(360deg);
//             }
//           }

//           .animate-wheel {
//             animation: wheel 0.6s linear infinite;
//           }


//           /* Logo subtle floating */
//           @keyframes logo {
//             0%, 100% {
//               transform: translateY(0);
//             }

//             50% {
//               transform: translateY(-6px);
//             }
//           }

//           .animate-logo {
//             animation: logo 2s ease-in-out infinite;
//           }


//           /* Progress */
//           @keyframes progress {
//             0% {
//               width: 0%;
//             }

//             100% {
//               width: 70%;
//             }
//           }

//           .animate-progress {
//             animation: progress 2s ease-in-out infinite alternate;
//           }


//           /* Loading dots */
//           @keyframes dot {
//             0%, 100% {
//               opacity: 0.3;
//               transform: translateY(0);
//             }

//             50% {
//               opacity: 1;
//               transform: translateY(-4px);
//             }
//           }

//           .animate-dot-1 {
//             animation: dot 1s infinite;
//           }

//           .animate-dot-2 {
//             animation: dot 1s infinite 0.2s;
//           }

//           .animate-dot-3 {
//             animation: dot 1s infinite 0.4s;
//           }


//           /* Clouds */
//           @keyframes cloud {
//             from {
//               transform: translateX(0);
//             }

//             to {
//               transform: translateX(120px);
//             }
//           }

//           .animate-cloud {
//             animation: cloud 15s linear infinite alternate;
//           }

//           .animate-cloud-slow {
//             animation: cloud 20s linear infinite alternate-reverse;
//           }


//           /* Road movement */
//           @keyframes road {
//             from {
//               background-position: 0 0;
//             }

//             to {
//               background-position: 140px 0;
//             }
//           }

//           .animate-road {
//             animation: road 0.8s linear infinite;
//           }
//         `}
//       </style>

//     </div>
//   );
// };

// export default LoadingScreen;