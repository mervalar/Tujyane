import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';

import MainLayout      from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import DriverLayout    from './layouts/DriverLayout';
import AdminLayout     from './layouts/AdminLayout';
import ProtectedRoute  from './components/common/ProtectedRoute';

import Home          from './pages/Home';
import Trips         from './pages/Trips';
import Results       from './pages/Results';
import TripDetail    from './pages/TripDetail';
import Booking       from './pages/Booking';
import UserDashboard from './pages/UserDashboard';
import UserProfile   from './pages/UserProfile';

import LoginForm    from './features/auth/LoginForm';
import RegisterForm from './features/auth/RegisterForm';

import DriverDashboard  from './features/driver/Dashboard';
import DriverTrips      from './features/driver/Trips';
import DriverCreateTrip from './features/driver/CreateTrip';
import DriverProfile    from './features/driver/Profile';

import AdminDashboard from './features/admin/Dashboard';
import AdminUsers     from './features/admin/Users';
import AdminDrivers   from './features/admin/Drivers';
import AdminTrips     from './features/admin/Trips';
import AdminBookings  from './features/admin/Bookings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/"          element={<Home />} />
              <Route path="/trips"     element={<Trips />} />
              <Route path="/trips/:id" element={<TripDetail />} />
              <Route path="/results"   element={<Results />} />
              <Route path="/login"     element={<LoginForm />} />
              <Route path="/register"  element={<RegisterForm />} />
            </Route>

            {/* Booking — any authenticated user */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/book/:id" element={<Booking />} />
            </Route>

            {/* Passenger dashboard */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard"         element={<UserDashboard />} />
              <Route path="/dashboard/profile" element={<UserProfile />} />
            </Route>

            {/* Driver portal */}
            <Route element={<ProtectedRoute requiredRole="driver"><DriverLayout /></ProtectedRoute>}>
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
              <Route path="/driver/trips"     element={<DriverTrips />} />
              <Route path="/driver/create"    element={<DriverCreateTrip />} />
              <Route path="/driver/profile"   element={<DriverProfile />} />
            </Route>

            {/* Admin portal */}
            <Route element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin"           element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users"     element={<AdminUsers />} />
              <Route path="/admin/drivers"   element={<AdminDrivers />} />
              <Route path="/admin/trips"     element={<AdminTrips />} />
              <Route path="/admin/bookings"  element={<AdminBookings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
