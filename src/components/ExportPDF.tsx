import React, { useState } from 'react';
import { Download, FileText, Loader } from 'lucide-react';
import { Transaction, Currency, ExchangeRates } from '../types';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from '../utils/cn';

type ExportPDFProps = {
  transactions: Transaction[];
  baseCurrency: Currency;
  formatAmountWithCurrency: (amount: number, currencyCode?: string) => string;
};

export default function ExportPDF({ 
  transactions, 
  baseCurrency,
  formatAmountWithCurrency 
}: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  // Calculate summary data
  const calculateSummaryData = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const categoryName = transaction.category.name;
        expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + transaction.amount;
      });
    
    // Sort categories by amount
    const topCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      totalIncome,
      totalExpenses,
      balance,
      topCategories
    };
  };
  
  const generatePDF = async () => {
    setIsExporting(true);
    
    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(0, 51, 153);
      pdf.text('Paisa Controller - Financial Report', margin, yPosition);
      yPosition += 10;
      
      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, margin, yPosition);
      yPosition += 15;
      
      // Add summary section
      const { totalIncome, totalExpenses, balance, topCategories } = calculateSummaryData();
      
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Financial Summary', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
      
      // Summary data
      pdf.setFontSize(11);
      pdf.text(`Base Currency: ${baseCurrency.code} (${baseCurrency.symbol})`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Total Income: ${formatAmountWithCurrency(totalIncome)}`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Total Expenses: ${formatAmountWithCurrency(totalExpenses)}`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Balance: ${formatAmountWithCurrency(balance)}`, margin, yPosition);
      yPosition += 10;
      
      // Top expense categories
      if (topCategories.length > 0) {
        pdf.setFontSize(12);
        pdf.text('Top Expense Categories', margin, yPosition);
        yPosition += 7;
        
        topCategories.forEach(([category, amount], index) => {
          pdf.setFontSize(10);
          pdf.text(`${index + 1}. ${category}: ${formatAmountWithCurrency(amount)}`, margin + 5, yPosition);
          yPosition += 5;
        });
        
        yPosition += 5;
      }
      
      // Transactions section
      pdf.setFontSize(14);
      pdf.text('Recent Transactions', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
      
      // Sort transactions by date (newest first)
      const sortedTransactions = [...transactions]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 20); // Limit to 20 most recent transactions
      
      // Table headers
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text('Date', margin, yPosition);
      pdf.text('Description', margin + 25, yPosition);
      pdf.text('Category', margin + 90, yPosition);
      pdf.text('Type', margin + 130, yPosition);
      pdf.text('Amount', pageWidth - margin - 25, yPosition, { align: 'right' });
      yPosition += 5;
      
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
      
      // Table rows
      pdf.setTextColor(0, 0, 0);
      sortedTransactions.forEach((transaction, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        const dateStr = format(transaction.date, 'MMM d, yyyy');
        const description = transaction.description.length > 30 
          ? transaction.description.substring(0, 27) + '...' 
          : transaction.description;
        const category = transaction.category.name;
        const type = transaction.type === 'expense' ? 'Expense' : 'Income';
        const amount = transaction.originalAmount 
          ? formatAmountWithCurrency(transaction.originalAmount, transaction.currency)
          : formatAmountWithCurrency(transaction.amount);
        
        pdf.text(dateStr, margin, yPosition);
        pdf.text(description, margin + 25, yPosition);
        pdf.text(category, margin + 90, yPosition);
        pdf.text(type, margin + 130, yPosition);
        pdf.text(amount, pageWidth - margin - 25, yPosition, { align: 'right' });
        
        yPosition += 6;
        
        // Add a light separator line
        if (index < sortedTransactions.length - 1) {
          pdf.setDrawColor(230, 230, 230);
          pdf.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3);
        }
      });
      
      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Paisa Controller - AI-Powered Expense & Budget Manager', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Save the PDF
      pdf.save('paisa-controller-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <button
      onClick={generatePDF}
      disabled={isExporting || transactions.length === 0}
      className={cn(
        "flex items-center px-4 py-2 rounded-md text-sm font-medium",
        transactions.length === 0
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : isExporting
            ? "bg-blue-100 text-blue-500 cursor-wait"
            : "bg-blue-600 text-white hover:bg-blue-700"
      )}
    >
      {isExporting ? (
        <>
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </>
      )}
    </button>
  );
}