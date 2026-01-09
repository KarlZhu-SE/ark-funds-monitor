"use client";

import React, { useState, useMemo } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { styled, alpha } from "@mui/material/styles";
import StockCard from "./StockCard";
import { useAppContext } from "../../context/AppContext";
import mergedData from "../../data/mergedData.json";
import { StockData, Transaction } from "../../types";

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
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{ width: "100%", minHeight: "400px" }}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            p: { xs: 1, md: 3 },
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "center",
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderRight: `1px solid var(--surface-border)`,
  minWidth: "160px",
  backgroundColor: "rgba(15, 23, 42, 0.2)",
  "& .MuiTabs-indicator": {
    width: "4px",
    borderRadius: "0 4px 4px 0",
    left: 0,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 700,
  fontSize: "0.95rem",
  minHeight: "64px",
  padding: "0 24px",
  alignItems: "flex-start",
  textAlign: "left",
  color: "var(--text-muted)",
  transition: "all 0.2s ease",
  "&.Mui-selected": {
    color: "var(--text-main)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "var(--text-main)",
  },
}));

const MostActiveStocksTabs = () => {
  const { mostActiveDaysRange } = useAppContext();
  const [tabIndex, setTabIndex] = useState(0);

  const tabsColor = ["#10b981", "#ef4444", "#6366f1"]; // Success, Error, Primary

  const { mostBuyStocks, mostSellStocks, mostActiveStocks } = useMemo(() => {
    const arkData = mergedData as unknown as Transaction[];

    const hash: { [key: string]: number } = {};
    const rslt: StockData[] = [];

    if (!arkData || arkData.length === 0) {
      return { mostBuyStocks: [], mostSellStocks: [], mostActiveStocks: [] };
    }

    const lastestDate = arkData[0].Date;
    let deadlineTimestamp = 0;

    if (mostActiveDaysRange !== 10000) {
      deadlineTimestamp =
        new Date(lastestDate).setHours(0, 0, 0, 0) -
        mostActiveDaysRange * 24 * 60 * 60 * 1000;
    }

    for (const tran of arkData) {
      if (
        deadlineTimestamp &&
        new Date(tran.Date).setHours(0, 0, 0, 0) <= deadlineTimestamp
      ) {
        break;
      }

      if (!hash[tran.Ticker]) {
        hash[tran.Ticker] = 1;
        rslt.push({
          ticker: tran.Ticker,
          name: tran.Name,
          noOfBuy: 0,
          noOfSell: 0,
          noOfTransactions: 0,
          directionSymbols: [],
          transactionsDetails: [],
        });
      } else {
        hash[tran.Ticker]++;
      }

      const stock = rslt.find((x) => x.ticker === tran.Ticker);
      if (stock) {
        if (tran.Direction === "Buy") {
          stock.noOfBuy++;
        } else if (tran.Direction === "Sell") {
          stock.noOfSell++;
        }
        stock.noOfTransactions++;
        stock.directionSymbols.unshift(tran.Direction);
        stock.transactionsDetails.push(tran);
      }
    }

    const numberOfStocks =
      rslt.length > 15 && mostActiveDaysRange !== 1 ? 15 : rslt.length;

    const buys = rslt
      .filter((x) => x.noOfBuy > 0)
      .sort((a, b) => b.noOfBuy - a.noOfBuy)
      .slice(0, numberOfStocks);
    const sells = rslt
      .filter((x) => x.noOfSell > 0)
      .sort((a, b) => b.noOfSell - a.noOfSell)
      .slice(0, numberOfStocks);
    const active = rslt
      .sort((a, b) => b.noOfTransactions - a.noOfTransactions)
      .slice(0, numberOfStocks);

    return {
      mostBuyStocks: buys,
      mostSellStocks: sells,
      mostActiveStocks: active,
    };
  }, [mostActiveDaysRange]);

  const handleTabChange = (
    event: React.SyntheticEvent,
    newTabIndex: number
  ) => {
    setTabIndex(newTabIndex);
  };

  const a11yProps = (index: number) => {
    return {
      id: `vertical-tab-${index}`,
      "aria-controls": `vertical-tabpanel-${index}`,
    };
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        height: "100%",
        minHeight: 400,
        background: "transparent",
      }}
    >
      <StyledTabs
        orientation="vertical"
        variant="scrollable"
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="Most Active Stocks Tabs"
        TabIndicatorProps={{ style: { background: tabsColor[tabIndex] } }}
      >
        <StyledTab
          label="Most Buy"
          {...a11yProps(0)}
          sx={{ color: tabIndex === 0 ? tabsColor[0] : "var(--text-muted)" }}
        />
        <StyledTab
          label="Most Sell"
          {...a11yProps(1)}
          sx={{ color: tabIndex === 1 ? tabsColor[1] : "var(--text-muted)" }}
        />
        <StyledTab
          label="Most Active"
          {...a11yProps(2)}
          sx={{ color: tabIndex === 2 ? tabsColor[2] : "var(--text-muted)" }}
        />
      </StyledTabs>

      <TabPanel value={tabIndex} index={0}>
        {mostBuyStocks.map((el) => (
          <StockCard
            key={el.ticker}
            data={el}
            backgroundColor={tabsColor[tabIndex]}
          />
        ))}
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        {mostSellStocks.map((el) => (
          <StockCard
            key={el.ticker}
            data={el}
            backgroundColor={tabsColor[tabIndex]}
          />
        ))}
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        {mostActiveStocks.map((el) => (
          <StockCard
            key={el.ticker}
            data={el}
            backgroundColor={tabsColor[tabIndex]}
          />
        ))}
      </TabPanel>
    </Box>
  );
};

export default MostActiveStocksTabs;
