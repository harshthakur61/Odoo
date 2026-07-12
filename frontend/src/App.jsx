import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import DriverVerification from './pages/DriverVerification';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Fuel from './pages/Fuel';
import Reports from './pages/Reports';
import DriverDashboard from './pages/DriverDashboard';
import DriverHistory from './pages/DriverHistory';
import DriverProfile from './pages/DriverProfile';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Standard Dashboard Layout for office staff */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/vehicles" element={
                <ProtectedRoute allowedRoles={['Fleet Manager', 'Dispatcher', 'Financial Analyst']}>
                  <Vehicles />
                </ProtectedRoute>
              } />
              <Route path="/drivers" element={
                <ProtectedRoute allowedRoles={['Fleet Manager', 'Dispatcher', 'Safety Officer']}>
                  <Drivers />
                </ProtectedRoute>
              } />
              <Route path="/driver-verification" element={
                <ProtectedRoute allowedRoles={['Fleet Manager']}>
                  <DriverVerification />
                </ProtectedRoute>
              } />
              <Route path="/trips" element={
                <ProtectedRoute allowedRoles={['Dispatcher', 'Safety Officer', 'Financial Analyst']}>
                  <Trips />
                </ProtectedRoute>
              } />
              <Route path="/maintenance" element={
                <ProtectedRoute allowedRoles={['Fleet Manager', 'Safety Officer', 'Financial Analyst']}>
                  <Maintenance />
                </ProtectedRoute>
              } />
              <Route path="/fuel" element={
                <ProtectedRoute allowedRoles={['Financial Analyst']}>
                  <Fuel />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['Safety Officer', 'Financial Analyst']}>
                  <Reports />
                </ProtectedRoute>
              } />

              {/* Driver Portal Pages */}
              <Route path="/driver-portal" element={
                <ProtectedRoute allowedRoles={['Driver']}>
                  <DriverDashboard />
                </ProtectedRoute>
              } />
              <Route path="/driver/history" element={
                <ProtectedRoute allowedRoles={['Driver']}>
                  <DriverHistory />
                </ProtectedRoute>
              } />
              <Route path="/driver/profile" element={
                <ProtectedRoute allowedRoles={['Driver']}>
                  <DriverProfile />
                </ProtectedRoute>
              } />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
