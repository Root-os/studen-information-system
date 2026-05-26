import React, { useContext, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ThemeContext from "../layout/ThemeContext";

const DataTable = ({
  columns,
  data,
  loading = false,
  enableRowActions = false,
  renderRowActions,
}) => {
  const { currentTheme } = useContext(ThemeContext);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: currentTheme === "dark" ? "dark" : "light",
        },
      }),
    [currentTheme]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <MaterialReactTable
        columns={columns}
        data={data}
        state={{ isLoading: loading }}
        enableColumnOrdering
        enableColumnFilters
        enableSorting
        enablePagination
        enableGlobalFilter
        enableColumnActions
        enableRowActions={enableRowActions}
        positionActionsColumn="last"
        renderRowActions={renderRowActions}
        initialState={{
          pagination: { pageSize: 30 },
          density: "compact",   // ✅ default compact density
        }}
        muiTableContainerProps={{
          sx: { maxHeight: "600px" },
        }}
      />
    </ThemeProvider>
  );
};

export default DataTable;