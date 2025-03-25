import React from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Globe
} from 'lucide-react';
import { Transaction, Currency, ExchangeRates } from '../types';
import { format } from 'date-fns';
import ExchangeRateInfo from './ExchangeRateInfo';
import ExportPDF from './ExportPDF';

type DashboardProps = {
  transactions: Transaction[];
  baseCurrency: Currency;
  exchangeRates: ExchangeRates;
  lastUpdated: Date | null;
  isLoadingRates: boolean;
  ratesError: string | null;
  onRefreshRates: () => void;
  formatAmountWithCurrency: (amount: number, currencyCode?: string) => string;
};

export default function Dashboard({ 
  transactions, 
  baseCurrency,
  exchangeRates,
  lastUpdated,
  isLoadingRates,
  ratesError,
  onRefreshRates,
  formatAmountWithCurrency
}: DashboardProps) {
  // Calculate total income
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate total expenses
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate balance
  const balance = totalIncome - totalExpenses;
  
  // Get recent transactions (last 3)
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Financial Overview</h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-blue-500 mr-1" />
            <span className="text-sm font-medium text-blue-700">
              Base: {baseCurrency.code} ({baseCurrency.symbol})
            </span>
          </div>
          <ExportPDF 
            transactions={transactions}
            baseCurrency={baseCurrency}
            formatAmountWithCurrency={formatAmountWithCurrency}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Current Balance</h3>
            <Wallet className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold">{formatAmountWithCurrency(balance)}</p>
        </div>
        
        {/* Income Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Total Income</h3>
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold">{formatAmountWithCurrency(totalIncome)}</p>
        </div>
        
        {/* Expenses Card */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Total Expenses</h3>
            <TrendingDown className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold">{formatAmountWithCurrency(totalExpenses)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
          
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500">No recent transactions</p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex justify-between items-center p-3 border border-gray-100 rounded-md"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${transaction.category.color}`}>
                      {transaction.type === 'expense' ? (
                        <ArrowDownRight className="h-4 w-4 text-white" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center">
                        <p className="text-xs text-gray-500">{format(transaction.date, 'MMM d, yyyy')}</p>
                        {transaction.currency && transaction.currency !== baseCurrency.code && (
                          <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {transaction.currency}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {transaction.originalAmount 
                      ? formatAmountWithCurrency(transaction.originalAmount, transaction.currency)
                      : formatAmountWithCurrency(transaction.amount, transaction.currency || baseCurrency.code)
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Exchange Rates Panel */}
        <div className="md:col-span-1">
          <ExchangeRateInfo
            baseCurrency={baseCurrency}
            exchangeRates={exchangeRates}
            lastUpdated={lastUpdated}
            isLoading={isLoadingRates}
            error={ratesError}
            onRefresh={onRefreshRates}
          />
        </div>
      </div>
    </div>
  );
}