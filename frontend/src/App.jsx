import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';


// Context Providers
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
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

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffManagement from './pages/admin/StaffManagement';
import ActivityLogs from './pages/admin/ActivityLogs';

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
                </Route>
              </Route>

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />

                <Route path="qr-generator" element={<QRGenerator />} />

                {/* Profile */}
                <Route path="/profile" element={<Profile />} />

                {/* Partners */}
                <Route path="/partners/customers" element={<ProtectedRoute roles={['admin', 'manager', 'staff']}><CustomerList /></ProtectedRoute>} />
                <Route path="/partners/suppliers" element={<ProtectedRoute roles={['admin', 'manager', 'staff']}><SupplierList /></ProtectedRoute>} />

                {/* QR & Inventory */}
                <Route path="/inventory/qr-scan" element={<ProtectedRoute roles={['admin', 'manager', 'staff']}><QRScannerPage /></ProtectedRoute>} />
                <Route path="/inventory/print-labels" element={<ProtectedRoute roles={['admin', 'manager']}><PrintLabels /></ProtectedRoute>} />

                {/* Transactions */}
                <Route path="/inventory/print-labels" element={<ProtectedRoute roles={['admin', 'manager']}><PrintLabels /></ProtectedRoute>} />

                {/* Products */}
                <Route path="/categories" element={<ProtectedRoute roles={['admin', 'manager']}><CategoryList /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute roles={['admin', 'manager', 'staff']}><ProductList /></ProtectedRoute>} />
                <Route path="/products/new" element={<ProtectedRoute roles={['admin', 'manager']}><ProductForm /></ProtectedRoute>} />
                <Route path="/products/edit/:id" element={<ProtectedRoute roles={['admin', 'manager']}><ProductForm /></ProtectedRoute>} />

                {/* Transactions */}
                <Route path="/transactions/new" element={<TransactionForm />} />
                <Route path="/transactions/:id" element={<TransactionDetail />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
// exporting the page

export default App;