import React from 'react';
import { format } from 'date-fns';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { ExchangeRates, Currency } from '../types';
import { cn } from '../utils/cn';

type ExchangeRateInfoProps = {
  baseCurrency: Currency;
  exchangeRates: ExchangeRates;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export default function ExchangeRateInfo({
  baseCurrency,
  exchangeRates,
  lastUpdated,
  isLoading,
  error,
  onRefresh
}: ExchangeRateInfoProps) {
  // Select a few popular currencies to display
  const popularCurrencies = ['EUR', 'GBP', 'JPY', 'CAD', 'INR'];
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">Exchange Rates</h3>
        <div className="flex items-center">
          {lastUpdated && (
            <span className="text-xs text-gray-500 mr-2">
              Updated: {format(lastUpdated, 'MMM d, h:mm a')}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
            title="Refresh exchange rates"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-100 rounded-md text-xs text-yellow-700 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-600 mb-2">
        Base currency: <span className="font-medium">{baseCurrency.code} ({baseCurrency.symbol})</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {popularCurrencies.map(code => {
          if (code === baseCurrency.code) return null;
          const rate = exchangeRates[code];
          if (!rate) return null;
          
          return (
            <div key={code} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
              <span className="font-medium">{code}</span>
              <span>{rate.toFixed(4)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}