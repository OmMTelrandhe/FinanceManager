import React from 'react';
import { cn } from '../utils/cn';

type CurrencyBadgeProps = {
  currencyCode: string;
  className?: string;
};

export default function CurrencyBadge({ currencyCode, className }: CurrencyBadgeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800",
        className
      )}
    >
      {currencyCode}
    </span>
  );
}