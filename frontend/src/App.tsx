import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import RestaurantMenu from './pages/RestaurantMenu';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import type { ReactNode } from 'react';

// Protected Route Wrapper
const ProtectedRoute = ({ children, role }: { children: ReactNode, role?: 'CUSTOMER' | 'ADMIN' }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />; // Redirect if not authorized
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />

                {/* Customer Routes */}
                <Route path="/" element={
                  <ProtectedRoute role="CUSTOMER">
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/restaurant/:id" element={
                  <ProtectedRoute role="CUSTOMER">
                    <RestaurantMenu />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute role="CUSTOMER">
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute role="CUSTOMER">
                    <Checkout />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute role="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
