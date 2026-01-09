"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  MenuItem,
  FormControl,
  Select,
  Button,
  Grid,
  Alert,
  SelectChangeEvent,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import MostActiveStocksTabs from "../components/MostActiveStocks/MostActiveStocksTabs";
import StockDetails from "../components/StockDetails/StockDetails";
import DataGrid from "../components/DataGrid/DataGrid";
import mergedData from "../data/mergedData.json";
import { Transaction } from "../types";

export default function Home() {
  const {
    ticker,
    errorMessage,
    setErrorMessage,
    mostActiveDaysRange,
    setMostActiveDaysRange,
  } = useAppContext();

  const [expanded, setExpanded] = useState<string[]>([
    "most-active-stock-panel",
  ]);
  const coffeeEmojiRef = useRef<HTMLButtonElement>(null);
  const stockDetailsRef = useRef<HTMLDivElement>(null);

  // Auto-expand Stock Details when ticker changes and scroll to it
  useEffect(() => {
    if (ticker) {
      if (!expanded.includes("stock-details-panel")) {
        setExpanded((prev) => [...prev, "stock-details-panel"]);
      }

      // Scroll to Stock Details section with a slight delay to allow accordion to expand
      setTimeout(() => {
        if (stockDetailsRef.current) {
          stockDetailsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    }
  }, [ticker]);

  const handlePanelChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded((prev) => {
        if (isExpanded) {
          return [...prev, panel];
        } else {
          return prev.filter((p) => p !== panel);
        }
      });
    };

  const handleSelectDaysRange = (event: SelectChangeEvent<number>) => {
    setMostActiveDaysRange(Number(event.target.value));
  };

  const handleDonationSectionClick = () => {
    if (coffeeEmojiRef.current) {
      coffeeEmojiRef.current.click();
    }
  };

  // Get latest date from data
  const latestDate =
    (mergedData as unknown as Transaction[])?.[0]?.Date || "Unknown";

  return (
    <div className="layout-wrapper">
      <div className="header-wrapper">
        <Header />
      </div>

      <div className="notification-bar-wrapper">
        {errorMessage && (
          <Alert
            variant="filled"
            severity="error"
            onClose={() => setErrorMessage("")}
            sx={{ background: "var(--error)" }}
          >
            {errorMessage}
          </Alert>
        )}
      </div>

      <main className="accordion-wrapper">
        {/* Most Active Stocks Panel */}
        <Accordion
          expanded={expanded.includes("most-active-stock-panel")}
          onChange={handlePanelChange("most-active-stock-panel")}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="most-active-stock-panel-content"
            id="most-active-stock-panel-header"
          >
            <Grid container alignItems="center">
              <Grid item xs={12} md={4}>
                <Typography className="accordion-heading">
                  Market Activity
                </Typography>
              </Grid>
              <Grid item xs={12} md={8} className="second-heading-wrapper">
                <Box className="accordion-second-heading" component={"span"}>
                  Top Movers in
                  <FormControl className="days-dropdown" size="small">
                    <Select
                      value={mostActiveDaysRange}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSelectDaysRange}
                      MenuProps={{
                        disableScrollLock: true,
                        PaperProps: {
                          sx: {
                            background: "var(--surface)",
                            border: "1px solid var(--surface-border)",
                            color: "var(--text-main)",
                            "& .MuiMenuItem-root:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value={1}>1 Day</MenuItem>
                      <MenuItem value={7}>1 Week</MenuItem>
                      <MenuItem value={14}>2 Weeks</MenuItem>
                      <MenuItem value={30}>1 Month</MenuItem>
                      <MenuItem value={90}>3 Months</MenuItem>
                      <MenuItem value={10000}>All Time</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <div className="most-active-stocks-tabs-wrapper">
              <MostActiveStocksTabs />
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Stock Details Panel */}
        <Accordion
          ref={stockDetailsRef}
          expanded={expanded.includes("stock-details-panel")}
          onChange={handlePanelChange("stock-details-panel")}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="stock-details-panel-content"
            id="stock-details-panel-header"
          >
            <Typography className="accordion-heading">
              Insight: {ticker || "Select a Ticker"}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="stock-details-wrapper">
              <StockDetails />
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Data Grid Panel */}
        <Accordion
          expanded={expanded.includes("data-grid-panel")}
          onChange={handlePanelChange("data-grid-panel")}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="data-grid-panel-content"
            id="data-grid-panel-header"
          >
            <Grid container alignItems="center">
              <Grid item xs={12} md={4}>
                <Typography className="accordion-heading">Raw Data</Typography>
              </Grid>
              <Grid item xs={12} md={8} className="second-heading-wrapper">
                <Typography className="accordion-second-heading">
                  All ARK Transactions
                </Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                background: "rgba(15, 23, 42, 0.2)",
                borderRadius: "12px",
                p: { xs: 0, md: 2 },
              }}
            >
              <DataGrid />
            </Box>
          </AccordionDetails>
        </Accordion>
      </main>

      <footer className="sticky-footer">
        <Grid container alignItems="center">
          <Grid item xs={12} md={4}>
            <p className="disclaimer">
              Disclaimer: For educational purposes only.
              <br />
              Not financial advice.
            </p>
          </Grid>

          <Grid item xs={12} md={4} className="donation-section">
            <div className="donation" onClick={handleDonationSectionClick}>
              <form
                action="https://www.paypal.com/donate"
                method="post"
                target="_top"
              >
                <input type="hidden" name="cmd" value="_donations" />
                <input type="hidden" name="business" value="xzhu@wpi.edu" />
                <input type="hidden" name="currency_code" value="USD" />
                <Button
                  size="small"
                  variant="contained"
                  className="emoji-submit-button"
                  type="submit"
                  ref={coffeeEmojiRef}
                >
                  Support Project ☕
                </Button>
              </form>
            </div>
          </Grid>

          <Grid item xs={12} md={4} className="additonal-info-section">
            <div className="info-container">
              <p className="info-version">
                <a
                  href="https://github.com/KarlZhu-SE/ark-funds-monitor"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source Code
                </a>
              </p>
              <p className="info-update-date">Data: {latestDate}</p>
            </div>
          </Grid>
        </Grid>
      </footer>
    </div>
  );
}
