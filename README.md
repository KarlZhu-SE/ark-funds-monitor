# ARK Funds Monitor

A small React app to monitor ARK funds daily transactions.

Like this repo? Please give this repo a star ⭐ ⬆️.

Github Pages: https://karlzhu-se.github.io/ark-funds-monitor/

Feel free to raise a Github issue if you have any suggestions or findings.

I authorize anyone to use my repo, if so, please indicate the source and the original author on your website.
Please follow AGPL 3.0 license and publish your source code in open source community if the website is facing the crowd.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

This application uses two APIs for real-time stock data:

- **Alpha Vantage** - Stock price data and company information
- **Finnhub** - Additional market data

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Get your free API keys:

   - Alpha Vantage: [Get API Key](https://www.alphavantage.co/support/#api-key)
   - Finnhub: [Register for API Key](https://finnhub.io/register)

3. Open `.env.local` and add your actual API keys:
   ```
   NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_actual_alpha_vantage_key
   NEXT_PUBLIC_FINNHUB_TOKEN=your_actual_finnhub_token
   ```

**Important:** Never commit `.env.local` to version control. It's already included in `.gitignore`.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to GitHub Pages

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Setting Up GitHub Secrets

For the deployment to work, you need to configure your API keys as GitHub Secrets:

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

   | Secret Name             | Value                      |
   | ----------------------- | -------------------------- |
   | `ALPHA_VANTAGE_API_KEY` | Your Alpha Vantage API key |
   | `FINNHUB_TOKEN`         | Your Finnhub token         |

### Automatic Deployment

Once secrets are configured:

- Every push to the `master` branch triggers the GitHub Actions workflow
- The workflow builds the static site with your API keys injected
- The built site is deployed to the `gh-pages` branch
- GitHub Pages serves the site from the `gh-pages` branch

### Manual Deployment

To test the build locally before pushing:

```bash
npm run build
```

This creates a static export in the `out` folder.

### Important Notes

> [!WARNING] > **API Key Visibility**: Since GitHub Pages serves static files, your API keys will be embedded in the JavaScript bundles and visible to anyone who inspects the network traffic. This is acceptable for free-tier API keys with rate limits, but **do not use this approach for sensitive production API keys**.

> [!TIP]
> For production applications with sensitive keys, consider using a backend proxy server or deploying to platforms like Vercel/Netlify with serverless functions.

## Disclaimer

This website is updated/maintained out of my personal hobby. I am not affiliated with ARK Invest.
Original data sets come from ARK funds daily email. The data could be inaccurate.
This website is intended for educational purposes only.
The author takes no responsibility for financial decisions made using the data on this website.

Thanks to David Sun, added 08/05 - 08/17 data and 11/12/2019 - 08/05/2020 data..
