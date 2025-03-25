/*
  # Create budget tables

  1. New Tables
    - `budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `category_id` (text, not null)
      - `amount` (numeric, not null)
      - `period` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `budget_alerts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `budget_id` (uuid, references budgets)
      - `message` (text, not null)
      - `date` (timestamptz)
      - `seen` (boolean)
      - `category_id` (text, not null)
      - `category_name` (text, not null)
      - `budget_amount` (numeric, not null)
      - `spent_amount` (numeric, not null)
      - `percentage` (numeric, not null)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  category_id text NOT NULL,
  amount numeric NOT NULL,
  period text NOT NULL CHECK (period IN ('monthly', 'yearly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create budget_alerts table
CREATE TABLE IF NOT EXISTS budget_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  budget_id uuid REFERENCES budgets NOT NULL,
  message text NOT NULL,
  date timestamptz DEFAULT now(),
  seen boolean DEFAULT false,
  category_id text NOT NULL,
  category_name text NOT NULL,
  budget_amount numeric NOT NULL,
  spent_amount numeric NOT NULL,
  percentage numeric NOT NULL
);

-- Enable Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for budgets
CREATE POLICY "Users can read their own budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
  ON budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
  ON budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
  ON budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for budget_alerts
CREATE POLICY "Users can read their own budget alerts"
  ON budget_alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget alerts"
  ON budget_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget alerts"
  ON budget_alerts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget alerts"
  ON budget_alerts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON budgets (user_id);
CREATE INDEX IF NOT EXISTS budgets_category_id_idx ON budgets (category_id);
CREATE INDEX IF NOT EXISTS budget_alerts_user_id_idx ON budget_alerts (user_id);
CREATE INDEX IF NOT EXISTS budget_alerts_budget_id_idx ON budget_alerts (budget_id);
CREATE INDEX IF NOT EXISTS budget_alerts_seen_idx ON budget_alerts (seen);