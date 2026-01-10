"use client";

import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional Theme applied to the grid
import "ag-grid-community/styles/ag-theme-balham.css"; // Dark theme
import { ColDef } from "ag-grid-community";
import { cloneDeep } from "lodash";
import { Grid } from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import mergedData from "../../data/mergedData.json";
import { Transaction } from "../../types";

const DataGrid = () => {
  const { setTicker } = useAppContext();

  // Row Data: The data to be displayed.
  const rowData = useMemo(() => {
    const data = cloneDeep(mergedData) as unknown as Transaction[];
    return data.map((x) => {
      const newX = { ...x };
      // @ts-ignore
      delete newX[""];
      return newX;
    });
  }, []);

  // Column Definitions: Defines the columns to be displayed.
  const columnDefs = useMemo<ColDef[]>(() => {
    if (!rowData || rowData.length === 0) return [];

    const keys = Object.keys(rowData[0]);
    if (keys.length > 1) {
      const temp = keys[0];
      keys[0] = keys[1];
      keys[1] = temp;
    }

    return keys.map((key) => {
      const baseDef: ColDef = {
        field: key,
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: true,
      };

      switch (key) {
        case "Date":
          baseDef.minWidth = 120;
          baseDef.flex = 1;
          break;
        case "Direction":
        case "CUSIP":
        case "Shares":
        case "% Of ETF":
        case "Ticker":
          baseDef.minWidth = 100;
          baseDef.flex = 1;
          break;
        case "FUND":
          baseDef.minWidth = 90;
          baseDef.flex = 1;
          break;
        case "Name":
          baseDef.width = 300;
          baseDef.flex = 2;
          break;
        default:
          baseDef.minWidth = 100;
          baseDef.flex = 1;
          break;
      }
      return baseDef;
    });
  }, [rowData]);

  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const onRowClicked = (event: any) => {
    if (event.data && event.data.Ticker) {
      setTicker(event.data.Ticker);
    }
  };

  if (!mounted) return null;

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ height: "600px", width: "100%" }}
    >
      <div
        className="ag-theme-alpine-dark"
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={20}
          onRowClicked={onRowClicked}
        />
      </div>
    </Grid>
  );
};

export default DataGrid;
