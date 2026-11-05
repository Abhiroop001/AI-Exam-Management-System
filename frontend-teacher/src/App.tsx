import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AnimatedBackground } from './components/AnimatedBackground';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateExamPage } from './pages/CreateExamPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { ExamSubmissionsPage } from './pages/ExamSubmissionsPage';
import { StudentReportDetailPage } from './pages/StudentReportDetailPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
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
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans relative selection:bg-purple-500 selection:text-white">
          <AnimatedBackground />
          <Navbar />
          <main className="flex-1 relative z-10">
            <Routes>
              {/* Public Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Teacher Studio */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-exam"
                element={
                  <ProtectedRoute>
                    <CreateExamPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/monitor/:examId"
                element={
                  <ProtectedRoute>
                    <LiveMonitorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam/:examId/submissions"
                element={
                  <ProtectedRoute>
                    <ExamSubmissionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report/:submissionId"
                element={
                  <ProtectedRoute>
                    <StudentReportDetailPage />
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
