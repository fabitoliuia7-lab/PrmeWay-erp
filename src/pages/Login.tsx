import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

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
          {!imgError ? (
            <div className="w-24 h-24 flex items-center justify-center mb-4">
              <img 
                src="/logo.png?v=2" 
                alt="Primeway Logo" 
                className="w-full h-full object-contain drop-shadow-md"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center justify-center mb-4">
              <span className="text-3xl font-bold">P</span>
            </div>
          )}
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
