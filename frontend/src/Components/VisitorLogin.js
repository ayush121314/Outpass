import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
function VisitorLogin() {
  const [section, setSection] = useState('login'); 
  const [visitorName, setVisitorName] = useState(''); // visitorName field
  const [visitorContact, setVisitorContact] = useState(''); // visitorContact field
  const [visitoremail, setVisitorEmail] = useState(''); // visitoremail field
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { loginvisitor } = useAuth();
  const navigate = useNavigate();
  const { fetcVisitordata } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token-visitor');
    const fetchvisitordata = async () => {
      if (!token) {
        navigate('/visitor');
      } else {
        try {
          await fetcVisitordata(token);
          navigate('/visitor/dashboard');
        } catch (error) {
          console.error('Error fetching visitor data:', error);
          navigate('/visitor');
        }
      }
    };
    fetchvisitordata();
  },[]);

  const handleSectionToggle = (sectionName) => {
    setSection(sectionName);
    setError(''); // Clear error when toggling sections
    setOtpSent(false); // Reset OTP state when toggling sections
  };

  const handleVisitorNameChange = (e) => setVisitorName(e.target.value);
  const handleVisitorContactChange = (e) => setVisitorContact(e.target.value);
  const handleVisitorEmailChange = (e) => setVisitorEmail(e.target.value);
  const handleOtpChange = (e) => setOtp(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if the visitor already exists
      const visitorCheckResponse = await fetch(`${apiUrl}/api/visitor/check-existence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitoremail }),
      });

      const visitorCheckData = await visitorCheckResponse.json();

      if (visitorCheckData.exists) {
        setError('Visitor already exists. Please login.');
        return;
      }

      // If the visitor does not exist, proceed to send OTP
      const otpResponse = await fetch(`${apiUrl}/api/visitor/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitoremail }),
      });

      if (!otpResponse.ok) {
        throw new Error('Error sending OTP.');
      }

      setOtpSent(true);
      setError('');
    } catch (err) {
      setError('Error sending OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      const otpResponse = await fetch(`${apiUrl}/api/visitor/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitoremail }),
      });

      if (!otpResponse.ok) {
        throw new Error('Error resending OTP.');
      }

      setError('OTP resent successfully.');
    } catch (err) {
      setError('Error resending OTP. Please try again.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/api/visitor/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitorName, visitoremail, otp, password, visitorContact }),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP or other registration error.');
      }

      const data = await response.json();
      localStorage.setItem('token-visitor', data.token);
      console.log(data.visitor)
      loginvisitor(data.visitor); // Store visitor data
      navigate('/visitor/dashboard');
    } catch (err) {
      setError('Invalid OTP or other registration error. Please try again.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/visitor/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitoremail, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password.');
      }

      const data = await response.json();
      localStorage.setItem('token-visitor', data.token);
      loginvisitor(data.visitor);
      navigate('/visitor/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-100 w-screen h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="mb-4">
          <button
            onClick={() => handleSectionToggle('login')}
            className={`w-1/2 p-2 ${section === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Login
          </button>
          <button
            onClick={() => handleSectionToggle('register')}
            className={`w-1/2 p-2 ${section === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Register
          </button>
        </div>

        {section === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <h1 className="text-2xl mb-4 text-center">Visitor Login</h1>
            <input
              type="email"
              placeholder="Enter your email"
              value={visitoremail}
              onChange={handleVisitorEmailChange}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />
            
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              className="bg-blue-500 text-white w-full p-2 rounded"
            >
              Login
            </button>
          </form>
        ) : (
          !otpSent ? (
            <form onSubmit={handleEmailSubmit}>
              <h1 className="text-2xl mb-4 text-center">Register</h1>
              <input
                type="text"
                placeholder="Enter your name"
                value={visitorName}
                onChange={handleVisitorNameChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                placeholder="Enter your contact number"
                value={visitorContact}
                onChange={handleVisitorContactChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              <input
                type="email"
                placeholder="Enter your email"
                value={visitoremail}
                onChange={handleVisitorEmailChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                className="bg-blue-500 text-white w-full p-2 rounded"
              >
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <h1 className="text-2xl mb-4 text-center">Verify OTP</h1>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={handleOtpChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                className="bg-blue-500 text-white w-full p-2 rounded"
              >
                Verify OTP
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                className="bg-gray-300 text-black w-full p-2 rounded mt-2"
              >
                Resend OTP
              </button>
            </form>
          )
        )}
        <div className="text-center mt-4">
          <Link to="/" className="bg-indigo-500 hover:scale-110 hover:bg-indigo-700 rounded-lg text-white p-2  inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VisitorLogin;
