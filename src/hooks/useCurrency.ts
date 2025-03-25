import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Currency, ExchangeRates } from '../types';
import { currencies } from '../data/currencies';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Free currency API endpoint
const API_URL = 'https://open.er-api.com/v6/latest';

// Get the INR currency object
const getINRCurrency = (): Currency => {
  return currencies.find(c => c.code === 'INR') || {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹'
  };
};

export function useCurrency() {
  // Always use INR as the base currency
  const [baseCurrency, setBaseCurrency] = useState<Currency>(getINRCurrency());
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch user settings from Supabase
  const fetchUserSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Check if we have settings data
      if (data && data.length === 0) {
        // Create default settings for new user with INR as base currency
        await createDefaultUserSettings();
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    }
  }, [user]);

  // Create default user settings
  const createDefaultUserSettings = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          base_currency: 'INR',
          theme: 'light'
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating default user settings:', error);
    }
  };

  // Update user settings when base currency changes
  const updateUserSettings = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          base_currency: 'INR',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  };

  // Fetch exchange rates
  const fetchExchangeRates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use a free currency API with INR as base
      const response = await axios.get(`${API_URL}/INR`);
      
      if (response.data && response.data.rates) {
        setExchangeRates(response.data.rates);
        setLastUpdated(new Date());
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
      setError('Failed to fetch exchange rates. Using fallback rates.');
      
      // Fallback to some static exchange rates if API fails
      setExchangeRates({
        INR: 1,
        USD: 0.012,
        EUR: 0.011,
        GBP: 0.0095,
        JPY: 1.81,
        CAD: 0.016,
        AUD: 0.018,
        CNY: 0.087,
        BRL: 0.061,
        MXN: 0.20
      });
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  // Change base currency - now always sets to INR
  const changeBaseCurrency = async () => {
    // This function now does nothing as we always use INR
    // But we keep it for compatibility with the rest of the code
    return;
  };

  // Convert amount from one currency to another
  const convertAmount = (amount: number, from: string, to: string = 'INR'): number => {
    if (from === to) return amount;
    
    // If we don't have exchange rates yet, return the original amount
    if (Object.keys(exchangeRates).length === 0) return amount;
    
    // Get rates relative to base currency
    const fromRate = exchangeRates[from] || 1;
    const toRate = exchangeRates[to] || 1;
    
    // Convert to base currency first, then to target currency
    return (amount / fromRate) * toRate;
  };

  // Format amount with currency symbol
  const formatAmountWithCurrency = (amount: number, currencyCode: string = 'INR'): string => {
    const currency = currencies.find(c => c.code === currencyCode);
    const symbol = currency?.symbol || '₹';
    
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Initial fetch of user settings and exchange rates
  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user, fetchUserSettings]);

  // Fetch exchange rates when component mounts
  useEffect(() => {
    fetchExchangeRates();
    
    // Refresh exchange rates every hour
    const intervalId = setInterval(() => {
      fetchExchangeRates();
    }, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return {
    baseCurrency,
    currencies,
    exchangeRates,
    isLoading,
    lastUpdated,
    error,
    changeBaseCurrency,
    convertAmount,
    formatAmountWithCurrency,
    refreshRates: fetchExchangeRates
  };
}