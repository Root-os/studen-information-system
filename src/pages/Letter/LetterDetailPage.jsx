import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ThemeContext from "../../components/layout/ThemeContext";
import api from "../../hooks/api";
import { useToast } from "../../components/ui/toast";
import { FiPrinter, FiArrowLeft } from "react-icons/fi";

const LetterDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, currentTheme } = useContext(ThemeContext);
  const { error } = useToast();

  const [letter, setLetter] = useState(null);

  useEffect(() => {
    fetchLetter();
  }, [id]);

  const fetchLetter = async () => {
    try {
      const res = await api.get(`/letter/${id}`);
      setLetter(res.data);
    } catch {
      error("Failed to load letter");
    }
  };

  /* -------------------------
     Sender formatting
  --------------------------*/
  const getSender = () => {
    if (!letter?.sender) return "Unknown Sender";

    if (letter.senderType === "Management") {
      return `${letter.sender.User?.fullName || ""} (${letter.sender.assignedRole})`;
    }

    if (letter.senderType === "UserDepartment") {
      return `${letter.sender.User?.fullName || ""} - ${
        letter.sender.Department?.name || ""
      }`;
    }

    if (letter.senderType === "User") {
      return `${letter.sender.fullName || ""} (Member)`;
    }

    return "Unknown Sender";
  };

  /* -------------------------
     Receiver formatting
  --------------------------*/
  const getReceiver = () => {
    if (!letter?.receiver) return "Unknown Receiver";

    if (letter.receiverType === "Management") {
      return `${letter.receiver.User?.fullName || ""} (${letter.receiver.assignedRole})`;
    }

    if (letter.receiverType === "UserDepartment") {
      return `${letter.receiver.User?.fullName || ""} - ${
        letter.receiver.Department?.name || ""
      }`;
    }

    if (letter.receiverType === "User") {
      return `${letter.receiver.fullName || ""} (Member)`;
    }

    return "Unknown Receiver";
  };

  if (!letter) return null;

  const cardBg = currentTheme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme.text;

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="w-full max-w-4xl">

        {/* ACTION BUTTONS */}
        <div className="flex justify-between mb-4 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            <FiArrowLeft /> Back
          </button>

          <button
            onClick={() => window.print()}
            className={`${theme.primary} text-white px-4 py-2 rounded flex items-center gap-2`}
          >
            <FiPrinter /> Print
          </button>
        </div>

        {/* LETTER CARD */}
        <div className={`${cardBg} p-10 rounded-lg shadow-lg`}>

          {/* HEADER */}
          <div className="text-center border-b pb-6 mb-8">
            <h1 className={`text-3xl font-bold ${textColor}`}>
              Saint Mary's Church Administration
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Official Communication Letter
            </p>
          </div>

          {/* META INFO */}
          <div className="flex justify-between mb-8 text-sm">

            <div className={textColor}>
              <p>
                <strong>Reference:</strong> LET-{letter.id}
              </p>

              <p>
                <strong>Status:</strong> {letter.status}
              </p>
            </div>

            <div className={textColor}>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(letter.createdAt).toLocaleDateString()}
              </p>
            </div>

          </div>

          {/* FROM / TO */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">

            <div>
              <p className="text-gray-500 text-sm">FROM</p>

              <p className={`font-semibold ${textColor}`}>
                {getSender()}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">TO</p>

              <p className={`font-semibold ${textColor}`}>
                {getReceiver()}
              </p>
            </div>

          </div>

          {/* SUBJECT */}
          <div className="border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-700 p-4 mb-8 rounded">
            <p className={`text-lg font-semibold ${textColor}`}>
              Subject: {letter.subject}
            </p>
          </div>

          {/* BODY */}
          <div
            className={`leading-relaxed whitespace-pre-line mb-12 ${textColor}`}
          >
            {letter.body}
          </div>

          {/* ATTACHMENT */}
          {letter.attachment && (
            <div className="mb-10">
              <p className={`font-semibold ${textColor}`}>Attachment</p>

              <a
                href={`http://localhost:5000/uploads/${letter.attachment}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                View Attachment
              </a>
            </div>
          )}

          {/* SIGNATURE */}
          <div className="mt-20">
            <p className={textColor}>Sincerely,</p>

            <div className="mt-10">
              <p className={`font-semibold ${textColor}`}>
                {getSender()}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Saint Mary's Church Administration
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LetterDetailPage;