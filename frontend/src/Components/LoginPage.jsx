import React from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute w-[400px] h-[400px] bg-blue-300/40 rounded-full blur-3xl top-[-100px] left-[-100px] animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-3xl bottom-[-150px] right-[-150px] animate-[pulse_6s_ease-in-out_infinite]" />
      </div>

      {/* Main content - split layout */}
      <div className="relative z-10 flex w-[90%] max-w-6xl rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.2)] bg-white/60 backdrop-blur-2xl border border-white/30">
        
        {/* LEFT - Login / Access selection */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm tracking-tight animate-[floatIn_1.2s_ease-out]">
              College Outpass Portal
            </h1>

            <p className="mt-3 text-sm md:text-base text-gray-700/80 font-medium tracking-wide animate-[floatFade_2s_ease-in-out]">
              Choose your access type below to continue
            </p>

            <div className="mt-4 mx-auto w-28 h-[2px] bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full animate-[pulseLine_2s_ease-in-out_infinite]" />
          </div>

          {/* Buttons */}
          {[
            {
              label: "Login as Student",
              color: "from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100",
              iconColor: "text-blue-600",
              onClick: () => navigate("/student/dashboard"),
            },
            {
              label: "Login as Admin",
              color: "from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100",
              iconColor: "text-purple-600",
              onClick: () => navigate("/admin"),
            },
            {
              label: "Login as Visitor",
              color: "from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100",
              iconColor: "text-green-600",
              onClick: () => navigate("/visitor"),
            },
          ].map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.onClick}
              className={`group flex items-center justify-start w-full gap-4 px-6 py-4 mb-5 rounded-2xl border border-gray-200 bg-gradient-to-r ${btn.color} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              <svg
                className={`w-7 h-7 ${btn.iconColor} transition-transform group-hover:rotate-12 group-hover:scale-110 duration-300`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={
                    idx === 0
                      ? "M12 14l9-5-9-5-9 5 9 5z"
                      : idx === 1
                      ? "M12 4v16m8-8H4"
                      : "M5.121 17.804A12.042 12.042 0 0112 15c2.136 0 4.126.56 5.879 1.546M12 12a4 4 0 100-8 4 4 0 000 8z"
                  }
                />
              </svg>
              <span className="text-gray-800 font-semibold text-lg group-hover:translate-x-1 transition-transform duration-300">
                {btn.label}
              </span>
            </button>
          ))}
        </div>

        {/* RIGHT - Illustration */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-tr from-indigo-200 via-blue-100 to-purple-200 relative overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-[90%] max-w-md drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
            viewBox="0 0 600 400"
          >
            <defs>
              <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <path
              d="M100 300 C150 220, 300 250, 400 180 S550 100, 500 50"
              stroke="url(#grad)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              className="animate-[draw_5s_ease-in-out_infinite_alternate]"
            />
            <circle cx="140" cy="290" r="14" fill="url(#grad)" opacity="0.8" />
            <circle cx="480" cy="120" r="10" fill="url(#grad)" opacity="0.6" />
            <rect
              x="220"
              y="200"
              width="160"
              height="90"
              rx="15"
              fill="white"
              opacity="0.9"
              stroke="url(#grad)"
              strokeWidth="3"
            />
            <text
              x="300"
              y="255"
              textAnchor="middle"
              fill="url(#grad)"
              fontSize="20"
              fontWeight="bold"
            >
              Outpass System
            </text>
          </svg>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes floatIn {
          0% { opacity: 0; transform: translateY(-12px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatFade {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes draw {
          0% { stroke-dasharray: 0 600; }
          100% { stroke-dasharray: 600 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseLine {
          0%, 100% { opacity: 0.7; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.1); }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
