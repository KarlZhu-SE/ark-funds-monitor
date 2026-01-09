'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  ticker: string;
  setTicker: (ticker: string) => void;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
  mostActiveDaysRange: number;
  setMostActiveDaysRange: (days: number) => void;
  candlestickDaysRange: number;
  setCandlestickDaysRange: (days: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [ticker, setTicker] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [mostActiveDaysRange, setMostActiveDaysRange] = useState<number>(7);
  const [candlestickDaysRange, setCandlestickDaysRange] = useState<number>(30);

  return (
    <AppContext.Provider
      value={{
        ticker,
        setTicker,
        errorMessage,
        setErrorMessage,
        mostActiveDaysRange,
        setMostActiveDaysRange,
        candlestickDaysRange,
        setCandlestickDaysRange,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
