# Paisa Controller - Personal Finance Manager

A modern, user-friendly personal finance management application built with React, TypeScript, and Supabase. Track your expenses, manage income, and get insights into your financial health.

## Features

- 💰 Track expenses and income
- 📊 Real-time financial insights and summaries
- 🤖 AI-powered category suggestions
- 🏷️ Tag-based transaction organization
- 💱 Multi-currency support
- 🌐 Works offline for non-logged-in users
- 🔒 Secure authentication with Supabase
- 📱 Responsive design for all devices
- 🔍 Advanced search and filtering capabilities
- 📈 Monthly and yearly graphical visualizations
- 📊 Category-wise breakdown charts
- 📑 Export transactions and reports as PDF
- 💰 Budget management with smart alerts (Logged-in users)

## Prerequisites

- Node.js (v16.0.0 or higher)
- npm or yarn
- Git
- A Supabase account (for backend services)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/OmMTelrandhe/FinanceManager
cd project
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To get these values:
1. Go to [Supabase Dashboard](https://app.supabase.io)
2. Select your project
3. Go to Project Settings > API
4. Copy the URL and anon key

### 4. Database Setup

1. In your Supabase dashboard, create the following tables:

```sql
-- transactions table
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  amount float8 not null,
  description text,
  category_id text,
  category_name text,
  category_icon text,
  category_color text,
  date timestamp with time zone default timezone('utc'::text, now()),
  type text,
  tags text[],
  currency text,
  original_amount float8
);

-- Enable RLS (Row Level Security)
alter table transactions enable row level security;

-- Create policy for authenticated users
create policy "Users can view their own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on transactions for delete
  using (auth.uid() = user_id);
```

### 5. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Usage Guide

### Getting Started

1. **As a Non-Logged-In User:**
   - You can add transactions immediately
   - Data is stored temporarily in browser memory
   - Features like AI category suggestions work
   - Data will be lost on page refresh

2. **Creating an Account:**
   - Click "Sign In" in the top right
   - Choose "Sign Up" for a new account
   - Enter your email and password

3. **Adding Transactions:**
   - Click "Add New Transaction"
   - Choose Expense or Income
   - Fill in the amount and description
   - AI will suggest a category based on description
   - Add optional tags and select currency
   - Click "Add" to store the transaction

4. **Managing Transactions:**
   - View all transactions in the main dashboard
   - Filter by type (expense/income)
   - Search by description or tags
   - Click on a transaction to edit or delete
   - View financial summaries and charts

### Features in Detail

1. **AI Category Suggestions:**
   - Type at least 3 characters in description
   - Wait for the AI thinking indicator
   - Click the suggested category to apply it
   - Suggestions improve with usage

2. **Multi-Currency Support:**
   - Select transaction currency from dropdown
   - Amounts automatically convert to base currency
   - View original and converted amounts

3. **Tags:**
   - Add multiple tags separated by commas
   - Use tags for detailed filtering
   - Common tags appear in suggestions

4. **Search and Filtering:**
   - Quick search by description or tags
   - Filter transactions by:
     - Categories
     - Transaction type (income/expense)
     - Tags
     - Currency
   - Save custom filter combinations

5. **Graphical Visualizations:**
   - Monthly Overview:
     - Income vs Expense bar charts
     - Category-wise pie charts
     - Daily spending line graphs
     - Running balance tracker
   
   - Yearly Analysis:
     - Year-over-year comparison
     - Monthly trend analysis
     - Category distribution
   
   - Interactive Features:
     - Custom date range selection
     - Toggle between chart types

6. **Financial Insights:**
   - Top spending categories
   - Monthly budget tracking
   - Expense patterns and trends
   - Category-wise budget alerts

7. **PDF Export:**
   - Export transaction history as PDF
   - Customizable report layouts:
     - Transaction list with details
     - Income vs Expense analysis

8. **Budget Management System** (Logged-in Users Only):
   - Set monthly budgets:
     - Overall spending limit
     - Category-wise limits
   
   - Smart Alert System:
     - Budget threshold notifications (50%, 80%, 100%)
     - Category overspending warnings
   
   - Budget Analytics:
     - Real-time budget tracking
     - Category-wise budget utilization
     - Month-to-month comparison

## Troubleshooting

1. **Authentication Issues:**
   - Ensure your email is verified
   - Check if Supabase credentials are correct
   - Clear browser cache if persisting

2. **Missing Transactions:**
   - Verify you're logged in
   - Check applied filters
   - Ensure transaction save completed

3. **Category Suggestions Not Working:**
   - Description must be 3+ characters
   - Wait for AI processing (1 second)
   - Check console for any errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
