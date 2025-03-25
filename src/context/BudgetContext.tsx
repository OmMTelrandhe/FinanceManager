import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Budget, BudgetPeriod, BudgetAlert, Transaction, Category } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import toast from 'react-hot-toast';
import { expenseCategories } from '../data/categories';

type BudgetContextType = {
  budgets: Budget[];
  alerts: BudgetAlert[];
  isLoading: boolean;
  createBudget: (categoryId: string, amount: number, period: BudgetPeriod) => Promise<Budget | null>;
  updateBudget: (id: string, amount: number, period: BudgetPeriod) => Promise<Budget | null>;
  deleteBudget: (id: string) => Promise<boolean>;
  markAlertAsSeen: (id: string) => void;
  clearAllAlerts: () => void;
  checkBudgetAlerts: (transactions: Transaction[]) => void;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Use a ref to track if we've already checked budgets in this session
  const alertsCheckedRef = useRef<Record<string, Record<number, boolean>>>({});

  // Fetch budgets from Supabase
  useEffect(() => {
    const fetchBudgets = async () => {
      if (!user) {
        setBudgets([]);
        setAlerts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        if (data) {
          const formattedBudgets: Budget[] = data.map(item => ({
            id: item.id,
            categoryId: item.category_id,
            amount: item.amount,
            period: item.period as BudgetPeriod,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            userId: item.user_id
          }));

          setBudgets(formattedBudgets);
        }

        // Fetch alerts
        const { data: alertsData, error: alertsError } = await supabase
          .from('budget_alerts')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (alertsError) {
          throw alertsError;
        }

        if (alertsData) {
          const formattedAlerts: BudgetAlert[] = alertsData.map(item => ({
            id: item.id,
            budgetId: item.budget_id,
            message: item.message,
            date: new Date(item.date),
            seen: item.seen,
            categoryId: item.category_id,
            categoryName: item.category_name,
            budgetAmount: item.budget_amount,
            spentAmount: item.spent_amount,
            percentage: item.percentage
          }));

          setAlerts(formattedAlerts);
        }
      } catch (error) {
        console.error('Error fetching budgets:', error);
        // Use empty arrays as fallback
        setBudgets([]);
        setAlerts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgets();
  }, [user]);

  // Create a new budget
  const createBudget = async (categoryId: string, amount: number, period: BudgetPeriod): Promise<Budget | null> => {
    if (!user) {
      console.error('User not authenticated');
      toast.error('Please sign in to create budgets');
      return null;
    }

    try {
      // Check if a budget already exists for this category and period
      const existingBudget = budgets.find(b => b.categoryId === categoryId && b.period === period);
      
      if (existingBudget) {
        // Update existing budget instead
        return await updateBudget(existingBudget.id, amount, period);
      }

      const now = new Date().toISOString();
      
      // Prepare the budget data for Supabase
      const supabaseBudget = {
        user_id: user.id,
        category_id: categoryId,
        amount: amount,
        period: period,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('budgets')
        .insert(supabaseBudget)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create the new budget with the ID from Supabase
      const newBudget: Budget = {
        id: data.id,
        categoryId: data.category_id,
        amount: data.amount,
        period: data.period,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        userId: data.user_id
      };

      // Update the local state
      setBudgets(prev => [...prev, newBudget]);
      
      // Show success toast
      const category = expenseCategories.find(c => c.id === categoryId);
      toast.success(`Budget set for ${category?.name || 'category'}`);
      
      return newBudget;
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
      return null;
    }
  };

  // Update an existing budget
  const updateBudget = async (id: string, amount: number, period: BudgetPeriod): Promise<Budget | null> => {
    if (!user) {
      console.error('User not authenticated');
      toast.error('Please sign in to update budgets');
      return null;
    }

    try {
      const now = new Date().toISOString();
      
      // Prepare the budget data for Supabase
      const supabaseBudget = {
        amount: amount,
        period: period,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('budgets')
        .update(supabaseBudget)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create the updated budget
      const updatedBudget: Budget = {
        id: data.id,
        categoryId: data.category_id,
        amount: data.amount,
        period: data.period,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        userId: data.user_id
      };

      // Update the local state
      setBudgets(prev => prev.map(budget => 
        budget.id === id ? updatedBudget : budget
      ));
      
      // Show success toast
      const category = expenseCategories.find(c => c.id === updatedBudget.categoryId);
      toast.success(`Budget updated for ${category?.name || 'category'}`);
      
      // Reset the alerts checked for this budget
      if (alertsCheckedRef.current[id]) {
        alertsCheckedRef.current[id] = {};
      }
      
      return updatedBudget;
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
      return null;
    }
  };

  // Delete a budget
  const deleteBudget = async (id: string): Promise<boolean> => {
    if (!user) {
      console.error('User not authenticated');
      toast.error('Please sign in to delete budgets');
      return false;
    }

    try {
      // First, delete all related alerts to avoid foreign key constraint errors
      const { error: alertsError } = await supabase
        .from('budget_alerts')
        .delete()
        .eq('budget_id', id)
        .eq('user_id', user.id);

      if (alertsError) {
        console.error('Error deleting related alerts:', alertsError);
        // Continue with budget deletion even if alert deletion fails
      }

      // Now delete the budget
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update the local state
      setBudgets(prev => prev.filter(budget => budget.id !== id));
      
      // Remove any alerts for this budget from local state
      setAlerts(prev => prev.filter(alert => alert.budgetId !== id));
      
      // Remove from alerts checked ref
      if (alertsCheckedRef.current[id]) {
        delete alertsCheckedRef.current[id];
      }
      
      // Show success toast
      toast.success('Budget deleted');
      
      return true;
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
      return false;
    }
  };

  // Mark an alert as seen
  const markAlertAsSeen = async (id: string) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('budget_alerts')
        .update({ seen: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update the local state
      setAlerts(prev => prev.map(alert => 
        alert.id === id ? { ...alert, seen: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as seen:', error);
    }
  };

  // Clear all alerts
  const clearAllAlerts = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('budget_alerts')
        .update({ seen: true })
        .eq('user_id', user.id)
        .eq('seen', false);

      if (error) {
        throw error;
      }

      // Update the local state
      setAlerts(prev => prev.map(alert => ({ ...alert, seen: true })));
      
      toast.success('All alerts cleared');
    } catch (error) {
      console.error('Error clearing alerts:', error);
      toast.error('Failed to clear alerts');
    }
  };

  // Check if any budgets have been exceeded and create alerts
  const checkBudgetAlerts = async (transactions: Transaction[]) => {
    if (!user || budgets.length === 0 || transactions.length === 0) {
      return;
    }

    const now = new Date();
    const newAlerts: BudgetAlert[] = [];

    // Process each budget
    for (const budget of budgets) {
      // Get the category for this budget
      const category = expenseCategories.find(c => c.id === budget.categoryId);
      if (!category) continue;

      // Determine the date range for this budget period
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
        .filter(t => 
          t.type === 'expense' && 
          t.category.id === budget.categoryId &&
          isWithinInterval(t.date, { start: startDate, end: endDate })
        )
        .reduce((sum, t) => sum + t.amount, 0);

      // Check if budget is exceeded
      const percentage = (totalSpent / budget.amount) * 100;
      
      // Initialize the budget in our alerts checked ref if it doesn't exist
      if (!alertsCheckedRef.current[budget.id]) {
        alertsCheckedRef.current[budget.id] = {};
      }
      
      // Create alerts at 80%, 90%, and 100%+ thresholds
      if (percentage >= 80) {
        // Determine which threshold we're at
        let thresholdLevel = 80;
        if (percentage >= 100) thresholdLevel = 100;
        else if (percentage >= 90) thresholdLevel = 90;
        
        // Check if we've already alerted for this threshold
        if (alertsCheckedRef.current[budget.id][thresholdLevel]) {
          continue; // Skip if we've already alerted for this threshold
        }
        
        // Check if we already have a recent alert for this budget and threshold
        const existingAlert = alerts.find(a => 
          a.budgetId === budget.id && 
          Math.abs(a.percentage - thresholdLevel) <= 5 &&
          !a.seen // Only consider unread alerts
        );
        
        if (!existingAlert) {
          // Create a new alert
          let message = '';
          if (thresholdLevel === 100) {
            message = `You've exceeded your ${category.name} budget by ${(percentage - 100).toFixed(0)}%`;
          } else if (thresholdLevel === 90) {
            message = `You've used 90% of your ${category.name} budget`;
          } else {
            message = `You've used 80% of your ${category.name} budget`;
          }
          
          try {
            const alertData = {
              user_id: user.id,
              budget_id: budget.id,
              message: message,
              date: now.toISOString(),
              seen: false,
              category_id: category.id,
              category_name: category.name,
              budget_amount: budget.amount,
              spent_amount: totalSpent,
              percentage: percentage
            };
            
            const { data, error } = await supabase
              .from('budget_alerts')
              .insert(alertData)
              .select()
              .single();
              
            if (error) {
              throw error;
            }
            
            // Add to new alerts
            const newAlert: BudgetAlert = {
              id: data.id,
              budgetId: data.budget_id,
              message: data.message,
              date: new Date(data.date),
              seen: data.seen,
              categoryId: data.category_id,
              categoryName: data.category_name,
              budgetAmount: data.budget_amount,
              spentAmount: data.spent_amount,
              percentage: data.percentage
            };
            
            newAlerts.push(newAlert);
            
            // Mark this threshold as alerted
            alertsCheckedRef.current[budget.id][thresholdLevel] = true;
            
            // Show toast notification (only once per threshold)
            toast(message, {
              icon: thresholdLevel >= 100 ? '🚨' : thresholdLevel >= 90 ? '⚠️' : '📊',
              duration: 5000
            });
          } catch (error) {
            console.error('Error creating budget alert:', error);
          }
        } else {
          // Mark this threshold as alerted since we already have an alert
          alertsCheckedRef.current[budget.id][thresholdLevel] = true;
        }
      }
    }
    
    // Update alerts state if we have new alerts
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
    }
  };

  const value = {
    budgets,
    alerts,
    isLoading,
    createBudget,
    updateBudget,
    deleteBudget,
    markAlertAsSeen,
    clearAllAlerts,
    checkBudgetAlerts
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}