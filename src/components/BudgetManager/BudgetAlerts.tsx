import React from 'react';
import { BudgetAlert } from '../../types';
import { useBudget } from '../../context/BudgetContext';
import { format } from 'date-fns';
import { Bell, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

type BudgetAlertsProps = {
  formatAmountWithCurrency: (amount: number) => string;
};

export default function BudgetAlerts({ formatAmountWithCurrency }: BudgetAlertsProps) {
  const { alerts, markAlertAsSeen, clearAllAlerts } = useBudget();
  
  // Filter for unread alerts and sort by date (newest first)
  const unreadAlerts = alerts
    .filter(alert => !alert.seen)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  
  if (unreadAlerts.length === 0) {
    return null;
  }
  
  const getAlertIcon = (percentage: number) => {
    if (percentage >= 100) {
      return <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />;
    } else if (percentage >= 90) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBgColor = (percentage: number) => {
    if (percentage >= 100) {
      return 'bg-red-50 hover:bg-red-100';
    } else if (percentage >= 90) {
      return 'bg-yellow-50 hover:bg-yellow-100';
    }
    return 'hover:bg-gray-100';
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2 animate-bell" />
            <h3 className="font-medium">Budget Alerts</h3>
            <span className="ml-2 bg-white text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {unreadAlerts.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={clearAllAlerts}
              className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 py-1 rounded transition-colors"
              title="Clear all alerts"
            >
              Clear All
            </button>
            
            <button
              onClick={clearAllAlerts}
              className="text-white hover:text-blue-200 transition-colors"
              title="Close alerts"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {unreadAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={cn(
                "border-b border-gray-100 last:border-b-0 p-4 transition-colors cursor-pointer",
                getAlertBgColor(alert.percentage)
              )}
              onClick={() => markAlertAsSeen(alert.id)}
              title="Click to dismiss"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.percentage)}
                  
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-gray-500">
                        {format(alert.date, 'MMM d, h:mm a')}
                      </p>
                    </div>
                    
                    <div className="mt-2 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600">
                          {formatAmountWithCurrency(alert.spentAmount)} / {formatAmountWithCurrency(alert.budgetAmount)}
                        </span>
                        <span className={cn(
                          "font-medium px-2 py-0.5 rounded-full text-white",
                          alert.percentage >= 100 ? "bg-red-500" : 
                          alert.percentage >= 90 ? "bg-yellow-500" : "bg-blue-500"
                        )}>
                          {alert.percentage.toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={cn(
                            "h-2 transition-all duration-500 ease-out",
                            alert.percentage >= 100 ? "bg-red-500" :
                            alert.percentage >= 90 ? "bg-yellow-500" : "bg-blue-500"
                          )}
                          style={{ 
                            width: `${Math.min(alert.percentage, 100)}%`,
                            transition: 'width 0.5s ease-out'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>
        {`
          @keyframes bell {
            0%, 100% { transform: rotate(0); }
            25% { transform: rotate(10deg); }
            75% { transform: rotate(-10deg); }
          }
          .animate-bell {
            animation: bell 1s infinite;
          }
        `}
      </style>
    </div>
  );
}