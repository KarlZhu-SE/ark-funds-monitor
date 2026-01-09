"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { dateService } from "../../utils/date-service";

interface NewsCardProps {
  newsDetails: {
    id: number;
    headline: string;
    datetime: number;
    source: string;
    summary: string;
    url: string;
    image?: string;
  };
}

const NewsCard = ({ newsDetails }: NewsCardProps) => {
  const MAX_LENGTH = 180;

  const handleClickNews = () => {
    window.open(newsDetails.url, "_blank");
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: "pointer",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        transition: "all 0.3s ease",
        "&:hover": {
          background: "rgba(255, 255, 255, 0.06)",
          borderColor: "rgba(99, 102, 241, 0.3)",
          transform: "translateX(4px)",
        },
      }}
      onClick={handleClickNews}
      elevation={0}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--text-main)",
                mb: 1,
                lineHeight: 1.3,
              }}
            >
              {newsDetails.headline}
            </Typography>

            <Typography
              sx={{
                color: "var(--primary)",
                fontSize: "0.75rem",
                fontWeight: 600,
                mb: 1,
                textTransform: "uppercase",
              }}
            >
              {newsDetails.source} •{" "}
              {dateService.timeSince(newsDetails.datetime)}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "var(--text-muted)",
                lineHeight: 1.5,
                fontSize: "0.875rem",
              }}
            >
              {newsDetails.summary.length > MAX_LENGTH ? (
                <>
                  {`${newsDetails.summary.substring(0, MAX_LENGTH)}... `}
                  <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                    Read more
                  </span>
                </>
              ) : (
                newsDetails.summary
              )}
            </Typography>
          </Box>

          {newsDetails.image && (
            <Box
              sx={{
                width: { xs: 0, sm: 100 },
                height: 100,
                borderRadius: "8px",
                overflow: "hidden",
                flexShrink: 0,
                display: { xs: "none", sm: "block" },
              }}
            >
              <img
                src={newsDetails.image}
                alt="News"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
