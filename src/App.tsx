import React, { useEffect, useRef } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import FinancialSummary from "./components/FinancialSummary";
import BudgetManager from "./components/BudgetManager/BudgetManager";
import BudgetAlerts from "./components/BudgetManager/BudgetAlerts";
import { useTransactions } from "./hooks/useTransactions";
import { useCurrency } from "./hooks/useCurrency";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BudgetProvider, useBudget } from "./context/BudgetContext";
import { Toaster } from "react-hot-toast";

function AppContent() {
  const {
    transactions,
    isLoading,
    addTransaction,
    deleteTransaction,
    predictCategory,
  } = useTransactions();

  const {
    baseCurrency,
    currencies,
    exchangeRates,
    isLoading: isLoadingRates,
    lastUpdated,
    error: ratesError,
    changeBaseCurrency,
    convertAmount,
    formatAmountWithCurrency,
    refreshRates,
  } = useCurrency();

  const { user, isLoading: isAuthLoading } = useAuth();
  const { checkBudgetAlerts } = useBudget();

  const budgetsCheckedRef = useRef(false);

  useEffect(() => {
    if (transactions.length > 0 && !budgetsCheckedRef.current && user) {
      checkBudgetAlerts(transactions);
      budgetsCheckedRef.current = true;
    }
  }, [transactions, checkBudgetAlerts, user]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        baseCurrency={baseCurrency}
        currencies={currencies}
        onChangeCurrency={changeBaseCurrency}
      />

      <main className="container mx-auto px-4 py-8 md:px-8">
        {!user && !isAuthLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">
                Welcome to Paisa Controller
              </h2>
              <p className="text-blue-700 mb-4">
                Sign in to access all features including Budget Management
                and cloud sync.
              </p>
              <p className="text-sm text-blue-600">
                Demo mode: You can try basic features, but data won't be saved.
              </p>
            </div>
          </div>
        )}

        <Dashboard
          transactions={transactions}
          baseCurrency={baseCurrency}
          exchangeRates={exchangeRates}
          lastUpdated={lastUpdated}
          isLoadingRates={isLoadingRates}
          ratesError={ratesError}
          onRefreshRates={refreshRates}
          formatAmountWithCurrency={formatAmountWithCurrency}
        />

        <FinancialSummary
          transactions={transactions}
          formatAmountWithCurrency={formatAmountWithCurrency}
        />

        {user && (
          <BudgetManager formatAmountWithCurrency={formatAmountWithCurrency} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TransactionForm
              onSubmit={addTransaction}
              onPredict={predictCategory}
              currencies={currencies}
              baseCurrency={baseCurrency}
              convertAmount={convertAmount}
              geminiApiKey={import.meta.env.VITE_GEMINI_API_KEY}
            />
          </div>

          <div className="lg:col-span-2">
            <TransactionList
              transactions={transactions}
              isLoading={isLoading}
              onDelete={deleteTransaction}
              baseCurrency={baseCurrency}
              formatAmountWithCurrency={formatAmountWithCurrency}
            />
          </div>
        </div>
      </main>

      <footer className="bg-white py-6 mt-12">
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-center text-gray-500">
            2025 Paisa Controller - AI-Powered Expense & Budget Manager
          </p>
        </div>
      </footer>

      <BudgetAlerts formatAmountWithCurrency={formatAmountWithCurrency} />
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BudgetProvider>
        <AppContent />
      </BudgetProvider>
    </AuthProvider>
  );
}

export default App;
