import React from 'react';
import { Budget, Transaction } from '../../types';
import { expenseCategories } from '../../data/categories';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

type BudgetProgressProps = {
  budgets: Budget[];
  transactions: Transaction[];
  formatAmountWithCurrency: (amount: number) => string;
};

export default function BudgetProgress({ 
  budgets,
  transactions,
  formatAmountWithCurrency
}: BudgetProgressProps) {
  // Add error boundary
  try {
    if (!Array.isArray(budgets)) {
      console.error('Budgets is not an array:', budgets);
      return (
        <div className="text-center py-6 bg-red-50 rounded-lg">
          <p className="text-red-500">Error loading budgets. Please try refreshing the page.</p>
        </div>
      );
    }

    if (!Array.isArray(transactions)) {
      console.error('Transactions is not an array:', transactions);
      return (
        <div className="text-center py-6 bg-red-50 rounded-lg">
          <p className="text-red-500">Error loading transactions. Please try refreshing the page.</p>
        </div>
      );
    }

    if (!budgets?.length) {
      return (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No budgets to track</p>
        </div>
      );
    }
  
    // Calculate progress for each budget
    const budgetProgress = budgets.map(budget => {
      try {
        const category = expenseCategories.find(c => c.id === budget.categoryId);
        
        if (!category) {
          console.error(`Category not found for budget: ${budget.id}, categoryId: ${budget.categoryId}`);
          return null;
        }
        
        // Determine the date range for this budget period
        const now = new Date();
        let startDate: Date, endDate: Date;
        if (budget.period === 'monthly') {
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
        } else { // yearly
          startDate = startOfYear(now);
          endDate = endOfYear(now);
        }

        // Calculate total spent for this category in the period
        const totalSpent = transactions
          .filter(t => {
            try {
              return t.type === 'expense' && 
                     t.category.id === budget.categoryId &&
                     isWithinInterval(new Date(t.date), { start: startDate, end: endDate });
            } catch (err) {
              console.error('Error filtering transaction:', err, t);
              return false;
            }
          })
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        // Calculate percentage
        const percentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;
        
        return {
          ...budget,
          category,
          totalSpent,
          percentage,
          remaining: budget.amount - totalSpent
        };
      } catch (err) {
        console.error('Error processing budget:', err, budget);
        return null;
      }
    }).filter(Boolean); // Remove any null entries from errors
  
    return (
      <div className="space-y-4">
        {budgetProgress.map((budget) => {
          if (!budget) return null;
          return (
            <div 
              key={budget.id} 
              className={cn(
                "border rounded-lg p-4 transition-colors",
                budget.percentage >= 100 ? "border-red-200 bg-red-50" :
                budget.percentage >= 90 ? "border-yellow-200 bg-yellow-50" :
                budget.percentage >= 80 ? "border-orange-200 bg-orange-50" :
                "border-gray-200"
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className={cn(
                    "p-2 rounded-full mr-3",
                    budget.category?.color || 'bg-gray-500'
                  )}>
                    {budget.percentage >= 100 ? <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" /> : 
                     budget.percentage >= 90 ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> : 
                     budget.percentage >= 80 ? <AlertTriangle className="h-5 w-5 text-orange-500" /> : 
                     <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                  <div>
                    <h4 className="font-medium">{budget.category?.name || 'Unknown Category'}</h4>
                    <p className="text-xs text-gray-500 capitalize">{budget.period} budget</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatAmountWithCurrency(budget.totalSpent)} / {formatAmountWithCurrency(budget.amount)}
                  </p>
                  <p className={cn(
                    "text-xs font-medium",
                    budget.remaining >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {budget.remaining >= 0 
                      ? `${formatAmountWithCurrency(budget.remaining)} remaining` 
                      : `${formatAmountWithCurrency(Math.abs(budget.remaining))} over budget`}
                  </p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
                <div 
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-500 ease-out", 
                    budget.percentage >= 100 ? 'bg-red-500' : 
                    budget.percentage >= 90 ? 'bg-yellow-500' : 
                    budget.percentage >= 80 ? 'bg-orange-500' : 
                    'bg-green-500'
                  )} 
                  style={{ 
                    width: `${Math.min(budget.percentage, 100)}%`,
                    transition: 'width 0.5s ease-out'
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <p className={cn("text-xs font-medium", 
                  budget.percentage >= 100 ? 'text-red-700' : 
                  budget.percentage >= 90 ? 'text-yellow-700' : 
                  budget.percentage >= 80 ? 'text-orange-700' : 
                  'text-green-700'
                )}>
                  {budget.percentage.toFixed(0)}% used
                </p>
                
                {budget.percentage >= 80 && (
                  <div className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    budget.percentage >= 100 ? 'bg-red-100 text-red-700' : 
                    budget.percentage >= 90 ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-orange-100 text-orange-700',
                    budget.percentage >= 100 && "animate-pulse"
                  )}>
                    {budget.percentage >= 100 
                      ? 'Over budget!' 
                      : budget.percentage >= 90 
                        ? 'Almost maxed!' 
                        : 'Getting close!'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  } catch (err) {
    console.error('Error rendering BudgetProgress:', err);
    return (
      <div className="text-center py-6 bg-red-50 rounded-lg">
        <p className="text-red-500">Error rendering budget progress. Please try refreshing the page.</p>
      </div>
    );
  }
}