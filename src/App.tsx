
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import AgeSelect from './pages/AgeSelect';
import ParentSettings from './pages/ParentSettings';
import MathTutor from '@/components/tutors/MathTutor';
import LanguageTutor from '@/components/tutors/LanguageTutor';
import ScienceTutor from '@/components/tutors/ScienceTutor';
import Achievements from '@/pages/Achievements';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/age-select"
            element={
              <ProtectedRoute>
                <AgeSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent-settings"
            element={
              <ProtectedRoute>
                <ParentSettings />
              </ProtectedRoute>
            }
          />
          <Route path="/tutors/math" element={
            <ProtectedRoute>
              <MathTutor />
            </ProtectedRoute>
          } />
          <Route path="/tutors/language" element={
            <ProtectedRoute>
              <LanguageTutor />
            </ProtectedRoute>
          } />
          <Route path="/tutors/science" element={
            <ProtectedRoute>
              <ScienceTutor />
            </ProtectedRoute>
          } />
          <Route path="/achievements" element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
