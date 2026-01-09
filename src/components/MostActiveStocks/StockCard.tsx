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
      sx={{
        m: 1,
        minWidth: 240,
        maxWidth: 240,
        cursor: "pointer",
        borderRadius: "16px",
        background: "var(--surface)",
        border: "1px solid var(--surface-border)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-6px)",
          borderColor: alpha(backgroundColor, 0.4),
          boxShadow: `0 12px 24px -10px ${alpha(backgroundColor, 0.3)}`,
          "& .card-accent": {
            height: "100%",
          },
        },
      }}
      onClick={handleClickTicker}
    >
      <Box
        className="card-accent"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "4px",
          height: "40px",
          background: backgroundColor,
          transition: "all 0.3s ease",
          borderRadius: "0 4px 4px 0",
        }}
      />

      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 800,
              color: "var(--text-main)",
              letterSpacing: "-0.02em",
            }}
          >
            {data.ticker}
          </Typography>
          <Box sx={{ color: backgroundColor, opacity: 0.8 }}>
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
          sx={{
            mb: 2.5,
            height: 44,
            color: "var(--text-muted)",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.4,
            fontSize: "0.85rem",
          }}
          title={data.name}
        >
          {data.name}
        </Typography>

        <Stack spacing={1.2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="caption"
              sx={{ color: "var(--text-muted)", fontWeight: 500 }}
            >
              Transactions
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ color: "var(--text-main)", fontWeight: 700 }}
            >
              {data.noOfTransactions}
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="caption"
              sx={{ color: "var(--success)", opacity: 0.9, fontWeight: 500 }}
            >
              Buys
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ color: "var(--success)", fontWeight: 700 }}
            >
              {data.noOfBuy}
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="caption"
              sx={{ color: "var(--error)", opacity: 0.9, fontWeight: 500 }}
            >
              Sells
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ color: "var(--error)", fontWeight: 700 }}
            >
              {data.noOfSell}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StockCard;
