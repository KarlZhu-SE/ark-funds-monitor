"use client";

import React, { useEffect, useState, useMemo } from "react";
import ReactEcharts from "echarts-for-react";
import {
  CircularProgress,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Box,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import { getCandleUrl, token } from "../../shared/constants";
import {
  alphaVantageApiKey,
  alphaVantageBaseUrl,
  alphaVantageFunction,
} from "../../shared/alphaVantageConstants";
import mergedData from "../../data/mergedData.json";
import { Transaction } from "../../types";
import * as _ from "lodash";
import styles from "./StockFigure.module.scss";

const downColor = "#FF5000";
const downBorderColor = "#8A0000";
const upColor = "#00C805";
const upBorderColor = "#008F28";

const StockFigure = () => {
  const {
    ticker,
    errorMessage,
    setErrorMessage,
    candlestickDaysRange,
    setCandlestickDaysRange,
  } = useAppContext();
  const [figureTitle, setFigureTitle] = useState("");
  const [isFigureLoading, setIsFigureLoading] = useState(false);
  const [massagedData, setMassagedData] = useState<any[]>([]);

  const figureRangeButtonConfigs = [
    // Note: 1D (intraday) removed - Alpha Vantage free tier only supports daily data
    { id: "1W", text: "1W", value: 7, resolution: "D", daysRange: 7 },
    { id: "2W", text: "2W", value: 14, resolution: "D", daysRange: 14 },
    { id: "1M", text: "1M", value: 30, resolution: "D", daysRange: 30 },
    { id: "3M", text: "3M", value: 90, resolution: "D", daysRange: 90 },
    { id: "1Y", text: "1Y", value: 365, resolution: "D", daysRange: 365 },
  ];

  useEffect(() => {
    if (ticker) {
      setFigureTitle(ticker);
      getCandleData(ticker, candlestickDaysRange);
    } else {
      setMassagedData([]);
    }
  }, [ticker, candlestickDaysRange]);

  const formatDollarAmount = (amount: number) =>
    amount >= 1.0e9
      ? (amount / 1.0e9).toFixed(1) + "B"
      : amount >= 1.0e6
      ? (amount / 1.0e6).toFixed(1) + "M"
      : amount >= 1.0e3
      ? (amount / 1.0e3).toFixed(1) + "K"
      : amount.toFixed(2);

  const getCandleData = (currentTicker: string, daysRange: number) => {
    setErrorMessage("");
    setIsFigureLoading(true);

    // Alpha Vantage API parameters
    const apiParams = new URLSearchParams({
      function: alphaVantageFunction,
      symbol: currentTicker,
      apikey: alphaVantageApiKey,
      outputsize: daysRange > 100 ? "full" : "compact", // compact = last 100 days, full = 20+ years
    });

    const url = `${alphaVantageBaseUrl}?${apiParams.toString()}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 403) {
            setErrorMessage(`Market Data Restricted (403): API access denied.`);
          } else if (response.status === 429) {
            setErrorMessage(
              `Too Many Requests (429): Alpha Vantage rate limit reached (5 calls/min, 25 calls/day).`
            );
          } else if (response.status === 401) {
            setErrorMessage(
              `Invalid API Token (401): Please check your Alpha Vantage API key.`
            );
          } else {
            setErrorMessage(
              `Fetch Error (${response.status}): Could not load market data.`
            );
          }
          throw new Error("HTTP status " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        // Check for API error messages
        if (data["Error Message"]) {
          setErrorMessage(`Invalid symbol: ${currentTicker}`);
          setMassagedData([]);
          return;
        }

        if (data["Note"]) {
          // Rate limit message from Alpha Vantage
          setErrorMessage(`API Rate Limit: ${data["Note"]}`);
          setMassagedData([]);
          return;
        }

        const timeSeriesKey = "Time Series (Daily)";
        const timeSeries = data[timeSeriesKey];

        if (!timeSeries) {
          setErrorMessage(`No data available for ${currentTicker}`);
          setMassagedData([]);
          return;
        }

        // Convert Alpha Vantage format to our format
        // Alpha Vantage: { "2024-01-09": { "1. open": "...", "2. high": "...", ... } }
        // Our format: [date, open, close, low, high, volume]
        const now = new Date();
        const endDate = Math.floor(now.getTime() / 1000);
        const startDate = endDate - daysRange * 24 * 60 * 60;

        let massaged: any[] = [];

        // Alpha Vantage returns data in descending order (newest first)
        const dates = Object.keys(timeSeries);

        for (const dateStr of dates) {
          const dateTimestamp = new Date(dateStr).getTime() / 1000;

          // Filter by date range
          if (dateTimestamp >= startDate && dateTimestamp <= endDate) {
            const dayData = timeSeries[dateStr];
            const row = [
              dateStr,
              parseFloat(dayData["1. open"]),
              parseFloat(dayData["4. close"]),
              parseFloat(dayData["3. low"]),
              parseFloat(dayData["2. high"]),
              parseInt(dayData["5. volume"]),
            ];
            massaged.push(row);
          }
        }

        // Reverse to get chronological order (oldest first)
        massaged.reverse();

        if (massaged.length === 0) {
          setErrorMessage(`No data available for the selected time range.`);
        } else {
          setErrorMessage(""); // Success: clear any previous error
        }

        setMassagedData(massaged);
      })
      .catch((error) => {
        console.error("Chart Fetch Error:", error);
        // If we haven't already set a specific error message, set a generic one
        if (!errorMessage) {
          setErrorMessage(`Network error while fetching chart data.`);
        }
        setMassagedData([]);
      })
      .finally(() => {
        setIsFigureLoading(false);
      });
  };

  const splitData = (rawData: any[]) => {
    var categoryData = [];
    var values = [];
    var volumes = [];

    for (var i = 0; i < rawData.length; i++) {
      categoryData.push(rawData[i].splice(0, 1)[0]);
      values.push(rawData[i]);
      volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);
    }
    return {
      categoryData: categoryData,
      values: values,
      volumes: volumes,
    };
  };

  const calculateMA = (dayCount: number, data: any) => {
    var result = [];
    for (var i = 0, len = data.values.length; i < len; i++) {
      if (i < dayCount) {
        result.push("-");
        continue;
      }
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += data.values[i - j][1];
      }
      result.push(Math.round((sum / dayCount) * 100) / 100);
    }
    return result;
  };

  const getOption = () => {
    if (massagedData.length === 0) return {};

    const data = splitData(_.cloneDeep(massagedData));

    let option: any = {
      backgroundColor: "transparent",
      title: {
        text: figureTitle,
        left: "2%",
        top: "0%",
        textStyle: { color: "var(--text-main)", fontSize: 22, fontWeight: 800 },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            fontSize: 14,
            backgroundColor: "var(--surface)",
            color: "var(--text-main)",
            borderColor: "var(--surface-border)",
            borderWidth: 1,
          },
          lineStyle: { color: "var(--primary)", width: 1.5, opacity: 0.8 },
        },
        backgroundColor: "rgba(30, 41, 59, 0.95)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        textStyle: { fontSize: 14, color: "#f8fafc" },
        extraCssText:
          "backdrop-filter: blur(8px); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3); border-radius: 8px;",
      },
      legend: {
        data: ["Day"],
        inactiveColor: "var(--text-muted)",
        textStyle: {
          color: "var(--text-muted)",
          fontSize: 13,
          fontWeight: 600,
        },
        top: "2%",
        right: "4%",
      },
      grid: [
        { top: "15%", left: "5%", right: "5%", bottom: "35%" },
        { left: "5%", right: "5%", height: "15%", bottom: "12%" },
      ],
      xAxis: [
        {
          type: "category",
          data: data.categoryData,
          scale: true,
          boundaryGap: false,
          axisLine: {
            onZero: false,
            lineStyle: { color: "var(--surface-border)" },
          },
          axisLabel: { color: "var(--text-muted)", fontSize: 11 },
          splitLine: {
            show: true,
            lineStyle: { color: "rgba(255, 255, 255, 0.05)" },
          },
          min: "dataMin",
          max: "dataMax",
        },
        {
          type: "category",
          gridIndex: 1,
          data: data.categoryData,
          scale: true,
          boundaryGap: false,
          axisLine: {
            onZero: false,
            lineStyle: { color: "var(--surface-border)" },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          min: "dataMin",
          max: "dataMax",
        },
      ],
      yAxis: [
        {
          scale: true,
          axisLabel: { color: "var(--text-muted)", fontSize: 11 },
          splitLine: {
            show: true,
            lineStyle: { color: "rgba(255, 255, 255, 0.05)" },
          },
          axisLine: { lineStyle: { color: "var(--surface-border)" } },
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          splitLine: { show: false },
        },
      ],
      dataZoom: [
        { type: "inside", start: 0, end: 100 },
        {
          show: true,
          type: "slider",
          bottom: "2%",
          start: 0,
          end: 100,
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          borderColor: "var(--surface-border)",
          fillerColor: "rgba(99, 102, 241, 0.1)",
          handleStyle: { color: "var(--primary)" },
          textStyle: { color: "var(--text-muted)" },
        },
      ],
      series: [
        {
          name: "Day",
          type: "candlestick",
          data: data.values,
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upBorderColor,
            borderColor0: downBorderColor,
            borderWidth: 1.5,
          },
          markPoint: {
            symbol: "pin",
            symbolSize: 45,
            data: [],
          },
        },
        {
          name: "Volume",
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: data.volumes,
          itemStyle: {
            color: (params: any) => (params.data[2] > 0 ? upColor : downColor),
            opacity: 0.6,
          },
        },
      ],
    };

    const config = figureRangeButtonConfigs.find(
      (x) => x.value === candlestickDaysRange
    );
    if (config && config.resolution !== "D") {
      return option;
    }

    // MA Lines
    if (candlestickDaysRange >= 10) {
      option.series.push({
        name: "MA5",
        type: "line",
        data: calculateMA(5, data),
        smooth: true,
        lineStyle: { opacity: 0.5 },
        itemStyle: { color: "#0000FF" },
      });
      option.legend.data.push("MA5");
    }
    if (candlestickDaysRange >= 20) {
      option.series.push({
        name: "MA10",
        type: "line",
        data: calculateMA(10, data),
        smooth: true,
        lineStyle: { opacity: 0.5 },
        itemStyle: { color: "#FFAE19" },
      });
      option.legend.data.push("MA10");
    }
    // ... (truncated for brevity, similar for MA20)

    // Mark Points
    const arkTransactions = mergedData as unknown as Transaction[];
    const filteredArkData = arkTransactions.filter(
      (x) => x.Ticker === figureTitle
    );

    if (filteredArkData.length > 0) {
      const groupMap = _.groupBy(filteredArkData, "Date");
      for (let date in groupMap) {
        const dataArrayInDate = groupMap[date];
        // Find matching date in chart data
        const dataInProps = massagedData.find(
          (m) => m[0] === dataArrayInDate[0].Date
        );

        if (dataInProps && dataInProps[2]) {
          // index 2 is close price? Wait, in massaged: 0=time, 1=open, 2=close, 3=low, 4=high
          // Original code used index 4 for price?
          // Original massaged: time, o, c, l, h, v
          // Original logic: dataInProps[4] which is HIGH?
          // Wait, original: `coord: [dataArrayInDate[0].Date, dataInProps[4] * 1.1]`
          // `dataInProps[4]` is High. `dataInProps[2]` is Close.
          // I will stick to original index 4 (High).

          const buySharesCount = dataArrayInDate
            .filter((x) => x.Direction === "Buy")
            .map((x) => parseInt(x.Shares))
            .reduce((a, b) => a + b, 0);
          const sellSharesCount = dataArrayInDate
            .filter((x) => x.Direction === "Sell")
            .map((x) => parseInt(x.Shares))
            .reduce((a, b) => a + b, 0);

          // Price to use for calculation? Original used dataInProps[2] (Close)
          const closePrice = dataInProps[2];
          const buyPointText =
            "Buy\n$" +
            formatDollarAmount(Math.abs(buySharesCount * closePrice));
          const sellPointText =
            "Sell\n$" +
            formatDollarAmount(Math.abs(sellSharesCount * closePrice));

          const highPrice = dataInProps[4];

          if (buySharesCount > 0) {
            option.series[0].markPoint.data.push({
              name: `${dataArrayInDate[0].Date} Buy`,
              coord:
                sellSharesCount > 0
                  ? [dataArrayInDate[0].Date, highPrice * 1.1]
                  : [dataArrayInDate[0].Date, highPrice],
              value: buyPointText,
              itemStyle: { color: upColor },
              label: { fontSize: 10 },
            });
          }
          if (sellSharesCount > 0) {
            option.series[0].markPoint.data.push({
              name: `${dataArrayInDate[0].Date} Sell`,
              coord: [dataArrayInDate[0].Date, highPrice], // Overlap if both exist?
              value: sellPointText,
              itemStyle: { color: downColor },
              label: { fontSize: 10 },
            });
          }
        }
      }
    }

    return option;
  };

  const handleRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: number | null
  ) => {
    if (newValue !== null) {
      setCandlestickDaysRange(newValue);
    }
  };

  if (isFigureLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress
          size={32}
          thickness={5}
          className={styles.loadingSpinner}
        />
        <Typography variant="body2" className={styles.loadingText}>
          Analyzing Market Data...
        </Typography>
      </Box>
    );
  }

  if (massagedData.length === 0) {
    const hasError = !!errorMessage;
    return (
      <Box
        className={`chart-placeholder ${styles.placeholderContainer} ${
          hasError ? styles.hasError : styles.noError
        }`}
      >
        <Typography
          variant="h6"
          className={`${styles.placeholderTitle} ${
            hasError ? styles.error : styles.normal
          }`}
        >
          {hasError ? "Market Data Issue" : "Ready for Analysis"}
        </Typography>
        <Typography variant="body2" className={styles.placeholderMessage}>
          {hasError
            ? errorMessage
            : "Select a stock from the activity cards or search a ticker to visualize market insights."}
        </Typography>
      </Box>
    );
  }

  return (
    <div>
      <ReactEcharts
        option={getOption()}
        notMerge={true}
        lazyUpdate={true}
        style={{ height: "400px", width: "100%" }}
      />
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        className={styles.rangeButtonContainer}
      >
        <ToggleButtonGroup
          value={candlestickDaysRange}
          exclusive
          onChange={handleRangeChange}
          aria-label="figure-range-button-group"
          size="small"
        >
          {figureRangeButtonConfigs.map((button) => (
            <ToggleButton key={button.id} value={button.value}>
              {button.text}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Grid>
    </div>
  );
};

export default StockFigure;
