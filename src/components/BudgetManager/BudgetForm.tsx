import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Category, BudgetPeriod, Budget } from '../../types';
import { useBudget } from '../../context/BudgetContext';
import { IndianRupee, Calendar, Tag, Save, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCurrency } from '../../hooks/useCurrency';

type FormData = {
  categoryId: string;
  amount: string;
  period: BudgetPeriod;
  currency: string;
};

type BudgetFormProps = {
  categories: Category[];
  existingBudget?: Budget;
  onSuccess?: () => void;
  onCancel: () => void;
};

export default function BudgetForm({ 
  categories, 
  existingBudget,
  onSuccess,
  onCancel
}: BudgetFormProps) {
  const { createBudget, updateBudget, deleteBudget } = useBudget();
  const { currencies, baseCurrency, convertAmount } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      categoryId: existingBudget?.categoryId || '',
      amount: existingBudget ? existingBudget.amount.toString() : '',
      period: existingBudget?.period || 'monthly',
      currency: 'INR'
    }
  });
  
  const amount = watch('amount');
  const currencyCode = watch('currency');

  // Calculate converted amount if not in INR
  const getConvertedAmount = (): string => {
    if (!amount || isNaN(parseFloat(amount))) return '';
    
    const originalAmount = parseFloat(amount);
    if (currencyCode === baseCurrency.code) return '';
    
    const convertedAmount = convertAmount(originalAmount, currencyCode, baseCurrency.code);
    return `≈ ₹${convertedAmount.toFixed(2)} INR`;
  };
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      let finalAmount = parseFloat(data.amount);
      
      // Convert amount to INR if needed
      if (data.currency !== 'INR') {
        finalAmount = convertAmount(finalAmount, data.currency, 'INR');
      }
      
      if (existingBudget) {
        await updateBudget(existingBudget.id, finalAmount, data.period);
      } else {
        await createBudget(data.categoryId, finalAmount, data.period);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!existingBudget) return;
    
    setIsDeleting(true);
    
    try {
      await deleteBudget(existingBudget.id);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Category */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="categoryId"
            className={cn(
              "block w-full pl-10 pr-3 py-2 rounded-md border focus:ring-2 focus:outline-none",
              errors.categoryId 
                ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            {...register('categoryId', { required: 'Category is required' })}
            disabled={!!existingBudget}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
        )}
      </div>
      
      {/* Amount and Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Budget Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className={cn(
                "block w-full pl-10 pr-3 py-2 rounded-md border focus:ring-2 focus:outline-none",
                errors.amount 
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' }
              })}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
          {getConvertedAmount() && (
            <p className="mt-1 text-sm text-gray-500">{getConvertedAmount()}</p>
          )}
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            id="currency"
            className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:ring-2 focus:outline-none"
            {...register('currency')}
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Period */}
      <div>
        <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
          Budget Period
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="period"
            className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:ring-2 focus:outline-none"
            {...register('period', { required: true })}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-between pt-2">
        {existingBudget ? (
          <>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Budget
                </>
              )}
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Budget
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Budget
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
  );
}