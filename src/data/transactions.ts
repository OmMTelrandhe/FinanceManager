import { Transaction } from '../types';
import { expenseCategories, incomeCategories } from './categories';

// Sample transactions data
export const sampleTransactions: Transaction[] = [
  {
    id: '1',
    amount: 3799.99,
    description: 'Grocery shopping at Big Bazaar',
    category: expenseCategories[0],
    date: new Date('2025-05-15'),
    type: 'expense',
    tags: ['groceries', 'food'],
    currency: 'INR'
  },
  {
    id: '2',
    amount: 85000,
    description: 'Monthly salary',
    category: incomeCategories[0],
    date: new Date('2025-05-01'),
    type: 'income',
    tags: ['salary', 'work'],
    currency: 'INR'
  },
  {
    id: '3',
    amount: 450.50,
    description: 'Ola ride to airport',
    category: expenseCategories[1],
    date: new Date('2025-05-10'),
    type: 'expense',
    tags: ['travel', 'transportation'],
    currency: 'INR'
  },
  {
    id: '4',
    amount: 3200,
    description: 'Electricity bill',
    category: expenseCategories[5],
    date: new Date('2025-05-05'),
    type: 'expense',
    tags: ['utilities', 'home'],
    currency: 'INR'
  },
  {
    id: '5',
    amount: 15000,
    description: 'Freelance project payment',
    category: incomeCategories[1],
    date: new Date('2025-05-12'),
    type: 'income',
    tags: ['freelance', 'work'],
    currency: 'INR'
  },
  {
    id: '6',
    amount: 7800.50,
    description: 'Dinner at Taj Restaurant',
    category: expenseCategories[0],
    date: new Date('2025-05-18'),
    type: 'expense',
    tags: ['food', 'dining'],
    currency: 'INR'
  },
  {
    id: '7',
    amount: 2499.99,
    description: 'Books from Amazon India',
    category: expenseCategories[7],
    date: new Date('2025-05-20'),
    type: 'expense',
    tags: ['education', 'books'],
    currency: 'INR'
  }
];