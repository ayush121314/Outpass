import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "react-modal";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import the autoTable
Modal.setAppElement("#root");

function StudentDashboard() {
  const { user, logout } = useAuth();
  const [outpassRequests, setOutpassRequests] = useState([]);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedOutpass, setSelectedOutpass] = useState(null);
  const [profileView, setProfileView] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchOutpassHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiUrl}/api/student/outpass-history`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch outpass history");
        }
        const data = await response.json();
        setOutpassRequests(data.outpasses);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOutpassHistory();
  }, [apiUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the 'From Time' and 'To Time'
    if (new Date(fromTime) >= new Date(toTime)) {
      setError("From time must be earlier than To time.");
      return;
    }

    // Check for overlapping outpasses
    const hasOverlap = outpassRequests.some((outpass) => {
      const outpassFromTime = new Date(outpass.fromTime);
      const outpassToTime = new Date(outpass.toTime);
      const newFromTime = new Date(fromTime);
      const newToTime = new Date(toTime);

      return (
        (newFromTime >= outpassFromTime && newFromTime < outpassToTime) ||
        (newToTime > outpassFromTime && newToTime <= outpassToTime) ||
        (newFromTime <= outpassFromTime && newToTime >= outpassToTime)
      );
    });

    if (hasOverlap) {
      setError("You already have an outpass during this time period.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/student/request-outpass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fromTime, toTime, reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to request outpass");
      }

      const data = await response.json();

      // Update the outpassRequests state with the new outpass
      setOutpassRequests([...outpassRequests, data.outpass]);

      // Clear the form and show success message
      setSuccessMessage("Outpass request submitted successfully!");
      setFromTime("");
      setToTime("");
      setError("");
      setReason("");
    } catch (err) {
      console.error(err);
      setError("Failed to request outpass. Please try again.");
    }
  };

  const generatePDF = (outpass) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 255); // Blue color for title
    doc.text("Outpass Details", 20, 20);

    // Add a line separator
    doc.setLineWidth(0.75);
    doc.setDrawColor(0, 0, 255); // Blue color for separator
    doc.line(20, 22, 190, 22);

    // Big Box Border
    doc.setDrawColor(0, 0, 255); // Blue color for box border
    doc.setLineWidth(0.5);
    doc.rect(15, 25, 180, 160); // Adjusted height for better fit

    // User Details Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 255); // Blue color for section heading
    doc.text("Student Information", 20, 35);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Black color for text
    const userInfo = [
      `Name: ${user.name}`,
      `Rollno: ${user.Rollno}`,
      `Email: ${user.email}`,
    ];
    userInfo.forEach((line, index) => {
      doc.text(line, 20, 45 + index * 10);
    });

    // Outpass Details Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 255); // Blue color for section heading
    doc.text("Outpass Details", 20, 85);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Black color for text
    const outpassDetails = [
      `From: ${new Date(outpass.fromTime).toLocaleString()}`,
      `To: ${new Date(outpass.toTime).toLocaleString()}`,
      `Reason: ${outpass.reason}`,
      `Status: ${outpass.status}`,
    ];
    outpassDetails.forEach((line, index) => {
      doc.text(line, 20, 95 + index * 10);
    });

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100); // Gray color for footer
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 150);

    // Save the PDF
    const formattedDate = new Date(outpass.fromTime)
      .toISOString()
      .replace(/[-T:\.Z]/g, "");
    doc.save(`${user.Rollno}-outpass-${formattedDate}.pdf`);
  };

  const approvedOutpasses = outpassRequests.filter(
    (outpass) => outpass.status === "approved"
  );
  const pendingOutpasses = outpassRequests.filter(
    (outpass) => outpass.status === "pending"
  );
  const pastOutpasses = outpassRequests.filter(
    (outpass) => new Date(outpass.toTime) < new Date()
  );

  const renderOutpassList = () => {
    let outpasses = [];
    let label = "";

    switch (activeTab) {
      case "approved":
        outpasses = approvedOutpasses;
        label = "Approved Outpasses";
        break;
      case "pending":
        outpasses = pendingOutpasses;
        label = "Pending Outpasses";
        break;
      case "past":
        outpasses = pastOutpasses;
        label = "Past Outpasses";
        break;
      default:
        break;
    }

    return (
      <div>
        <h3 className="text-2xl mb-6 font-semibold text-gray-800">{label}</h3>
        <div className="h-72 overflow-y-auto">
          {outpasses.length > 0 ? (
            <ul>
              {outpasses.map((outpass) => (
                <li
                  key={outpass.id}
                  className="mb-6 p-6 border-2 border-gray-300 rounded-lg shadow-xl bg-gray-100 hover:bg-gray-200 transition duration-200"
                >
                  <p className="text-xl">
                    <strong>From:</strong>{" "}
                    {new Date(outpass.fromTime).toLocaleString()}
                  </p>
                  <p className="text-xl">
                    <strong>To:</strong>{" "}
                    {new Date(outpass.toTime).toLocaleString()}
                  </p>
                  <p className="text-xl">
                    <strong>Reason:</strong> {outpass.reason}
                  </p>
                  <p className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2 font-bold text-gray-800">
                      Status:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${
                        outpass.status === "approved"
                          ? "bg-green-200 text-green-800"
                          : outpass.status === "pending"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {outpass.status}
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
            <p className="text-lg text-gray-600">No {label.toLowerCase()}.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-10 max-w-screen-xl mx-auto">
      <div className="flex gap-10 justify-between">
        <h1 className="text-4xl text-center w-full bg-blue-900 text-white py-5 mb-10 rounded-lg">
          Welcome, {user?.name}
        </h1>
        <div className="relative">
          <button
            onClick={() => setProfileView(!profileView)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-300 ease-in-out"
          >
            Profile
          </button>
          {profileView && (
            <div className="absolute top-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 mt-2 z-10">
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-300 ease-in-out w-full text-center"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col justify-between">
          <h2 className="text-3xl mb-6 font-semibold text-blue-900">
            Request Outpass
          </h2>
          <form onSubmit={handleSubmit}>
            <label className="block mb-4">
              <span className="text-xl">From Time:</span>
              <input
                type="datetime-local"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="w-full p-3 text-xl border border-gray-300 rounded mt-2"
                required
              />
              <div></div>
            </label>
            <label className="block mb-4">
              <span className="text-xl">To Time:</span>
              <input
                type="datetime-local"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="w-full p-3 text-xl border border-gray-300 rounded mt-2"
                required
              />
            </label>
            <label className="block mb-4">
              <span className="text-xl">Reason:</span>
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
            </label>

            {error && <p className="text-red-600 text-xl mb-4">{error}</p>}
            {successMessage && (
              <p className="text-green-600 text-xl mb-4">{successMessage}</p>
            )}
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-300 ease-in-out"
            >
              Submit
            </button>
          </form>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="flex justify-between mb-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`text-xl font-semibold px-4 py-2 rounded-lg ${
                activeTab === "pending"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`text-xl font-semibold px-4 py-2 rounded-lg ${
                activeTab === "approved"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`text-xl font-semibold px-4 py-2 rounded-lg ${
                activeTab === "past" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
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
          <h2 className="text-3xl mb-6 font-semibold text-blue-900">
            Outpass Details
          </h2>
          <p className="text-xl mb-4">
            <strong>Name:</strong> {user.name}
          </p>
          <p className="text-xl mb-4">
            <strong>Rollno:</strong> {user.Rollno}
          </p>
          <p className="text-xl mb-4">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-xl mb-4">
            <strong>From:</strong>{" "}
            {new Date(selectedOutpass.fromTime).toLocaleString()}
          </p>
          <p className="text-xl mb-4">
            <strong>To:</strong>{" "}
            {new Date(selectedOutpass.toTime).toLocaleString()}
          </p>
          <p className="text-xl mb-4">
            <strong>Reason:</strong> {selectedOutpass.reason}
          </p>
          <p className="text-xl mb-4">
            <strong>Status:</strong>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${
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
            className="bg-red-600 text-white p-3 text-xl rounded hover:bg-red-700 transition w-full"
          >
            Close
          </button>
        </Modal>
      )}
    </div>
  );
}

export default StudentDashboard;
