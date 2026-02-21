import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function VisitorLogin() {
  const [section, setSection] = useState('login'); // 'login' | 'register' | 'forgot-password'
  const [visitorName, setVisitorName] = useState('');
  const [visitorContact, setVisitorContact] = useState('');
  const [visitoremail, setVisitorEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1 = email/OTP, 2 = verify/new password
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const otpTimerRef = useRef(null);

  const { loginvisitor, fetcVisitordata } = useAuth();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    const token = localStorage.getItem('token-visitor');
    const fetchvisitordata = async () => {
      if (!token) return;
      try {
        await fetcVisitordata(token);
        navigate('/visitor/dashboard');
      } catch (error) {
        console.error(error);
        localStorage.removeItem('token-visitor');
      }
    };
    fetchvisitordata();

    return () => {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    };
  }, [fetcVisitordata, navigate]);

  const startOtpCooldown = (seconds = 60) => {
    setOtpCooldown(seconds);
    if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    otpTimerRef.current = setInterval(() => {
      setOtpCooldown((s) => {
        if (s <= 1) {
          clearInterval(otpTimerRef.current);
          otpTimerRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleSectionToggle = (sectionName) => {
    setSection(sectionName);
    setError('');
    setSuccessMsg('');
    setOtpSent(false);
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setResetStep(1);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const visitorCheckResponse = await fetch(`${apiUrl}/api/visitor/check-existence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitoremail }),
      });
      const visitorCheckData = await visitorCheckResponse.json();
      if (visitorCheckData.exists) {
        setError('Visitor already exists. Please login.');
        setLoading(false);
        return;
      }

      const otpResponse = await fetch(`${apiUrl}/api/visitor/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitoremail }),
      });

      if (!otpResponse.ok) throw new Error('Failed to send OTP');
      setOtpSent(true);
      setSuccessMsg('OTP sent to your email. Enter it below to complete registration.');
      startOtpCooldown(60);
    } catch (err) {
      console.error(err);
      setError('Error sending OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0) {
      setError(`Please wait ${otpCooldown}s before resending OTP.`);
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const otpResponse = await fetch(`${apiUrl}/api/visitor/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitoremail }),
      });
      if (!otpResponse.ok) throw new Error('Resend failed');
      setSuccessMsg('OTP resent. Check your email.');
      startOtpCooldown(60);
    } catch (err) {
      console.error(err);
      setError('Error resending OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${apiUrl}/api/visitor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorName, visitoremail, otp, password, visitorContact }),
      });
      if (!response.ok) throw new Error('Invalid OTP or registration error');
      const data = await response.json();
      localStorage.setItem('token-visitor', data.token);
      loginvisitor(data.visitor);
      navigate('/visitor/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid OTP or registration error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${apiUrl}/api/visitor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitoremail, password }),
      });
      if (!response.ok) throw new Error('Invalid email or password');
      const data = await response.json();
      localStorage.setItem('token-visitor', data.token);
      loginvisitor(data.visitor);
      navigate('/visitor/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (!visitoremail) {
      setError("Please provide your registered visitor email.");
      setLoading(false);
      return;
    }

    try {
      const otpResponse = await fetch(`${apiUrl}/api/visitor/forgot-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitoremail }),
      });

      if (!otpResponse.ok) {
        const errJson = await otpResponse.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to send reset OTP");
      }

      setResetStep(2);
      setSuccessMsg("Password reset OTP sent to your email.");
      startOtpCooldown(60);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to send OTP right now. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp.trim()) {
      setError("Enter the OTP sent to your email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/visitor/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitoremail: visitoremail.trim(),
          otp: otp.trim(),
          newPassword: password,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Password reset failed");
      }

      setSuccessMsg("Password reset successfully! You can now login.");
      setTimeout(() => {
        handleSectionToggle("login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Password reset failed. Check OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-6">
      <div className="relative z-10 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden bg-white/60 backdrop-blur-lg border border-white/30 flex flex-col md:flex-row">
        {/* Left panel - form */}
        <main className="md:w-1/2 p-8 md:p-12">
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-600 to-purple-700">
              Visitor Access
            </h1>
            <p className="mt-2 text-sm text-gray-700/90">
              Register or login to access college facilities securely.
            </p>
          </header>

          {/* toggles */}
          <div className="flex gap-2 bg-white/50 p-1 rounded-xl w-fit mb-6">
            <button
              aria-pressed={section === "login"}
              onClick={() => handleSectionToggle("login")}
              className={`px-4 py-2 rounded-lg font-medium transition ${section === "login"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow"
                : "text-gray-600 hover:bg-white/60"
                }`}
            >
              Login
            </button>
            <button
              aria-pressed={section === "register"}
              onClick={() => handleSectionToggle("register")}
              className={`px-4 py-2 rounded-lg font-medium transition ${section === "register"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow"
                : "text-gray-600 hover:bg-white/60"
                }`}
            >
              Register
            </button>
          </div>

          {/* messages */}
          <div className="min-h-[40px] mb-4">
            {error && <div className="text-sm text-red-600 bg-red-50 py-2 px-3 rounded">{error}</div>}
            {!error && successMsg && <div className="text-sm text-green-700 bg-green-50 py-2 px-3 rounded">{successMsg}</div>}
          </div>

          {/* forms */}
          {section === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Visitor Email"
                value={visitoremail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white w-full p-2 rounded-lg shadow hover:scale-[1.01] transition disabled:opacity-60"
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => handleSectionToggle("forgot-password")}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : section === "register" ? (
            !otpSent ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={visitorContact}
                  onChange={(e) => setVisitorContact(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={visitoremail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white w-full p-2 rounded-lg shadow hover:scale-[1.01] transition disabled:opacity-60"
                >
                  Send OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.01] transition disabled:opacity-60"
                  >
                    Verify OTP
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpCooldown > 0 || loading}
                    className={`flex-1 px-4 py-2 rounded-lg ${otpCooldown > 0
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )
          ) : (
            // Forgot Password section
            resetStep === 1 ? (
              <form onSubmit={handleForgotPasswordEmailSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your registered visitor email"
                  value={visitoremail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.01] transition disabled:opacity-60"
                >
                  {loading ? 'Loading...' : 'Send Reset OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  required
                />
                <input
                  type="password"
                  placeholder="Create new password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.01] transition disabled:opacity-60"
                >
                  {loading ? 'Loading...' : 'Reset Password'}
                </button>
              </form>
            )
          )}

          <footer className="mt-6 text-center text-sm text-gray-600">
            <Link to="/" className="text-indigo-600 hover:underline">Back to Home</Link>
          </footer>
        </main>

        {/* Right panel - Illustration */}
        {/* Right panel - Illustration */}
        <aside className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-gradient-to-tr from-indigo-50 to-purple-50 relative">
          <svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md">
            <defs>
              <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#667eea", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: "#764ba2", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#f093fb", stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: "rgba(255,255,255,0)" }} />
                <stop offset="50%" style={{ stopColor: "rgba(255,255,255,0.6)" }} />
                <stop offset="100%" style={{ stopColor: "rgba(255,255,255,0)" }} />
                <animate attributeName="x1" values="-100%;200%" dur="3s" repeatCount="indefinite" />
                <animate attributeName="x2" values="0%;300%" dur="3s" repeatCount="indefinite" />
              </linearGradient>
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
                <feBlend in="SourceGraphic" in2="glow" mode="normal" />
              </filter>
              <radialGradient id="orbGlow">
                <stop offset="0%" style={{ stopColor: "#a78bfa", stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: "#a78bfa", stopOpacity: 0 }} />
              </radialGradient>
            </defs>

            <style>{`
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
      @keyframes floatSlow { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-15px)} }
      @keyframes rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes pulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
      @keyframes orbitLeft { 0%{transform:rotate(0deg) translateX(100px) rotate(0)} 100%{transform:rotate(360deg) translateX(100px) rotate(-360deg)} }
      @keyframes orbitRight { 0%{transform:rotate(0deg) translateX(120px) rotate(0)} 100%{transform:rotate(-360deg) translateX(120px) rotate(360deg)} }
      .card { animation: floatSlow 6s ease-in-out infinite; }
      .float { animation: float 4s ease-in-out infinite; }
      .float-slow { animation: floatSlow 8s ease-in-out infinite; }
      .pulse { animation: pulse 3s ease-in-out infinite; }
      .orbit-left { animation: orbitLeft 15s linear infinite; }
      .orbit-right { animation: orbitRight 20s linear infinite; }
    `}</style>

            <circle cx="300" cy="250" r="200" fill="url(#orbGlow)" className="pulse" opacity="0.3" />
            <g className="orbit-left" transformOrigin="300 250">
              <circle cx="0" cy="0" r="8" fill="#c4b5fd" opacity="0.6" filter="url(#softGlow)" />
            </g>
            <g className="orbit-right" transformOrigin="300 250">
              <circle cx="0" cy="0" r="6" fill="#fbbf24" opacity="0.5" filter="url(#softGlow)" />
            </g>

            <g className="card">
              <ellipse cx="300" cy="340" rx="140" ry="12" fill="#000" opacity="0.1" />
              <rect x="160" y="180" width="280" height="160" rx="20" fill="url(#cardGradient)" filter="url(#softGlow)" />
              <rect x="160" y="180" width="280" height="80" rx="20" fill="rgba(255,255,255,0.1)" />
              <rect x="160" y="180" width="280" height="160" rx="20" fill="url(#shimmer)" opacity="0.3" />
              <text x="300" y="220" textAnchor="middle" fill="white" fontSize="26" fontWeight="700" fontFamily="system-ui">VISITOR OUTPASS</text>
              <text x="300" y="245" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="12" fontWeight="500" letterSpacing="2">AUTHORIZED ACCESS</text>

              <g opacity="0.8">
                <rect x="190" y="265" width="80" height="8" rx="4" fill="rgba(255,255,255,0.4)" />
                <rect x="190" y="280" width="120" height="8" rx="4" fill="rgba(255,255,255,0.4)" />
                <rect x="190" y="295" width="60" height="8" rx="4" fill="rgba(255,255,255,0.4)" />
              </g>

              <g transform="translate(340, 260)">
                <rect width="50" height="50" rx="8" fill="white" opacity="0.95" />
                <rect x="6" y="6" width="12" height="12" rx="2" fill="#667eea" />
                <rect x="22" y="6" width="6" height="12" rx="1" fill="#667eea" />
                <rect x="32" y="6" width="12" height="12" rx="2" fill="#667eea" />
                <rect x="6" y="22" width="6" height="12" rx="1" fill="#667eea" />
                <rect x="16" y="22" width="18" height="6" rx="1" fill="#667eea" />
                <rect x="6" y="32" width="12" height="12" rx="2" fill="#667eea" />
                <rect x="22" y="32" width="10" height="12" rx="1" fill="#667eea" />
                <rect x="36" y="32" width="8" height="12" rx="1" fill="#667eea" />
              </g>

              <circle cx="425" cy="195" r="4" fill="white" opacity="0.6" />
            </g>
          </svg>
        </aside>


      </div>

      <style>{`
        @keyframes bob {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

export default VisitorLogin;
