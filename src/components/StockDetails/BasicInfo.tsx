"use client";

import React, { useEffect, useState } from "react";
import { CircularProgress, Typography, Box, Grid } from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import { getBasicInfoUrl, token } from "../../shared/constants";

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
    <Box
      sx={{
        p: { xs: 1, md: 2 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "var(--primary)",
            letterSpacing: "-0.02em",
          }}
        >
          {ticker}
        </Typography>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "var(--text-main)" }}
        >
          {companyInfo.name}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 4,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {companyInfo.logo && (
          <Box
            component="a"
            href={companyInfo.weburl}
            target="_blank"
            rel="noreferrer"
            sx={{
              p: 2,
              background: "#fff",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <img
              src={companyInfo.logo}
              alt="Company Logo"
              style={{ maxWidth: "80px", maxHeight: "80px" }}
            />
          </Box>
        )}

        <Grid container spacing={2} sx={{ flex: 1, minWidth: "200px" }}>
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
              <Typography
                variant="caption"
                sx={{
                  color: "var(--text-muted)",
                  display: "block",
                  mb: 0.5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "var(--text-main)", fontWeight: 600 }}
              >
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
