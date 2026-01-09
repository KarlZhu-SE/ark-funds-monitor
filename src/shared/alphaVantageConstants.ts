// Alpha Vantage API Configuration
// Read API key from environment variable
export const alphaVantageApiKey =
  process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || "";

// Validate API key is configured
if (!alphaVantageApiKey) {
  console.error(
    "⚠️ NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY is not set. " +
      "Please create a .env.local file with your API key. " +
      "See .env.example for reference."
  );
}

export const alphaVantageBaseUrl = "https://www.alphavantage.co/query";

// Alpha Vantage function for daily time series (OHLC data)
export const alphaVantageFunction = "TIME_SERIES_DAILY";

// Note: Alpha Vantage free tier limits:
// - 25 API calls per day
// - 5 API calls per minute
// - Full output size returns 20+ years of data
// - Compact output size returns last 100 data points
