import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../../components/layout/ThemeContext";
import { FiEye } from "react-icons/fi";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ui/toast";
import usePagePermission from "../../hooks/userPagePermission";

const LettersPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast();
  const navigate = useNavigate();
  const { canCreate } = usePagePermission("letter");
  const [letters, setLetters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
    senderType: "",
    senderId: "",
    receiverType: "",
    receiverId: ""
  });

  const [senderOptions, setSenderOptions] = useState([]);
  const [receiverOptions, setReceiverOptions] = useState([]);

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const res = await api.get("/letter");
      setLetters(res.data);
    } catch {
      error("Failed to fetch letters");
    }
  };

  const handleTypeChange = async (field, type) => {
    setFormData({ ...formData, [field]: type, [field.replace("Type","Id")]: "" });
    try {
      let res;
      if (type === "Management") res = await api.get("/management");
      else if (type === "UserDepartment") res = await api.get("/user-department");
      else if (type === "User") res = await api.get("/users");

      if (field === "senderType") setSenderOptions(res.data);
      else setReceiverOptions(res.data);
    } catch {
      error(`Failed to fetch ${field} options`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/letter/send", formData);
      success("Letter sent successfully");
      setShowModal(false);
      setFormData({
        subject: "",
        body: "",
        senderType: "",
        senderId: "",
        receiverType: "",
        receiverId: ""
      });
      fetchLetters();
    } catch {
      error("Failed to send letter");
    }
  };

  const formatOptionLabel = (item, type) => {
    if (type === "Management") return `${item.User.fullName} (${item.assignedRole})`;
    if (type === "UserDepartment") return `${item.User.fullName} (${item.Department.name})`;
    if (type === "User") return `${item.fullName} (Member)`;
    return "";
  };

 const columns = [
  { header: "No.", accessor: "rowNumber", render: (_, i) => i + 1 },
  { header: "Subject", accessor: "subject" },
  { header: "Body", accessor: "body" },
  { 
    header: "Sender",
    accessor: "sender",
    render: (row) => {
      if (!row.sender) return "";
      if (row.senderType === "Management") return `${row.sender.User?.fullName || ""} (${row.sender.assignedRole || ""})`;
      if (row.senderType === "UserDepartment") return `${row.sender.User?.fullName || ""} (${row.sender.Department?.name || ""})`;
      return `${row.sender?.fullName || row.sender.User?.fullName || ""} (Member)`;
    }
  },
  { 
    header: "Receiver",
    accessor: "receiver",
    render: (row) => {
      if (!row.receiver) return "";
      if (row.receiverType === "Management") return `${row.receiver.User?.fullName || ""} (${row.receiver.assignedRole || ""})`;
      if (row.receiverType === "UserDepartment") return `${row.receiver.User?.fullName || ""} (${row.receiver.Department?.name || ""})`;
      return `${row.receiver?.fullName || row.receiver.User?.fullName || ""} (Member)`;
    }
  },
  { header: "Status", accessor: "status" },
  { header: "Created At", accessor: "createdAt" },
    {
    header: "Actions",
    accessor: "actions",
    render: (row) => (
      <button
        onClick={() => navigate(`/letters/${row.id}`)}
        className="p-2 rounded-md hover:bg-blue-100 text-blue-500"
      >
        <FiEye size={18} />
      </button>
    )
  }
];

  const modalBg = currentTheme === "dark" ? "bg-gray-900" : "bg-white";
  const modalText = theme.text;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className={`${currentTheme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow flex justify-between`}>
        <h2 className={`text-xl font-bold ${modalText}`}>Letters</h2>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className={`${theme.primary} text-white px-4 py-2 rounded`}
          >
            + Send Letter
          </button>
        )}
      </div>

      {/* Table */}
      <div className={`${currentTheme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow`}>
        <DataTable columns={columns} data={letters} />
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className={`${modalBg} p-6 rounded-lg w-[500px]`}>
            <h3 className={`text-lg font-semibold mb-4 ${modalText}`}>Send Letter</h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Subject"
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />

              <textarea
                placeholder="Body"
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              />

              {/* Sender Type */}
              <select
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                value={formData.senderType}
                onChange={(e) => handleTypeChange("senderType", e.target.value)}
              >
                <option value="">Select Sender Type</option>
                <option value="Management">Management</option>
                <option value="UserDepartment">UserDepartment</option>
                <option value="User">User</option>
              </select>

              {/* Sender Options */}
              {senderOptions.length > 0 && (
                <select
                  className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                  value={formData.senderId}
                  onChange={(e) => setFormData({ ...formData, senderId: e.target.value })}
                >
                  <option value="">Select Sender</option>
                  {senderOptions.map((item) => (
                    <option key={item.id} value={item.id}>{formatOptionLabel(item, formData.senderType)}</option>
                  ))}
                </select>
              )}

              {/* Receiver Type */}
              <select
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                value={formData.receiverType}
                onChange={(e) => handleTypeChange("receiverType", e.target.value)}
              >
                <option value="">Select Receiver Type</option>
                <option value="Management">Management</option>
                <option value="UserDepartment">UserDepartment</option>
                <option value="User">User</option>
              </select>

              {/* Receiver Options */}
              {receiverOptions.length > 0 && (
                <select
                  className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                  value={formData.receiverId}
                  onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
                >
                  <option value="">Select Receiver</option>
                  {receiverOptions.map((item) => (
                    <option key={item.id} value={item.id}>{formatOptionLabel(item, formData.receiverType)}</option>
                  ))}
                </select>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`${currentTheme === "dark" ? "border-gray-600 text-white" : "border-gray-300 text-gray-900"} px-3 py-2 border rounded`}
                >
                  Cancel
                </button>
                <button type="submit" className={`${theme.primary} text-white px-4 py-2 rounded`}>
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LettersPage;