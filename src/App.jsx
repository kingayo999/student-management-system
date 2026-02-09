import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './components/common/Loading';

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Students = lazy(() => import('./pages/Academic/Students'));
const Courses = lazy(() => import('./pages/Academic/Courses'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const AuditLogs = lazy(() => import('./pages/Admin/AuditLogs'));
const Payments = lazy(() => import('./pages/Finance/Payments'));
const Result = lazy(() => import('./pages/Academic/Result'));
const Accommodation = lazy(() => import('./pages/Finance/Accommodation'));
const Unauthorized = lazy(() => import('./pages/Auth/Unauthorized'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
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
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<Layout><AuditLogs /></Layout>} path="/audit" />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
