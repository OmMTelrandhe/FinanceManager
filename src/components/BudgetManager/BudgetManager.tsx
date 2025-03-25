import React, { useState, useEffect } from "react";
import { Budget, Transaction } from "../../types";
import { useBudget } from "../../context/BudgetContext";
import { expenseCategories } from "../../data/categories";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import BudgetForm from "./BudgetForm";
import BudgetList from "./BudgetList";
import BudgetProgress from "./BudgetProgress";
import BudgetAlerts from "./BudgetAlerts";
import { Plus, X } from "lucide-react";
import { cn } from "../../utils/cn";

type BudgetManagerProps = {
  formatAmountWithCurrency: (amount: number, currencyCode?: string) => string;
};

export default function BudgetManager({
  formatAmountWithCurrency,
}: BudgetManagerProps) {
  const { budgets, deleteBudget, checkBudgetAlerts } = useBudget();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(
    undefined
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });
        if (error) {
          throw error;
        }
        const formattedTransactions: Transaction[] = data.map((t) => {
          // Find the category from our expense categories
          const category = expenseCategories.find(
            (c) => c.id === t.category_id
          ) || {
            id: t.category_id,
            name: "Unknown",
            icon: "help-circle",
            color: "bg-gray-500",
          };

          return {
            id: t.id,
            type: t.type,
            amount: t.amount,
            date: new Date(t.date),
            category: category,
            description: t.description,
            userId: t.user_id,
          };
        });
        setTransactions(formattedTransactions);
        checkBudgetAlerts(formattedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, [user, checkBudgetAlerts]);

  const handleAddNew = () => {
    setEditingBudget(undefined);
    setShowForm(true);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBudget(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBudget(undefined);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      await deleteBudget(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Budget Manager</h2>

        <button
          onClick={showForm ? handleCancel : handleAddNew}
          className={cn(
            "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
            showForm
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add New Budget
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingBudget ? "Edit Budget" : "Create New Budget"}
          </h3>

          <BudgetForm
            categories={expenseCategories}
            existingBudget={editingBudget}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Your Budgets</h3>
        <BudgetList
          budgets={budgets}
          categories={expenseCategories}
          transactions={transactions}
          formatAmountWithCurrency={formatAmountWithCurrency}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <BudgetAlerts formatAmountWithCurrency={formatAmountWithCurrency} />
    </div>
  );
}
