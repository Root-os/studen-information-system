import React, { useState, useMemo, useContext } from "react";
import ThemeContext from "../layout/ThemeContext";

export default function DataTable({ columns, data }) {
  const { theme, currentTheme } = useContext(ThemeContext);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  return (
    <div className="space-y-4">

      {/* Search */}
      <div className="flex justify-between">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className={`px-3 py-2 rounded-md border w-64
            ${
              currentTheme === "dark"
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "border-gray-300"
            }`}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr
              className={`text-left text-sm
              ${
                currentTheme === "dark"
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {columns.map((col) => (
                <th key={col.accessor} className="px-4 py-3 font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

<tbody>
  {paginatedData.map((row, index) => (
    <tr key={index} className={`border-t ${currentTheme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`}>
      {columns.map((col) => (
        <td key={col.accessor} className={`px-4 py-3 ${theme.text}`}>
          {col.render ? col.render(row, index) : row[col.accessor]}
        </td>
      ))}
    </tr>
  ))}
</tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm">

        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className={theme.text}>Rows per page</span>

          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className={`px-2 py-1 rounded border
              ${
                currentTheme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "border-gray-300"
              }`}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-3">

          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`px-3 py-1 rounded border
              ${
                currentTheme === "dark"
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
          >
            Prev
          </button>

          <span className={theme.text}>
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            className={`px-3 py-1 rounded border
              ${
                currentTheme === "dark"
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
          >
            Next
          </button>

        </div>
      </div>
    </div>
  );
}