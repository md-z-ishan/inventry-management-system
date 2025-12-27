import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';


// Context Providers
import { AuthProvider } from './context/AuthContext';

// Layout Components
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
// Dashboard is now AdminDashboard or UserDashboard
import ProductForm from './pages/ProductForm';
import CategoryList from './pages/Categories/CategoryList';
import ProductList from './pages/ProductList';
import QRScannerPage from './pages/QRScannerPage';
import QRGenerator from './pages/QRGeneratorPage';
// import InventoryLogs from './pages/Inventory/InventoryLogs';
// import Reports from './pages/Reports/Reports';
// import Users from './pages/Users/Users';
import Profile from './pages/Profile';
import SupplierList from './pages/SupplierList';
import CustomerList from './pages/CustomerList';
import TransactionList from './pages/TransactionList';
import TransactionForm from './pages/TransactionForm';
import TransactionDetail from './pages/TransactionDetail';
import PrintLabels from './pages/PrintLabels';

// Protected Route
// Protected Route
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import UserRoute from './components/common/UserRoute';
import RoleBasedRedirect from './components/common/RoleBasedRedirect';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffManagement from './pages/admin/StaffManagement';
import ActivityLogs from './pages/admin/ActivityLogs';

// User Pages
import UserLayout from './components/layout/UserLayout';
import UserDashboard from './pages/user/UserDashboard';

// Theme
// you can choose any theme, dark or light suitable to you

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="staff" element={<StaffManagement />} />
                  <Route path="logs" element={<ActivityLogs />} />

                  {/* Inventory & Products */}
                  <Route path="products" element={<ProductList />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/edit/:id" element={<ProductForm />} />
                  <Route path="categories" element={<CategoryList />} />

                  {/* Partners */}
                  <Route path="suppliers" element={<SupplierList />} />
                  <Route path="customers" element={<CustomerList />} />

                  {/* Operational */}
                  <Route path="scan" element={<QRScannerPage />} />
                  <Route path="print-labels" element={<PrintLabels />} />
                  <Route path="qr-generator" element={<QRGenerator />} />

                  {/* Transactions */}
                  <Route path="transactions" element={<TransactionList />} />
                  <Route path="transactions/new" element={<TransactionForm />} />
                  <Route path="transactions/:id" element={<TransactionDetail />} />

                  {/* Profile */}
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>

              {/* User/Staff Routes */}
              <Route path="/user" element={<UserRoute />}>
                <Route element={<UserLayout />}>
                  <Route index element={<UserDashboard />} />
                  <Route path="scan" element={<QRScannerPage />} />
                  <Route path="products" element={<ProductList />} />
                  <Route path="transactions" element={<TransactionList />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>

              {/* Root Redirect Logic */}
              <Route path="/" element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              } />

              {/* Legacy/Fallback - Redirect everything else to root */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </ThemeProvider >
  );
}
// exporting the page

export default App;