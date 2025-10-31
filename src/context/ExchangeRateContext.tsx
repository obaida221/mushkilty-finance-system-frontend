import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ExchangeRateContextType {
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  convertToIQD: (amount: number, currency: 'USD' | 'IQD') => number;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

export const useExchangeRate = () => {
  const context = useContext(ExchangeRateContext);
  if (!context) {
    throw new Error('useExchangeRate must be used within ExchangeRateProvider');
  }
  return context;
};

interface ExchangeRateProviderProps {
  children: ReactNode;
}

export const ExchangeRateProvider: React.FC<ExchangeRateProviderProps> = ({ children }) => {
  const [exchangeRate, setExchangeRateState] = useState<number>(1470); // Default exchange rate

  const setExchangeRate = (rate: number) => {
    if (rate > 0) {
      setExchangeRateState(rate);
      localStorage.setItem('exchangeRate', rate.toString());
    }
  };

  const convertToIQD = (amount: number, currency: 'USD' | 'IQD'): number => {
    if (currency === 'USD') {
      return amount * exchangeRate;
    }
    return amount;
  };

  React.useEffect(() => {
    const savedRate = localStorage.getItem('exchangeRate');
    if (savedRate) {
      setExchangeRateState(parseFloat(savedRate));
    }
  }, []);

  return (
    <ExchangeRateContext.Provider value={{ exchangeRate, setExchangeRate, convertToIQD }}>
      {children}
    </ExchangeRateContext.Provider>
  );
};
