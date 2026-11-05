import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentNavbar } from './components/StudentNavbar';
import { AnimatedBackground } from './components/AnimatedBackground';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TakeExamPage } from './pages/TakeExamPage';
import { AnalysisWaitPage } from './pages/AnalysisWaitPage';
import { StudentReportPage } from './pages/StudentReportPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans relative selection:bg-indigo-500 selection:text-white">
          <AnimatedBackground />
          <StudentNavbar />
          <main className="flex-1 relative z-10">
            <Routes>
              {/* Public Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Student Portal */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam/:code"
                element={
                  <ProtectedRoute>
                    <TakeExamPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyzing/:submissionId"
                element={
                  <ProtectedRoute>
                    <AnalysisWaitPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report/:submissionId"
                element={
                  <ProtectedRoute>
                    <StudentReportPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
