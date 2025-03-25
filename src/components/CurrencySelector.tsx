import React from 'react';
import { Currency } from '../types';
import { cn } from '../utils/cn';
import { Globe } from 'lucide-react';

type CurrencySelectorProps = {
  currencies: Currency[];
  selectedCurrency: Currency;
  onChange: (currencyCode: string) => void;
  className?: string;
};

export default function CurrencySelector({
  currencies,
  selectedCurrency,
  onChange,
  className
}: CurrencySelectorProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Globe className="h-5 w-5 text-gray-400" />
      </div>
      <select
        value={selectedCurrency.code}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:ring-2 focus:outline-none"
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.name} ({currency.symbol})
          </option>
        ))}
      </select>
    </div>
  );
}