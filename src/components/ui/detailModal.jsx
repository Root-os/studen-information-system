import React, { useContext, useEffect } from "react";
import { FiX } from "react-icons/fi";
import ThemeContext from "../layout/ThemeContext";

const sizes = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
  full: "max-w-7xl",
};

const ViewModal = ({
  open,
  title,
  children,
  footer,
  onClose,
  size = "lg",
  closeOnBackdrop = true,
}) => {
  const { currentTheme } = useContext(ThemeContext);

  const isDark = currentTheme === "dark";

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => closeOnBackdrop && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          w-full
          ${sizes[size]}
          max-h-[90vh]
          rounded-xl
          border
          shadow-2xl
          flex
          flex-col
          ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-200 text-gray-900"
          }
        `}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2 className="text-xl font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className={`rounded-lg p-2 transition-colors ${
              isDark
                ? "hover:bg-gray-700"
                : "hover:bg-gray-100"
            }`}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={`flex justify-end gap-3 px-6 py-4 border-t ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewModal;