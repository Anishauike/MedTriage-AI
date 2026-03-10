import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Queue } from './pages/Queue';
import { History } from './pages/History';
import { AmbulanceAlerts } from './pages/AmbulanceAlerts';
import { Login } from './pages/Login';
import { UserManagement } from './pages/UserManagement';
import { TriageProvider } from './context/TriageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: UserRole[] }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to the first allowed page for their role
    if (user.role === 'Ambulance Controller') {
      return <Navigate to="/ambulance-alerts" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <TriageProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute roles={['Admin', 'Receptionist']}>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/queue" element={
              <ProtectedRoute roles={['Admin', 'Receptionist']}>
                <Layout><Queue /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute roles={['Admin', 'Receptionist']}>
                <Layout><History /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/ambulance-alerts" element={
              <ProtectedRoute roles={['Admin', 'Receptionist', 'Ambulance Controller']}>
                <Layout><AmbulanceAlerts /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute roles={['Admin']}>
                <Layout><UserManagement /></Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </TriageProvider>
    </AuthProvider>
  );
}
