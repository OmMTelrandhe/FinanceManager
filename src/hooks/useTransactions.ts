import { useState, useEffect, useCallback } from "react";
import { Transaction, TransactionType, Category } from "../types";
import { suggestCategory, addToTransactionHistory } from "../data/categories";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiConfidence, setAiConfidence] = useState<Record<string, number>>({});
  const { user } = useAuth();

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedTransactions: Transaction[] = data.map((item) => ({
            id: item.id,
            amount: item.amount,
            description: item.description,
            category: {
              id: item.category_id,
              name: item.category_name,
              icon: item.category_icon,
              color: item.category_color,
            },
            date: new Date(item.date),
            type: item.type as TransactionType,
            tags: item.tags || [],
            currency: item.currency || undefined,
            originalAmount: item.original_amount || undefined,
            receiptImageUrl: item.receipt_image_url || undefined,
          }));
          setTransactions(formattedTransactions);
        }
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substring(2, 9),
    } as Transaction;

    if (!user) {
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    }

    try {
      const supabaseTransaction = {
        user_id: user.id,
        amount: transaction.amount,
        description: transaction.description,
        category_id: transaction.category.id,
        category_name: transaction.category.name,
        category_icon: transaction.category.icon,
        category_color: transaction.category.color,
        date: transaction.date.toISOString(),
        type: transaction.type,
        tags: transaction.tags || [],
        currency: transaction.currency || null,
        original_amount: transaction.originalAmount || null,
        receipt_image_url: transaction.receiptImageUrl || null,
      };

      const { data, error } = await supabase
        .from("transactions")
        .insert(supabaseTransaction)
        .select()
        .single();

      if (error) throw error;

      addToTransactionHistory(transaction.description, transaction.category.id);

      const persistedTransaction: Transaction = {
        ...transaction,
        id: data.id,
      };

      setTransactions((prev) => [persistedTransaction, ...prev]);
      return persistedTransaction;
    } catch (error) {
      console.error("Error adding transaction:", error);
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const getFilteredTransactions = (
    type?: TransactionType,
    categoryId?: string,
    searchTerm?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    return transactions.filter((transaction) => {
      if (type && transaction.type !== type) return false;
      if (categoryId && transaction.category.id !== categoryId) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDescription = transaction.description
          .toLowerCase()
          .includes(term);
        const matchesTags = transaction.tags?.some((tag) =>
          tag.toLowerCase().includes(term)
        );
        if (!matchesDescription && !matchesTags) return false;
      }

      if (startDate && transaction.date < startDate) return false;
      if (endDate && transaction.date > endDate) return false;

      return true;
    });
  };

  const predictCategory = (description: string): Category | undefined => {
    const predictedCategory = suggestCategory(description);

    if (predictedCategory) {
      const confidence = Math.random() * 0.3 + 0.7;
      setAiConfidence((prev) => ({
        ...prev,
        [description]: confidence,
      }));

      if (user) {
        addToTransactionHistory(description, predictedCategory.id);
      }
    }

    return predictedCategory;
  };

  const getCategoryPredictionConfidence = (description: string): number => {
    return aiConfidence[description] || 0;
  };

  return {
    transactions,
    isLoading,
    addTransaction,
    deleteTransaction,
    getFilteredTransactions,
    predictCategory,
    getCategoryPredictionConfidence,
  };
}
