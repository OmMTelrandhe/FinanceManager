import React from 'react';
import { Budget, Category, Transaction } from '../../types';
import { expenseCategories } from '../../data/categories';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { Edit, Trash2, Calendar, IndianRupee, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCurrency } from '../../hooks/useCurrency';

type BudgetListProps = {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  formatAmountWithCurrency: (amount: number) => string;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
};

export default function BudgetList({ 
  budgets, 
  categories,
  transactions,
  formatAmountWithCurrency,
  onEdit,
  onDelete
}: BudgetListProps) {
  const { baseCurrency } = useCurrency();

  if (!budgets?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No budgets found</p>
        <p className="text-sm text-gray-400 mt-1">Create a budget to start tracking your spending</p>
      </div>
    );
  }

  const calculateSpentAmount = (budget: Budget) => {
    const now = new Date();
    let startDate: Date, endDate: Date;
    
    if (budget.period === 'monthly') {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
    }

    return transactions
      ?.filter(t => 
        t?.type === 'expense' && 
        t?.category?.id === budget.categoryId &&
        isWithinInterval(new Date(t.date), { start: startDate, end: endDate })
      )
      .reduce((sum, t) => sum + (t?.amount || 0), 0) || 0;
  };

  // Get category details and spending for each budget
  const budgetsWithDetails = budgets.map(budget => {
    const category = categories.find(c => c.id === budget.categoryId);
    const spentAmount = calculateSpentAmount(budget);
    const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
    return { ...budget, category, spentAmount, percentage };
  });

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-yellow-500';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 90) return 'text-yellow-600';
    if (percentage >= 80) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-4">
      {budgetsWithDetails.map((budget) => (
        <div 
          key={budget.id} 
          className={cn(
            "bg-white rounded-lg shadow-sm border p-4 transition-colors",
            budget.percentage >= 100 ? 'border-red-200 bg-red-50' :
            budget.percentage >= 90 ? 'border-yellow-200 bg-yellow-50' :
            budget.percentage >= 80 ? 'border-orange-200 bg-orange-50' :
            'border-gray-200'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={cn(
                "p-2 rounded-full",
                budget.category?.color || 'bg-gray-500'
              )}>
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">
                  {budget.category?.name || 'Unknown Category'}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mt-0.5">
                  <Calendar className="h-4 w-4 mr-1" />
                  {budget.period === 'monthly' ? 'Monthly' : 'Yearly'} Budget
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-6">
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <div className="text-lg font-medium text-gray-900">
                    {formatAmountWithCurrency(budget.spentAmount)}
                  </div>
                  <span className="text-gray-400">/</span>
                  <div className="text-gray-500">
                    {formatAmountWithCurrency(budget.amount)}
                  </div>
                </div>
                <div className={cn(
                  "text-sm font-medium mt-1 flex items-center justify-end space-x-1",
                  getStatusTextColor(budget.percentage)
                )}>
                  {budget.percentage >= 80 && (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span>{budget.percentage.toFixed(1)}% spent</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(budget)}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Edit budget"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(budget.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete budget"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={cn(
                  "h-2 transition-all duration-500 ease-out",
                  getStatusColor(budget.percentage)
                )}
                style={{ 
                  width: `${Math.min(budget.percentage, 100)}%`,
                  transition: 'width 0.5s ease-out'
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}