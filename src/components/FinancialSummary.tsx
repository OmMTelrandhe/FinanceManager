import React, { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Transaction, Category } from '../types';
import PieChart from './charts/PieChart';
import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '../utils/cn';

type FinancialSummaryProps = {
  transactions: Transaction[];
  formatAmountWithCurrency: (amount: number, currencyCode?: string) => string;
};

type TimeFrame = 'monthly' | 'yearly';
type ChartType = 'category' | 'trend';

export default function FinancialSummary({ 
  transactions,
  formatAmountWithCurrency
}: FinancialSummaryProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly');
  const [chartType, setChartType] = useState<ChartType>('category');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Navigate to previous period
  const goToPrevious = () => {
    if (timeFrame === 'monthly') {
      setCurrentDate(prevDate => subMonths(prevDate, 1));
    } else {
      setCurrentDate(prevDate => new Date(prevDate.getFullYear() - 1, prevDate.getMonth(), 1));
    }
  };
  
  // Navigate to next period
  const goToNext = () => {
    if (timeFrame === 'monthly') {
      setCurrentDate(prevDate => subMonths(prevDate, -1));
    } else {
      setCurrentDate(prevDate => new Date(prevDate.getFullYear() + 1, prevDate.getMonth(), 1));
    }
  };
  
  // Format the current period for display
  const formatPeriod = () => {
    if (timeFrame === 'monthly') {
      return format(currentDate, 'MMMM yyyy');
    } else {
      return format(currentDate, 'yyyy');
    }
  };
  
  // Filter transactions based on the selected time frame
  const getFilteredTransactions = () => {
    if (timeFrame === 'monthly') {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      
      return transactions.filter(transaction => 
        isWithinInterval(transaction.date, { start: startDate, end: endDate })
      );
    } else {
      const year = currentDate.getFullYear();
      return transactions.filter(transaction => 
        transaction.date.getFullYear() === year
      );
    }
  };
  
  const filteredTransactions = getFilteredTransactions();
  
  // Prepare data for category pie chart
  const getCategoryChartData = () => {
    const expensesByCategory: Record<string, number> = {};
    const expenseCategories: Record<string, Category> = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const categoryId = transaction.category.id;
        expensesByCategory[categoryId] = (expensesByCategory[categoryId] || 0) + transaction.amount;
        expenseCategories[categoryId] = transaction.category;
      });
    
    return Object.entries(expensesByCategory)
      .map(([categoryId, amount]) => ({
        name: expenseCategories[categoryId].name,
        value: amount,
        category: expenseCategories[categoryId]
      }))
      .sort((a, b) => b.value - a.value);
  };
  
  // Prepare data for monthly trend chart
  const getTrendChartData = () => {
    if (timeFrame === 'monthly') {
      // For monthly view, show daily expenses
      const daysInMonth = endOfMonth(currentDate).getDate();
      const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const dateStr = format(currentDate, `yyyy-MM-${dayStr}`);
        
        // Get expenses and income for this day
        const dayTransactions = filteredTransactions.filter(t => 
          format(t.date, 'yyyy-MM-dd') === dateStr
        );
        
        const expenses = dayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const income = dayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          name: `${day}`,
          expenses,
          income
        };
      });
      
      return dailyData;
    } else {
      // For yearly view, show monthly expenses
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = i;
        const monthDate = new Date(currentDate.getFullYear(), month, 1);
        const monthName = format(monthDate, 'MMM');
        
        // Get expenses and income for this month
        const monthTransactions = transactions.filter(t => 
          t.date.getFullYear() === currentDate.getFullYear() && 
          t.date.getMonth() === month
        );
        
        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          name: monthName,
          expenses,
          income
        };
      });
      
      return monthlyData;
    }
  };
  
  // Calculate summary statistics
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  
  // Get top spending category
  const topCategory = getCategoryChartData()[0]?.name || 'N/A';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Financial Summary</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeFrame('monthly')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium",
              timeFrame === 'monthly' 
                ? "bg-blue-100 text-blue-700" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeFrame('yearly')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium",
              timeFrame === 'yearly' 
                ? "bg-blue-100 text-blue-700" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Yearly
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <span className="font-medium text-lg">{formatPeriod()}</span>
          </div>
          
          <button
            onClick={goToNext}
            className="p-1 rounded-full hover:bg-gray-100"
            disabled={new Date() < currentDate}
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('category')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium",
              chartType === 'category' 
                ? "bg-indigo-100 text-indigo-700" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Categories
          </button>
          <button
            onClick={() => setChartType('trend')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium",
              chartType === 'trend' 
                ? "bg-indigo-100 text-indigo-700" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <TrendingUp className="h-4 w-4 mr-1 inline-block" />
            Trends
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 className="text-sm font-medium text-blue-700 mb-1">Total Transactions</h3>
          <p className="text-2xl font-bold text-blue-900">{filteredTransactions.length}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <h3 className="text-sm font-medium text-green-700 mb-1">Total Income</h3>
          <p className="text-2xl font-bold text-green-900">{formatAmountWithCurrency(totalIncome)}</p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <h3 className="text-sm font-medium text-red-700 mb-1">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-900">{formatAmountWithCurrency(totalExpenses)}</p>
        </div>
        
        <div className={cn(
          "rounded-lg p-4 border",
          balance >= 0 
            ? "bg-emerald-50 border-emerald-100" 
            : "bg-amber-50 border-amber-100"
        )}>
          <h3 className={cn(
            "text-sm font-medium mb-1",
            balance >= 0 ? "text-emerald-700" : "text-amber-700"
          )}>
            Net Balance
          </h3>
          <p className={cn(
            "text-2xl font-bold",
            balance >= 0 ? "text-emerald-900" : "text-amber-900"
          )}>
            {formatAmountWithCurrency(balance)}
          </p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartType === 'category' ? (
          <>
            <div>
              <PieChart 
                data={getCategoryChartData()} 
                title="Expenses by Category"
                formatValue={(value) => formatAmountWithCurrency(value)}
              />
              
              {/* {getCategoryChartData().length > 0 && (
                // <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                //   <h4 className="text-sm font-medium text-indigo-700 mb-2">Spending Insights</h4>
                //   <p className="text-sm text-indigo-900">
                //     Your top spending category is <span className="font-bold">{topCategory}</span>, 
                //     accounting for {((getCategoryChartData()[0]?.value / totalExpenses) * 100).toFixed(0)}% 
                //     of your total expenses this {timeFrame === 'monthly' ? 'month' : 'year'}.
                //   </p>
                // </div>
              )} */}
            </div>
            
            <BarChart 
              data={getCategoryChartData().slice(0, 5)} 
              bars={[
                { dataKey: 'value', color: '#8884d8', name: 'Amount' }
              ]}
              title="Top 5 Expense Categories"
              formatYAxis={(value) => formatAmountWithCurrency(value).split('.')[0]}
              formatTooltip={(value) => formatAmountWithCurrency(value)}
            />
          </>
        ) : (
          <>
            <LineChart 
              data={getTrendChartData()} 
              lines={[
                { dataKey: 'expenses', color: '#FF8042', name: 'Expenses' },
                { dataKey: 'income', color: '#00C49F', name: 'Income' }
              ]}
              title={`${timeFrame === 'monthly' ? 'Daily' : 'Monthly'} Income vs Expenses`}
              formatYAxis={(value) => formatAmountWithCurrency(value).split('.')[0]}
              formatTooltip={(value) => formatAmountWithCurrency(value)}
            />
            
            <BarChart 
              data={getTrendChartData()} 
              bars={[
                { dataKey: 'expenses', color: '#FF8042', name: 'Expenses' },
                { dataKey: 'income', color: '#00C49F', name: 'Income' }
              ]}
              title={`${timeFrame === 'monthly' ? 'Daily' : 'Monthly'} Comparison`}
              formatYAxis={(value) => formatAmountWithCurrency(value).split('.')[0]}
              formatTooltip={(value) => formatAmountWithCurrency(value)}
            />
          </>
        )}
      </div>
      
      {/* AI Insights */}
      {filteredTransactions.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              {/* <h3 className="text-lg font-semibold text-blue-800 mb-2">AI Financial Insights</h3> */}
              <div className="space-y-2 text-sm text-blue-700">
                {balance < 0 && (
                  <p>
                    <span className="font-medium">⚠️ Spending Alert:</span> Your expenses exceed your income by {formatAmountWithCurrency(Math.abs(balance))} 
                    this {timeFrame === 'monthly' ? 'month' : 'year'}. Consider reducing non-essential expenses.
                  </p>
                )}
                
                {balance > 0 && totalIncome > 0 && (
                  <p>
                    <span className="font-medium">💰 Savings Rate:</span> You're saving {((balance / totalIncome) * 100).toFixed(0)}% 
                    of your income this {timeFrame === 'monthly' ? 'month' : 'year'}.
                    {((balance / totalIncome) * 100) > 20 
                      ? ' Great job maintaining a healthy savings rate!'
                      : ' Consider increasing your savings rate to at least 20% for better financial security.'}
                  </p>
                )}
                
                {getCategoryChartData().length > 0 && (
                  <p>
                    <span className="font-medium">📊 Category Analysis:</span> Your spending on {topCategory} 
                    {((getCategoryChartData()[0]?.value / totalExpenses) * 100) > 30
                      ? ' seems high at ' 
                      : ' is at '}
                    {((getCategoryChartData()[0]?.value / totalExpenses) * 100).toFixed(0)}% of total expenses.
                    {((getCategoryChartData()[0]?.value / totalExpenses) * 100) > 30
                      ? ' Consider setting a budget for this category.'
                      : ''}
                  </p>
                )}
                
                {timeFrame === 'monthly' && getTrendChartData().length > 0 && (
                  <p>
                    <span className="font-medium">📅 Spending Pattern:</span> Your highest spending 
                    {(() => {
                      const dailyData = getTrendChartData();
                      const maxDay = dailyData.reduce((max, day) => 
                        day.expenses > max.expenses ? day : max, 
                        { name: '0', expenses: 0 }
                      );
                      return ` was on day ${maxDay.name} with ${formatAmountWithCurrency(maxDay.expenses)}.`;
                    })()}
                  </p>
                )}
                
                {timeFrame === 'yearly' && getTrendChartData().length > 0 && (
                  <p>
                    <span className="font-medium">🗓️ Monthly Trend:</span> Your highest spending month 
                    {(() => {
                      const monthlyData = getTrendChartData();
                      const maxMonth = monthlyData.reduce((max, month) => 
                        month.expenses > max.expenses ? month : max, 
                        { name: '', expenses: 0 }
                      );
                      return ` was ${maxMonth.name} with ${formatAmountWithCurrency(maxMonth.expenses)}.`;
                    })()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}