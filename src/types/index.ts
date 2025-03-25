export type TransactionType = "expense" | "income";

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type Currency = {
  code: string;
  name: string;
  symbol: string;
};

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: Date;
  type: TransactionType;
  tags?: string[];
  currency?: string; // Currency code (e.g., USD, EUR)
  originalAmount?: number; // Amount in original currency
  receiptImageUrl?: string; // URL to the stored receipt image
};

export type ExchangeRates = {
  [key: string]: number;
};

export type BudgetPeriod = "monthly" | "yearly";

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
};

export type BudgetAlert = {
  id: string;
  budgetId: string;
  message: string;
  date: Date;
  seen: boolean;
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
};
