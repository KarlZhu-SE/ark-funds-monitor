"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { dateService } from "../../utils/date-service";
import styles from "./NewsCard.module.scss";

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
    <Card className={styles.card} onClick={handleClickNews} elevation={0}>
      <CardContent className={styles.cardContent}>
        <Box className={styles.contentLayout}>
          <Box className={styles.textContent}>
            <Typography variant="h6" component="h3" className={styles.headline}>
              {newsDetails.headline}
            </Typography>

            <Typography className={styles.metadata}>
              {newsDetails.source} •{" "}
              {dateService.timeSince(newsDetails.datetime)}
            </Typography>

            <Typography variant="body2" className={styles.summary}>
              {newsDetails.summary.length > MAX_LENGTH ? (
                <>
                  {`${newsDetails.summary.substring(0, MAX_LENGTH)}... `}
                  <span className={styles.readMore}>Read more</span>
                </>
              ) : (
                newsDetails.summary
              )}
            </Typography>
          </Box>

          {newsDetails.image && (
            <Box className={styles.imageContainer}>
              <img
                src={newsDetails.image}
                alt="News"
                className={styles.newsImage}
              />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
