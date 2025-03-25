/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric, not null)
      - `description` (text, not null)
      - `category_id` (text, not null)
      - `category_name` (text, not null)
      - `category_icon` (text, not null)
      - `category_color` (text, not null)
      - `date` (timestamptz, not null)
      - `type` (text, not null)
      - `tags` (text[], default empty array)
      - `currency` (text)
      - `original_amount` (numeric)
      - `created_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to insert their own data
    - Add policy for authenticated users to update their own data
    - Add policy for authenticated users to delete their own data
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  amount numeric NOT NULL,
  description text NOT NULL,
  category_id text NOT NULL,
  category_name text NOT NULL,
  category_icon text NOT NULL,
  category_color text NOT NULL,
  date timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('expense', 'income')),
  tags text[] DEFAULT '{}',
  currency text,
  original_amount numeric,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions (user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions (date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions (type);