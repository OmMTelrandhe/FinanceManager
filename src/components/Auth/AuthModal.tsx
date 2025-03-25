import React, { useState } from "react";
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type AuthView = "login" | "register";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>("login");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-transparent rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {view === "login" ? (
              <LoginForm
                onSuccess={onClose}
                onRegisterClick={() => setView("register")}
              />
            ) : (
              <RegisterForm
                onSuccess={onClose}
                onLoginClick={() => setView("login")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
