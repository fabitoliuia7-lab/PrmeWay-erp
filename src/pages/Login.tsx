import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Falha ao fazer login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-24 h-24 flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Primeway Logo" 
              className="w-full h-full object-contain drop-shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M35,28 L35,85 L55,95 L55,25 Z' fill='%234b85c5'/%3E%3Cpath d='M25,40 C 25,25 45,15 65,15 C 90,15 95,40 80,60 C 70,75 55,65 55,65 L 55,45 C 55,45 70,55 75,45 C 80,30 55,30 50,30 L 25,45 Z' fill='%23283583'/%3E%3C/svg%3E`;
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-center tracking-tight">Primeway ERP</h1>
          <p className="text-slate-500 mt-2 text-sm uppercase tracking-widest font-bold">Acesso ao Sistema</p>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-50 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-5 h-5"/>
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
