import React from "react";

const StatusModal = ({
  open,
  type = "success", // "success" | "error" | "info"
  title,
  message,
  onClose,
}) => {
  if (!open) return null;

  const styles = {
    success: {
      border: "border-green-500",
      text: "text-green-600",
      button: "bg-green-600 hover:bg-green-700",
      icon: "✓",
    },
    error: {
      border: "border-red-500",
      text: "text-red-600",
      button: "bg-red-600 hover:bg-red-700",
      icon: "✕",
    },
    info: {
      border: "border-blue-500",
      text: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
      icon: "ℹ",
    },
  };

  const current = styles[type] || styles.info;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`w-[420px] bg-white dark:bg-gray-900 rounded-lg shadow-lg border-t-4 ${current.border} p-6`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-3">
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold ${current.text} bg-gray-100 dark:bg-gray-800`}
          >
            {current.icon}
          </div>
        </div>

        {/* Title */}
        {title && (
          <h2 className={`text-center text-lg font-semibold ${current.text}`}>
            {title}
          </h2>
        )}

        {/* Message */}
        <p className="text-center text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line">
          {message}
        </p>

        {/* Button */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded text-white transition ${current.button}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;