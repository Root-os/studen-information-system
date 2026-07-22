import React, { useContext } from "react";
import ThemeContext from "../layout/ThemeContext";

const CrudFormModal = ({
  open,
  title,
  fields,
  values,
  onChange,
  onSubmit,
  onClose,
  submitLabel = "Save",
}) => {
  const { theme, currentTheme } = useContext(ThemeContext);

  if (!open) return null;

  const modalBg = currentTheme === "dark" ? "bg-gray-900" : "bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`${modalBg} rounded-lg shadow-lg w-full max-w-lg p-6`}>
        <h2 className={`text-xl font-semibold mb-6 ${theme.text}`}>{title}</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {fields.map((field) => {
            const commonProps = {
              value: values[field.name] ?? "",
              onChange: (e) =>
                onChange({
                  ...values,
                  [field.name]: e.target.value,
                }),
              placeholder: field.placeholder || field.label,
              disabled: field.disabled, // 👈 ADD THIS
              className: `${
                currentTheme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } w-full border rounded px-3 py-2 ${
                field.disabled ? "opacity-60 cursor-not-allowed" : ""
              }`,
            };

            switch (field.type) {
              case "textarea":
                return (
                  <div key={field.name}>
                    <label className={`block mb-1 ${theme.text}`}>
                      {field.label}
                    </label>

                    <textarea {...commonProps} rows={field.rows || 4} />
                  </div>
                );

              case "select":
                return (
                  <div key={field.name}>
                    <label className={`block mb-1 ${theme.text}`}>
                      {field.label}
                    </label>

                    <select {...commonProps}>
                      <option value="">Select {field.label}</option>

                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );

              default:
                return (
                  <div key={field.name}>
                    <label className={`block mb-1 ${theme.text}`}>
                      {field.label}
                    </label>

                    <input {...commonProps} type={field.type || "text"} />
                  </div>
                );
            }
          })}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`${
                currentTheme === "dark"
                  ? "border-gray-600 text-white"
                  : "border-gray-300 text-gray-900"
              } border px-4 py-2 rounded`}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`${theme.primary} text-white px-5 py-2 rounded`}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrudFormModal;
