import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";

export const Studentadmin = () => {
  const [outpassRequests, setOutpassRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("current");
  const [studentOutpasses, setStudentOutpasses] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const { adminlogout } = useAuth();
  const [profileView, setProfileView] = useState(false);

  useEffect(() => {
    const fetchOutpassRequests = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/student/outpass-requests`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setOutpassRequests(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching outpass requests:", error);
        setLoading(false);
      }
    };
    fetchOutpassRequests();
  }, [apiUrl]);

  const fetchStudentOutpasses = async (Rollno) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/student/student-outpasses/${Rollno}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setStudentOutpasses(data);
    } catch (error) {
      console.error("Error fetching student outpasses:", error);
    }
  };

  const handleUpdateStatus = async (_id, status) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/student/outpass-requested/${_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      setOutpassRequests(
        outpassRequests.map((request) =>
          request._id === _id ? { ...request, status } : request
        )
      );
    } catch (error) {
      console.error("Error updating outpass request status:", error);
    }
  };

  const filteredRequests = outpassRequests.filter((request) =>
    request.student.Rollno.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generatePDF = () => {
    const input = document.getElementById("student-history-table");
    const originalWidth = input.style.width; // Store the original width

    // Adjust the table to a laptop screen width
    input.style.width = "1200px"; // Adjust this width as per your desktop/tablet screen

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 190; // Width of the image in mm
      const pageHeight = 295; // Height of the page in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      const margin = 10; // Margin in mm

      // Add the first page with content
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position + margin,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight - 2 * margin;

      // Add additional pages if necessary
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          position + margin,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight - 2 * margin;
      }

      pdf.save(`Student_History--[${new Date().toISOString()}].pdf`);

      // Reset the table width back to original after PDF generation
      input.style.width = originalWidth;
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-gray-100 w-screen min-h-screen ">
      <h1 className="text-3xl font-bold text-center mb-8">
        Student Admin Dashboard
      </h1>
      <div className="relative mb-3  lg:ml-[90%] md:ml-[80%] ml-[40%] h-fit">
        <button
          onClick={() => setProfileView(!profileView)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-300 ease-in-out"
        >
          Profile
        </button>
        {profileView && (
          <div className="w-fit top-12 flex flex-col gap-3 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 mt-2 z-10">
            <button
              onClick={adminlogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-300 ease-in-out w-full text-center"
            >
              Logout
            </button>
            <Link to="/">
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
                Home
              </button>
            </Link>
          </div>
        )}
      </div>
      <div className="mb-6 flex items-center gap-4 justify-around">
        <button
          onClick={() => {
            setViewMode("current");
          }}
          className={`py-2 px-4 rounded ${
            viewMode === "current"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Current Outpass Requests
        </button>
        <button
          onClick={() => setViewMode("past")}
          className={`py-2 px-4 rounded ${
            viewMode === "past"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Student History
        </button>
      </div>

      {viewMode === "current" && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by Roll No"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded py-2 px-4 w-full"
          />
        </div>
      )}

      {viewMode === "past" && (
        <div className="mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStudentOutpasses([]);
              fetchStudentOutpasses(searchQuery);
            }}
          >
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter Roll No to see history"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded py-2 px-4 w-full"
              />
              <button
                type="submit"
                className="border-1 bg-blue-400 text-white text-lg p-2 rounded-lg hover:bg-slate-800"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {viewMode === "current" && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg border-collapse">
            <thead className="text-white bg-blue-500">
              <tr>
                <th className="border border-gray-300 text-left py-3 px-4">
                  Student Name
                </th>
                <th className="border border-gray-300 text-left py-3 px-4">
                  Student Roll No
                </th>
                <th className="border border-gray-300 text-left py-3 px-4">
                  Reason
                </th>
                <th className="border border-gray-300 text-left py-3 px-4">
                  From Time
                </th>
                <th className="border border-gray-300 text-left py-3 px-4">
                  To Time
                </th>
                <th className="border border-gray-300 text-left py-3 px-4">
                  Status
                </th>
                <th className="border border-gray-300 text-left py-3 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="border border-gray-300 py-3 px-4">
                    {item.student.name}
                  </td>
                  <td className="border border-gray-300 py-3 px-4">
                    {item.student.Rollno}
                  </td>
                  <td className="border border-gray-300 py-3 px-4">
                    {item.reason}
                  </td>
                  <td className="border border-gray-300 py-3 px-4">
                    {new Date(item.fromTime).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 py-3 px-4">
                    {new Date(item.toTime).toLocaleString()}
                  </td>
                  <td
                    className={`border border-gray-300 py-3 px-4 font-semibold ${
                      item.status === "approved"
                        ? "text-green-500"
                        : item.status === "rejected"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {item.status}
                  </td>
                  {item.status === "pending" && (
                    <td className="border border-gray-300 py-3 px-4">
                      <button
                        onClick={() => handleUpdateStatus(item._id, "approved")}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-300 ease-in-out"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item._id, "rejected")}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-300 ease-in-out ml-2"
                      >
                        Reject
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === "past" && studentOutpasses.length > 0 && (
        <div className="mt-6">
          <button
            onClick={generatePDF}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-300 ease-in-out"
          >
            Generate PDF
          </button>
          <div id="student-history-table" className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white shadow-md rounded-lg border-collapse">
              <thead className="text-white bg-blue-500">
                <tr>
                  <th className="border border-gray-300 text-left py-3 px-4">
                    Student Name
                  </th>
                  <th className="border border-gray-300 text-left py-3 px-4">
                    Student Roll No
                  </th>
                  <th className="border border-gray-300 text-left py-3 px-4">
                    Reason
                  </th>
                  <th className="border border-gray-300 text-left py-3 px-4">
                    From Time
                  </th>
                  <th className="border border-gray-300 text-left py-3 px-4">
                    To Time
                  </th>
                  <th className="border border-gray-300 text-left py-3 px-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentOutpasses.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="border border-gray-300 py-3 px-4">
                      {item.student.name}
                    </td>
                    <td className="border border-gray-300 py-3 px-4">
                      {item.student.Rollno}
                    </td>
                    <td className="border border-gray-300 py-3 px-4">
                      {item.reason}
                    </td>
                    <td className="border border-gray-300 py-3 px-4">
                      {new Date(item.fromTime).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 py-3 px-4">
                      {new Date(item.toTime).toLocaleString()}
                    </td>
                    <td
                      className={`border border-gray-300 py-3 px-4 font-semibold ${
                        item.status === "approved"
                          ? "text-green-500"
                          : item.status === "rejected"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}
                    >
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
