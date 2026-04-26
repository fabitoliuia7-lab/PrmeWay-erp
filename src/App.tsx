/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientsList from './pages/ClientsList';
import ClientDetail from './pages/ClientDetail';
import SalesList from './pages/SalesList';
import SaleDetail from './pages/SaleDetail';
import OpportunitiesList from './pages/OpportunitiesList';
import OpportunityDetail from './pages/OpportunityDetail';
import Reports from './pages/Reports';
import Tasks from './pages/Tasks';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<ClientsList />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="opportunities" element={<OpportunitiesList />} />
        <Route path="opportunities/:id" element={<OpportunityDetail />} />
        <Route path="sales" element={<SalesList />} />
        <Route path="sales/:id" element={<SaleDetail />} />
        <Route path="agenda" element={<Tasks />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

