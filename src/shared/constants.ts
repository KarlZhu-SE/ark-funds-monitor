// Finnhub API Configuration
// Read token from environment variable
export const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN || "";

// Validate token is configured
if (!token) {
  console.error(
    "⚠️ NEXT_PUBLIC_FINNHUB_TOKEN is not set. " +
      "Please create a .env.local file with your Finnhub token. " +
      "See .env.example for reference."
  );
}

export const getCandleUrl = "https://finnhub.io/api/v1/stock/candle?";
export const getBasicInfoUrl = "https://finnhub.io/api/v1/stock/profile2?";
export const getCompanyNewsUrl = "https://finnhub.io/api/v1/company-news?";
