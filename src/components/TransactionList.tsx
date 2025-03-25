import React, { useState } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BrainCircuit,
  Globe,
} from "lucide-react";
import { Transaction, TransactionType, Category, Currency } from "../types";
import { expenseCategories, incomeCategories } from "../data/categories";
import { cn } from "../utils/cn";
import CurrencyBadge from "./CurrencyBadge";

type TransactionListProps = {
  transactions: Transaction[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  baseCurrency: Currency;
  formatAmountWithCurrency: (amount: number, currencyCode?: string) => string;
};

export default function TransactionList({
  transactions,
  isLoading,
  onDelete,
  baseCurrency,
  formatAmountWithCurrency,
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterCurrency, setFilterCurrency] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(false);

  const allCategories = [...expenseCategories, ...incomeCategories];

  // Get unique currencies from transactions
  const uniqueCurrencies = Array.from(
    new Set(transactions.map((t) => t.currency || baseCurrency.code))
  );

  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type
    if (filterType !== "all" && transaction.type !== filterType) return false;

    // Filter by category
    if (filterCategory && transaction.category.id !== filterCategory)
      return false;

    // Filter by currency
    if (filterCurrency && transaction.currency !== filterCurrency) return false;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesDescription = transaction.description
        .toLowerCase()
        .includes(term);
      const matchesTags = transaction.tags?.some((tag) =>
        tag.toLowerCase().includes(term)
      );
      return matchesDescription || matchesTags;
    }

    return true;
  });

  // Calculate spending patterns for AI insights
  const getSpendingInsights = () => {
    if (transactions.length === 0) return null;

    // Get expense transactions
    const expenses = transactions.filter((t) => t.type === "expense");
    if (expenses.length === 0) return null;

    // Group by category
    const categorySpending: Record<string, number> = {};
    expenses.forEach((expense) => {
      const categoryId = expense.category.id;
      categorySpending[categoryId] =
        (categorySpending[categoryId] || 0) + expense.amount;
    });

    // Find top categories
    const topCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([categoryId, amount]) => {
        const category = allCategories.find((c) => c.id === categoryId);
        return {
          name: category?.name || "Unknown",
          amount,
          percentage: Math.round(
            (amount / expenses.reduce((sum, e) => sum + e.amount, 0)) * 100
          ),
        };
      });

    return topCategories;
  };

  const insights = getSpendingInsights();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAiInsights(!showAiInsights)}
            className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
          >
            <BrainCircuit className="h-4 w-4 mr-1" />
            AI Insights
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </button>
        </div>
      </div>

      {/* AI Insights Panel */}
      {showAiInsights && insights && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center mb-3">
            <BrainCircuit className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-blue-800">
              AI Spending Insights
            </h3>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-blue-700">
              Based on your transaction history, here's where your money is
              going:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insights.map((category, index) => (
                <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm font-bold">
                      {category.percentage}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatAmountWithCurrency(category.amount)} total spent
                  </p>
                </div>
              ))}
            </div>

            <div className="text-sm text-blue-700 mt-2">
              <p className="font-medium">AI Recommendations:</p>
              <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                {insights[0]?.percentage > 40 && (
                  <li>
                    Consider reducing spending on{" "}
                    {insights[0].name.toLowerCase()} as it represents a large
                    portion of your expenses.
                  </li>
                )}
                {transactions.filter((t) => t.type === "income").length ===
                  0 && (
                  <li>
                    No income recorded. Make sure to track all sources of income
                    for better financial insights.
                  </li>
                )}
                <li>
                  Set up a budget for your top spending categories to better
                  manage your finances.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className={cn("mb-4 space-y-3", showFilters ? "block" : "hidden")}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search transactions..."
            className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:ring-2 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="filterType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Type
            </label>
            <select
              id="filterType"
              className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:ring-2 focus:outline-none"
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as TransactionType | "all")
              }
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="filterCategory"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="filterCategory"
              className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:ring-2 focus:outline-none"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {allCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filterCurrency"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Currency
            </label>
            <select
              id="filterCurrency"
              className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:ring-2 focus:outline-none"
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
            >
              <option value="">All Currencies</option>
              {uniqueCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      transaction.category.color
                    )}
                  >
                    {transaction.type === "expense" ? (
                      <ArrowDownRight className="h-5 w-5 text-white" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-white" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium">{transaction.description}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100">
                        {transaction.category.name}
                      </span>
                      <span className="mx-2">•</span>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(transaction.date, "MMM d, yyyy")}
                      </div>

                      {transaction.currency &&
                        transaction.currency !== baseCurrency.code && (
                          <>
                            <span className="mx-2">•</span>
                            <CurrencyBadge
                              currencyCode={transaction.currency}
                            />
                          </>
                        )}

                      {transaction.receiptImageUrl && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Globe className="h-3 w-3 mr-1" />
                            Receipt
                          </span>
                        </>
                      )}
                    </div>

                    {transaction.tags && transaction.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {transaction.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={cn(
                      "font-semibold",
                      transaction.type === "expense"
                        ? "text-red-600"
                        : "text-green-600"
                    )}
                  >
                    {transaction.type === "expense" ? "-" : "+"}
                    {transaction.originalAmount
                      ? formatAmountWithCurrency(
                          transaction.originalAmount,
                          transaction.currency
                        )
                      : formatAmountWithCurrency(
                          transaction.amount,
                          transaction.currency || baseCurrency.code
                        )}
                  </span>

                  {transaction.originalAmount &&
                    transaction.currency !== baseCurrency.code && (
                      <span className="text-xs text-gray-500">
                        ≈ {formatAmountWithCurrency(transaction.amount)}
                      </span>
                    )}

                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="mt-2 text-gray-400 hover:text-red-500"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
