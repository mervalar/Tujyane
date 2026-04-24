import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';

import MainLayout      from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute  from './components/common/ProtectedRoute';

import Home            from './pages/Home';
import Results         from './pages/Results';
import TripDetail      from './pages/TripDetail';
import Booking         from './pages/Booking';
import UserDashboard   from './pages/UserDashboard';
import DriverDashboard from './pages/DriverDashboard';
import CreateTrip      from './pages/CreateTrip';

import LoginForm    from './features/auth/LoginForm';
import RegisterForm from './features/auth/RegisterForm';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/"          element={<Home />} />
              <Route path="/results"   element={<Results />} />
              <Route path="/trips/:id" element={<TripDetail />} />
              <Route path="/login"     element={<LoginForm />} />
              <Route path="/register"  element={<RegisterForm />} />
            </Route>

            {/* Booking — any authenticated user */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/book/:id" element={<Booking />} />
            </Route>

            {/* Passenger dashboard */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<UserDashboard />} />
            </Route>

            {/* Driver-only routes */}
            <Route element={<ProtectedRoute requiredRole="driver"><DashboardLayout /></ProtectedRoute>}>
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
              <Route path="/driver/create"    element={<CreateTrip />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
