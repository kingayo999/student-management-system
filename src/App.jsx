import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import AuditLogs from './pages/AuditLogs';
import Payments from './pages/Payments';
import Result from './pages/Result';
import Accommodation from './pages/Accommodation';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route element={<ProtectedRoute allowedRoles={['admin', 'staff', 'student']} />}>
              <Route element={<Layout><Dashboard /></Layout>} path="/" />
              <Route element={<Layout><Profile /></Layout>} path="/profile" />
              <Route element={<Layout><Courses /></Layout>} path="/courses" />
              <Route element={<Layout><Payments /></Layout>} path="/payments" />
              <Route element={<Layout><Result /></Layout>} path="/result" />
              <Route element={<Layout><Accommodation /></Layout>} path="/accommodation" />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
              <Route element={<Layout><Students /></Layout>} path="/students" />
              <Route element={<Layout><AuditLogs /></Layout>} path="/audit" />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}


export default App;
