import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import HomePage from './components/HomePage';
import Navbar from './components/shared/Navbar';
import { AppContainer, MainContent } from './components/shared/Layout';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import CameraManagement from './components/admin/CameraManagement';
import DetectionHistory from './components/admin/DetectionHistory';
import EmergencyManagement from './components/admin/EmergencyManagement';
import SystemMonitoring from './components/admin/SystemMonitoring';

// User Components
import UserDashboard from './components/user/UserDashboard';
import AlertsPage from './components/user/AlertsPage';
import EvidenceViewer from './components/user/EvidenceViewer';
import ActivityTimeline from './components/user/ActivityTimeline';
import ReportsPage from './components/user/ReportsPage';
import EmergencyInfo from './components/user/EmergencyInfo';

/**
 * Main App Component
 * Handles routing and layout for the entire application
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route - Home Page */}
            <Route path="/" element={<HomePage />} />

            {/* Public Route - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Public Route - Signup */}
            <Route path="/signup" element={<Signup />} />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/user/*"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserLayout />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * Admin Layout Component
 * Layout wrapper for admin module with navbar and routes
 */
const AdminLayout = () => {
  return (
    <AppContainer>
      <Navbar />
      <MainContent>
        <Routes>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="cameras" element={<CameraManagement />} />
          <Route path="detections" element={<DetectionHistory />} />
          <Route path="emergency" element={<EmergencyManagement />} />
          <Route path="monitoring" element={<SystemMonitoring />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
};

/**
 * User Layout Component
 * Layout wrapper for user module with navbar and routes
 */
const UserLayout = () => {
  return (
    <AppContainer>
      <Navbar />
      <MainContent>
        <Routes>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="evidence" element={<EvidenceViewer />} />
          <Route path="timeline" element={<ActivityTimeline />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="emergency" element={<EmergencyInfo />} />
          <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
};

export default App;
