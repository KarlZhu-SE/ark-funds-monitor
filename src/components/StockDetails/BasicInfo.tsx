"use client";

import React, { useEffect, useState } from "react";
import { CircularProgress, Typography, Box, Grid } from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import { getBasicInfoUrl, token } from "../../shared/constants";
import styles from "./BasicInfo.module.scss";

const BasicInfo = () => {
  const { ticker, setErrorMessage } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (ticker) {
      getBasicInfo(ticker);
    } else {
      setShowInfo(false);
    }
  }, [ticker]);

  const getBasicInfo = (currentTicker: string) => {
    setErrorMessage("");
    setIsLoading(true);
    const url = `${getBasicInfoUrl}symbol=${currentTicker}&token=${token}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setCompanyInfo(data);
          setShowInfo(true);
        } else {
          setErrorMessage(`API returned 'NO DATA' for ${currentTicker}`);
          setShowInfo(false);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  if (!showInfo || !companyInfo) return null;

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.ticker}>
          {ticker}
        </Typography>
        <Typography variant="h5" className={styles.companyName}>
          {companyInfo.name}
        </Typography>
      </Box>

      <Box className={styles.contentWrapper}>
        {companyInfo.logo && (
          <Box
            component="a"
            href={companyInfo.weburl}
            target="_blank"
            rel="noreferrer"
            className={styles.logoLink}
          >
            <img
              src={companyInfo.logo}
              alt="Company Logo"
              className={styles.logoImage}
            />
          </Box>
        )}

        <Grid container spacing={2} className={styles.infoGrid}>
          {[
            { label: "Industry", value: companyInfo.finnhubIndustry },
            { label: "IPO Date", value: companyInfo.ipo },
            { label: "Exchange", value: companyInfo.exchange },
            {
              label: "Market Cap",
              value: `${companyInfo.marketCapitalization}M`,
            },
            { label: "Shares", value: `${companyInfo.shareOutstanding}M` },
          ].map((item) => (
            <Grid item xs={12} sm={6} key={item.label}>
              <Typography variant="caption" className={styles.infoLabel}>
                {item.label}
              </Typography>
              <Typography variant="body1" className={styles.infoValue}>
                {item.value || "N/A"}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default BasicInfo;
