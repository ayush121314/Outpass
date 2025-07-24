import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "react-modal";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import the autoTable
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';  // Import Lintk for navigation

Modal.setAppElement("#root");

function VisitorDashboard() {
  const { fetcVisitordata } = useAuth();
  const navigate = useNavigate();
  const { visitoruser, visitorlogout } = useAuth();
  const [outpassRequests, setOutpassRequests] = useState([]);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedOutpass, setSelectedOutpass] = useState(null);
  const [profileView, setProfileView] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  let user = visitoruser;

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


  useEffect(() => {
    const fetchOutpassHistory = async () => {
      try {
        const token = localStorage.getItem("token-visitor");
        const response = await fetch(`${apiUrl}/api/visitor/outpass-history`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) { 
          throw new Error("Failed to fetch Entrypass history");
        }
        const data = await response.json();
        setOutpassRequests(data.visitorOutpasses);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOutpassHistory();
  }, [apiUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(fromTime) >= new Date(toTime)) {
      setError("From time must be earlier than To time.");
      return;
    }

    const hasOverlap = outpassRequests.some((outpass) => {
      const outpassFromTime = new Date(outpass?.fromTime);
      const outpassToTime = new Date(outpass?.toTime);
      const newFromTime = new Date(fromTime);
      const newToTime = new Date(toTime);

      return (
        (newFromTime >= outpassFromTime && newFromTime < outpassToTime) ||
        (newToTime > outpassFromTime && newToTime <= outpassToTime) ||
        (newFromTime <= outpassFromTime && newToTime >= outpassToTime)
      );
    });

    if (hasOverlap) {
      setError("You already have an Entrypass during this time period.");
      return;
    }

    try {
      const token = localStorage.getItem("token-visitor");
      const response = await fetch(`${apiUrl}/api/visitor/request-outpass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fromTime, toTime, reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to request Entrypass");
      }

      const data = await response.json();
      console.log("hello",data.visitorOutpass);
      setOutpassRequests([...outpassRequests, data.visitorOutpass]);
      setSuccessMessage("Entrypass request submitted successfully!");
      setFromTime("");
      setToTime("");
      setReason("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to request Entrypass. Please try again.");
    }
  };

  const generatePDF = (outpass) => {
    if (!user) return;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 255);
    doc.text("Visitor Outpass Details", 20, 20);
    doc.setLineWidth(0.75);
    doc.setDrawColor(0, 0, 255);
    doc.line(20, 22, 190, 22);
    doc.setDrawColor(0, 0, 255);
    doc.setLineWidth(0.5);
    doc.rect(15, 25, 180, 160);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 255);
    doc.text("Visitor Information", 20, 35);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const visitorInfo = [
      `Name: ${user.visitorName}`,
      `Contact: ${user.visitorContact}`,
      `Email: ${user.visitoremail}`,
    ];
    visitorInfo.forEach((line, index) => {
      doc.text(line, 20, 45 + index * 10);
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 255);
    doc.text("Entrypass Details", 20, 85);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const outpassDetails = [
      `From: ${new Date(outpass?.fromTime).toLocaleString()}`,
      `To: ${new Date(outpass?.toTime).toLocaleString()}`,
      `Reason: ${outpass?.reason}`,
      `Status: ${outpass?.status}`,
    ];
    outpassDetails.forEach((line, index) => {
      doc.text(line, 20, 95 + index * 10);
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 150);

    const formattedDate = new Date(outpass?.fromTime)
      .toISOString()
      .replace(/[-T:\.Z]/g, "");
    doc.save(`${user.visitorName}-outpass-${formattedDate}.pdf`);
  };

  const approvedOutpasses = outpassRequests.filter(
    (outpass) => outpass?.status === "approved"
  );
  const pendingOutpasses = outpassRequests.filter(
    (outpass) => outpass?.status === "pending"
  );
  const pastOutpasses = outpassRequests.filter(
    (outpass) => new Date(outpass?.toTime) < new Date()
  );

  const renderOutpassList = () => {
    let outpasses = [];
    let label = "";

    switch (activeTab) {
      case "approved":
        outpasses = approvedOutpasses;
        label = "Approved Entrypass";
        break;
      case "pending":
        outpasses = pendingOutpasses;
        label = "Pending Entrypass";
        break;
      case "past":
        outpasses = pastOutpasses;
        label = "Past Entrypass";
        break;
      default:
        break;
    }

    return (
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">{label}</h3>
        <div className="overflow-y-auto max-h-72">
          {outpasses.length > 0 ? (
            <ul className="space-y-4">
              {outpasses.map((outpass) => (
                <li
                  key={outpass?._id}
                  className="p-4 border border-gray-300 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <p className="text-lg font-medium">
                    <strong>From:</strong>{" "}
                    {new Date(outpass?.fromTime).toLocaleString()}
                  </p>
                  <p className="text-lg font-medium">
                    <strong>To:</strong>{" "}
                    {new Date(outpass?.toTime).toLocaleString()}
                  </p>
                  <p className="text-lg font-medium">
                    <strong>Reason:</strong> {outpass?.reason}
                  </p>
                  <p className="text-lg font-medium flex items-center">
                    <span className="mr-2 font-bold">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        outpass.status === "approved"
                          ? "bg-green-200 text-green-800"
                          : outpass.status === "pending"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {outpass?.status}
                    </span>
                  </p>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setSelectedOutpass(outpass)}
                      className="text-lg text-blue-600 hover:text-blue-800 font-semibold mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => generatePDF(outpass)}
                      className="text-lg text-green-600 hover:text-green-800 font-semibold"
                    >
                      Download PDF
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No Entrypass available.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
        Visitor Dashboard
      </h1>
  
      {/* Profile and Logout Section */}
      <div className="flex flex-col sm:flex-row justify-end items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          className="bg-blue-00 hover:bg-blue-600 bg-blue-500 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out w-full sm:w-auto"
          onClick={() => setProfileView(!profileView)}
        >
          {profileView ? "Hide Profile" : "Show Profile"}
        </button>
        <Link to="/">
        <button className="bg-indigo-400 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          Back to Home
        </button>
      </Link>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out w-full sm:w-auto"
          onClick={() => visitorlogout()}
        >
          Logout
        </button>
      </div>
  
      {/* Profile Section */}
      {profileView && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md transition-transform transform-gpu hover:scale-105">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Profile</h2>
          <div className="space-y-2">
            <p className="text-lg">
              <strong>Name:</strong> {visitoruser?.visitorName}
            </p>
            <p className="text-lg">
              <strong>Email:</strong> {user?.visitoremail}
            </p>
            <p className="text-lg">
              <strong>Contact:</strong> {user?.visitorContact}
            </p>
          </div>
        </div>
      )}
  
      {/* Main container for side-by-side display */}
      <div className="flex flex-col lg:flex-row justify-between gap-8">
        {/* Request Outpass Form */}
        <div className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-md transition-transform transform-gpu hover:scale-105">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Request Entrypass
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label htmlFor="fromTime" className="font-medium text-gray-700 mb-1">
                From Time
              </label>
              <input
                type="datetime-local"
                id="fromTime"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="toTime" className="font-medium text-gray-700 mb-1">
                To Time
              </label>
              <input
                type="datetime-local"
                id="toTime"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="reason" className="font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  if (e.target.value.length <= 30) {
                    // Limit to 50 characters
                    setReason(e.target.value);
                  }
                }}
                className="w-full p-3 text-xl border border-gray-300 rounded mt-2"
                rows="1"
                required
              ></textarea>
              <span className="text-sm text-gray-600">
                {30 - reason.length} characters remaining
              </span>
            </div>
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}
            {successMessage && (
              <p className="text-green-500 text-sm font-medium">
                {successMessage}
              </p>
            )}
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out w-full"
            >
              Submit Request
            </button>
          </form>
        </div>
  
        {/* Outpass Tabs and List */}
        <div className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-md transition-transform transform-gpu hover:scale-105">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Entrypass Status</h2>
          <div className="flex mb-6 gap-5">
            <button
              className={`py-2 px-4 w-1/3 text-center rounded-lg transition-colors duration-200 ${
                activeTab === "pending" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </button>
            <button
              className={`py-2 px-4 w-1/3 text-center rounded-lg transition-colors duration-200 ${
                activeTab === "approved" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("approved")}
            >
              Approved
            </button>
            <button
              className={`py-2 px-4 w-1/3 text-center rounded-lg transition-colors duration-200 ${
                activeTab === "past" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("past")}
            >
              Past
            </button>
          </div>
          {renderOutpassList()}
        </div>
      </div>
      {selectedOutpass && (
        <Modal
          isOpen={!!selectedOutpass}
          onRequestClose={() => setSelectedOutpass(null)}
          className="bg-white p-10 rounded-lg shadow-2xl max-w-xl mx-auto mt-20"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Outpass Details
          </h2>
          <p className="text-lg mb-4">
            <strong>Name:</strong> {user.visitorName}
          </p>
          <p className="text-lg mb-4">
            <strong>Contact:</strong> {user.visitorContact}
          </p>
          <p className="text-lg mb-4">
            <strong>Email:</strong> {user.visitoremail}
          </p>
          <p className="text-lg mb-4">
            <strong>From:</strong>{" "}
            {new Date(selectedOutpass.fromTime).toLocaleString()}
          </p>
          <p className="text-lg mb-4">
            <strong>To:</strong>{" "}
            {new Date(selectedOutpass.toTime).toLocaleString()}
          </p>
          <p className="text-lg mb-4">
            <strong>Reason:</strong> {selectedOutpass.reason}
          </p>
          <p className="text-lg mb-4">
            <strong>Status:</strong>
            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold uppercase ${
                selectedOutpass.status === "approved"
                  ? "bg-green-200 text-green-800"
                  : selectedOutpass.status === "pending"
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {selectedOutpass.status}
            </span>
          </p>
  
          <button
            onClick={() => setSelectedOutpass(null)}
            className="bg-red-600 text-white p-3 text-xl rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105 w-full"
          >
            Close
          </button>
        </Modal>
      )}
    </div>
  );
  
  
}

export default VisitorDashboard;
