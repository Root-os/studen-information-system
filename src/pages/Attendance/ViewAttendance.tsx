import React, { useState, useEffect } from "react";
import { FaEye, FaTimes } from "react-icons/fa";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";

function AttendanceView() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await api.get("/attendance");
        setAttendanceData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.message || "Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const columns = [
    { header: "Course Name", accessor: "courseName" },
    { header: "Course Code", accessor: "courseCode" },
    { header: "Date", accessor: "date" },
    {
      header: "Teacher",
      accessor: "teacher",
      render: (row) => row.teacher?.fullName || "-",
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <button
          className="p-1 text-blue-600 hover:text-blue-800"
          onClick={() => setSelectedRecord(row)}
        >
          <FaEye />
        </button>
      ),
    },
  ];

  const tableData = attendanceData.map((item) => ({
    ...item,
    key: `${item.courseId}-${item.date}`,
  }));

  if (loading) return <p className="text-gray-500">Loading attendance...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Attendance Records</h2>

      {tableData.length > 0 ? (
        <DataTable columns={columns} data={tableData} />
      ) : (
        <p className="text-gray-500">No attendance records found.</p>
      )}

      {/* Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl h-full max-h-[90vh] rounded-xl shadow-2xl relative flex flex-col animate-fade-in">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setSelectedRecord(null)}
            >
              <FaTimes size={20} />
            </button>

            {/* Header */}
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-1">
                {selectedRecord.courseName} ({selectedRecord.courseCode}) - {selectedRecord.date}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Teacher: {selectedRecord.teacher?.fullName} ({selectedRecord.teacher?.email})
              </p>
            </div>

            {/* Scrollable Student List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-2">
              {selectedRecord.students?.length > 0 ? (
                selectedRecord.students.map((student) => (
                  <div
                    key={student.attendanceId}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm"
                  >
                    <div>
                      <p className="font-medium">{student.fullName}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                    <div
                      className={`font-semibold ${
                        student.attendance === "PRESENT" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {student.attendance}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No students found for this date.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceView;