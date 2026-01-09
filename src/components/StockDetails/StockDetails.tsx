"use client";

import React, { useState } from "react";
import { AppBar, Tabs, Tab, Box, alpha } from "@mui/material";
import TimelineIcon from "@mui/icons-material/Timeline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import StockFigure from "./StockFigure";
import BasicInfo from "./BasicInfo";
import CompanyNews from "./CompanyNews";
import { useAppContext } from "../../context/AppContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 2, md: 4 } }}>{children}</Box>}
    </div>
  );
}

const StockDetails = () => {
  const { ticker } = useAppContext();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (
    event: React.SyntheticEvent,
    newTabIndex: number
  ) => {
    setTabIndex(newTabIndex);
  };

  const a11yProps = (index: number) => {
    return {
      id: `scrollable-auto-tab-${index}`,
      "aria-controls": `scrollable-auto-tabpanel-${index}`,
    };
  };

  return (
    <Box
      className="stock-details-inner-wrapper"
      sx={{
        background: "rgba(15, 23, 42, 0.2)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          borderBottom: "1px solid var(--surface-border)",
          background: "rgba(15, 23, 42, 0.4)",
        }}
      >
        <Tabs
          variant="fullWidth"
          value={tabIndex}
          onChange={handleTabChange}
          TabIndicatorProps={{
            style: {
              background: "#6366f1",
              height: "3px",
              borderRadius: "3px 3px 0 0",
            },
          }}
          sx={{
            "& .MuiTab-root": {
              color: "var(--text-muted)",
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.95rem",
              minHeight: "64px",
              "&.Mui-selected": {
                color: "var(--text-main)",
              },
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.03)",
              },
            },
          }}
        >
          <Tab
            label="Chart"
            icon={<TimelineIcon />}
            iconPosition="start"
            {...a11yProps(0)}
          />
          <Tab
            label="Basic Info"
            disabled={!ticker}
            icon={<InfoOutlinedIcon />}
            iconPosition="start"
            {...a11yProps(1)}
          />
          <Tab
            label="News"
            disabled={!ticker}
            icon={<CommentOutlinedIcon />}
            iconPosition="start"
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabIndex} index={0}>
        <StockFigure />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <BasicInfo />
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        <CompanyNews />
      </TabPanel>
    </Box>
  );
};

export default StockDetails;
