export interface StockData {
    ticker: string;
    name: string;
    noOfBuy: number;
    noOfSell: number;
    noOfTransactions: number;
    directionSymbols: string[];
    transactionsDetails: any[];
}

export interface Transaction {
    FUND: string;
    Date: string;
    Direction: string;
    Ticker: string;
    CUSIP: string;
    Name: string;
    Shares: string;
    "% of ETF": string;
}
