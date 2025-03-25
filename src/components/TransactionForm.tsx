import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  PlusCircle,
  MinusCircle,
  Calendar,
  Tag,
  Hash,
  IndianRupee,
  Check,
  AlertCircle,
  BrainCircuit,
  Globe,
} from "lucide-react";
import { Transaction, TransactionType, Category, Currency } from "../types";
import { expenseCategories, incomeCategories } from "../data/categories";
import { cn } from "../utils/cn";
import CurrencySelector from "./CurrencySelector";
import ReceiptScanner, { ReceiptData } from "./ReceiptScanner";

type FormData = {
  amount: string;
  description: string;
  categoryId: string;
  date: string;
  tags: string;
  currency: string;
};

type TransactionFormProps = {
  onSubmit: (transaction: Omit<Transaction, "id">) => void;
  onPredict: (description: string) => Category | undefined;
  currencies: Currency[];
  baseCurrency: Currency;
  convertAmount: (amount: number, from: string, to: string) => number;
  geminiApiKey?: string;
};

export default function TransactionForm({
  onSubmit,
  onPredict,
  currencies,
  baseCurrency,
  convertAmount,
  geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY,
}: TransactionFormProps) {
  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");
  const [categories, setCategories] = useState<Category[]>(expenseCategories);
  const [suggestedCategory, setSuggestedCategory] = useState<
    Category | undefined
  >(undefined);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(0);
  const [selectedCurrency, setSelectedCurrency] =
    useState<Currency>(baseCurrency);
  const [lastPrediction, setLastPrediction] = useState<string>("");

  const handleReceiptData = (data: ReceiptData) => {
    if (data.amount) {
      setValue("amount", data.amount.toString());
    }

    if (data.description) {
      setValue("description", data.description);

      // Trigger category prediction with the new description
      if (data.description.length >= 3) {
        const predicted = onPredict(data.description);
        if (predicted) {
          setValue("categoryId", predicted.id);
        }
      }
    }

    if (data.date) {
      setValue("date", data.date);
    }

    if (data.items && data.items.length > 0) {
      // Set tags from receipt items
      setValue("tags", data.items.slice(0, 5).join(", "));
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      amount: "",
      description: "",
      categoryId: "",
      date: new Date().toISOString().split("T")[0],
      tags: "",
      currency: baseCurrency.code,
    },
  });

  const description = watch("description");
  const amount = watch("amount");
  const currencyCode = watch("currency");

  useEffect(() => {
    // Update categories based on transaction type
    setCategories(
      transactionType === "expense" ? expenseCategories : incomeCategories
    );
  }, [transactionType]);

  useEffect(() => {
    // Update selected currency when currency code changes
    const currency = currencies.find((c) => c.code === currencyCode);
    if (currency) {
      setSelectedCurrency(currency);
    }
  }, [currencyCode, currencies]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (
      description &&
      description.length >= 3 &&
      description !== lastPrediction
    ) {
      setAiThinking(true);
      setSuggestedCategory(undefined);

      timer = setTimeout(() => {
        const predicted = onPredict(description);
        setSuggestedCategory(predicted);
        setAiThinking(false);
        setLastPrediction(description);

        // Simulate confidence score
        setAiConfidence(Math.random() * 0.3 + 0.7); // 70-100% confidence
      }, 1000);
    } else if (!description || description.length < 3) {
      setSuggestedCategory(undefined);
      setAiThinking(false);
      setLastPrediction("");
      setAiConfidence(0);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [description, onPredict]);

  const applySuggestedCategory = () => {
    if (suggestedCategory) {
      setValue("categoryId", suggestedCategory.id);
      setSuggestedCategory(undefined);
      setLastPrediction(""); // Reset last prediction when category is applied
    }
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setValue("currency", currencyCode);
  };

  // Calculate converted amount
  const getConvertedAmount = (): string => {
    if (!amount || isNaN(parseFloat(amount))) return "";

    const originalAmount = parseFloat(amount);
    if (currencyCode === baseCurrency.code) return "";

    const convertedAmount = convertAmount(
      originalAmount,
      currencyCode,
      baseCurrency.code
    );
    return `≈ ${baseCurrency.symbol}${convertedAmount.toFixed(2)} ${
      baseCurrency.code
    }`;
  };

  const processSubmit = (data: FormData) => {
    const selectedCategory = categories.find(
      (cat) => cat.id === data.categoryId
    );

    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }

    const originalAmount = parseFloat(data.amount);
    let finalAmount = originalAmount;

    // Convert amount to base currency if different
    if (data.currency !== baseCurrency.code) {
      finalAmount = convertAmount(
        originalAmount,
        data.currency,
        baseCurrency.code
      );
    }

    const transaction: Omit<Transaction, "id"> = {
      amount: finalAmount,
      description: data.description,
      category: selectedCategory,
      date: new Date(data.date),
      type: transactionType,
      tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
      currency: data.currency,
      originalAmount:
        data.currency !== baseCurrency.code ? originalAmount : undefined,
    };

    onSubmit(transaction);
    reset({
      amount: "",
      description: "",
      categoryId: "",
      date: new Date().toISOString().split("T")[0],
      tags: "",
      currency: baseCurrency.code,
    });
  };

  // Get confidence level color
  const getConfidenceColor = () => {
    if (aiConfidence >= 0.9) return "text-green-600";
    if (aiConfidence >= 0.8) return "text-blue-600";
    return "text-yellow-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Add New Transaction</h2>

      {/* Receipt Scanner */}
      <ReceiptScanner onReceiptData={handleReceiptData} apiKey={geminiApiKey} />

      <div className="flex space-x-2 mb-6">
        <button
          type="button"
          onClick={() => setTransactionType("expense")}
          className={cn(
            "flex items-center justify-center px-4 py-2 rounded-md w-1/2 font-medium",
            transactionType === "expense"
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          <MinusCircle className="mr-2 h-5 w-5" />
          Expense
        </button>

        <button
          type="button"
          onClick={() => setTransactionType("income")}
          className={cn(
            "flex items-center justify-center px-4 py-2 rounded-md w-1/2 font-medium",
            transactionType === "income"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Income
        </button>
      </div>

      <form onSubmit={handleSubmit(processSubmit)}>
        <div className="space-y-4">
          {/* Currency Selector */}
          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Currency
            </label>
            <CurrencySelector
              currencies={currencies}
              selectedCurrency={selectedCurrency}
              onChange={handleCurrencyChange}
            />
          </div>

          {/* Amount */}
          <div className="relative">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">{selectedCurrency.symbol}</span>
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
                {...register("amount", { required: true, min: 0.01 })}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a valid amount
              </p>
            )}
            {getConvertedAmount() && (
              <p className="mt-1 text-xs text-gray-500">
                {getConvertedAmount()}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <div className="relative">
              <input
                id="description"
                type="text"
                placeholder="What was this transaction for?"
                className={cn(
                  "block w-full px-3 py-2 rounded-md border focus:ring-2 focus:outline-none",
                  errors.description
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                )}
                {...register("description", { required: true })}
              />

              {aiThinking && (
                <div className="absolute right-2 top-2">
                  <div className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    <BrainCircuit className="h-3 w-3 mr-1 animate-pulse" />
                    <span>AI thinking...</span>
                  </div>
                </div>
              )}

              {suggestedCategory && !aiThinking && (
                <div className="absolute right-2 top-2">
                  <button
                    type="button"
                    onClick={applySuggestedCategory}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    <span className="mr-1">
                      Suggest: {suggestedCategory.name}
                    </span>
                    <span className={`text-xs ${getConfidenceColor()}`}>
                      {(aiConfidence * 100).toFixed(0)}%
                    </span>
                    <Check className="h-3 w-3 ml-1" />
                  </button>
                </div>
              )}
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a description
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              className={cn(
                "block w-full px-3 py-2 rounded-md border focus:ring-2 focus:outline-none",
                errors.categoryId
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
              {...register("categoryId", { required: true })}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">
                Please select a category
              </p>
            )}
          </div>

          {/* Date */}
          <div className="relative">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="date"
                type="date"
                className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:ring-2 focus:outline-none"
                {...register("date", { required: true })}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="relative">
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags (comma separated)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="tags"
                type="text"
                placeholder="groceries, food, etc."
                className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:ring-2 focus:outline-none"
                {...register("tags")}
              />
            </div>
          </div>

          <button
            type="submit"
            className={cn(
              "w-full py-2 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2",
              transactionType === "expense"
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
            )}
          >
            Add {transactionType === "expense" ? "Expense" : "Income"}
          </button>
        </div>
      </form>

      {/* AI Categorization Info */}
      <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-100">
        <div className="flex items-start">
          <BrainCircuit className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              AI-Powered Categorization
            </h3>
            <p className="text-xs text-blue-600 mt-1">
              Our AI analyzes your transaction description and suggests the most
              appropriate category. The more you use the app, the smarter it
              becomes at predicting your spending patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
