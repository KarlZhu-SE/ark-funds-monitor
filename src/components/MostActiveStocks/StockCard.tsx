"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Box, Chip, Stack, alpha } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useAppContext } from "../../context/AppContext";
import { StockData } from "../../types";
import styles from "./StockCard.module.scss";

interface StockCardProps {
  data: StockData;
  backgroundColor: string;
}

const StockCard = ({ data, backgroundColor }: StockCardProps) => {
  const { setTicker } = useAppContext();

  const handleClickTicker = () => {
    setTicker(data.ticker);
  };

  return (
    <Card
      elevation={0}
      className={styles.card}
      onClick={handleClickTicker}
      sx={{
        "&:hover": {
          borderColor: alpha(backgroundColor, 0.4),
          boxShadow: `0 12px 24px -10px ${alpha(backgroundColor, 0.3)}`,
        },
      }}
    >
      <Box
        className={styles.cardAccent}
        style={{ background: backgroundColor }}
      />

      <CardContent className={styles.cardContent}>
        <Box className={styles.header}>
          <Typography variant="h5" component="div" className={styles.ticker}>
            {data.ticker}
          </Typography>
          <Box className={styles.icon} style={{ color: backgroundColor }}>
            {backgroundColor.includes("C805") ? (
              <TrendingUpIcon />
            ) : backgroundColor.includes("5000") ? (
              <TrendingDownIcon />
            ) : (
              <SwapHorizIcon />
            )}
          </Box>
        </Box>

        <Typography
          variant="body2"
          className={styles.companyName}
          title={data.name}
        >
          {data.name}
        </Typography>

        <Stack spacing={1.2} className={styles.statsStack}>
          <Box className={styles.statRow}>
            <Typography variant="caption" className={styles.statLabel}>
              Transactions
            </Typography>
            <Typography variant="subtitle2" className={styles.statValue}>
              {data.noOfTransactions}
            </Typography>
          </Box>
          <Box className={styles.statRow}>
            <Typography variant="caption" className={styles.buyLabel}>
              Buys
            </Typography>
            <Typography variant="subtitle2" className={styles.buyValue}>
              {data.noOfBuy}
            </Typography>
          </Box>
          <Box className={styles.statRow}>
            <Typography variant="caption" className={styles.sellLabel}>
              Sells
            </Typography>
            <Typography variant="subtitle2" className={styles.sellValue}>
              {data.noOfSell}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StockCard;
