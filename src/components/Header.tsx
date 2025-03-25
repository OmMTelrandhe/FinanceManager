import React, { useState } from 'react';
import { Wallet, Globe, ChevronDown, LogIn, LogOut, User } from 'lucide-react';
import { Currency } from '../types';
import AuthModal from './Auth/AuthModal';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

type HeaderProps = {
  baseCurrency: Currency;
  currencies: Currency[];
  onChangeCurrency: (currencyCode: string) => void;
};

export default function Header({ baseCurrency, currencies, onChangeCurrency }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };
  
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">Paisa Controller</h1>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center text-white bg-blue-700 px-3 py-1.5 rounded-md mr-4">
              <Globe className="h-4 w-4 mr-1" />
              <span>{baseCurrency.code} ({baseCurrency.symbol})</span>
            </div>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-white hover:bg-blue-800 px-3 py-1.5 rounded-md"
                >
                  <User className="h-4 w-4 mr-1" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2 text-gray-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center text-white hover:bg-blue-800 px-3 py-1.5 rounded-md"
              >
                <LogIn className="h-4 w-4 mr-1" />
                <span>Sign In</span>
              </button>
            )}
            
            <p className="text-sm ml-4 hidden md:block">AI-Powered Expense & Budget Manager</p>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  );
}