import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
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
// import Products from './pages/Products/Products';
// import ProductDetail from './pages/Products/ProductDetail';
// import ProductForm from './pages/Products/ProductForm';
// import Categories from './pages/Categories/Categories';
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
import ProtectedRoute from './routes/ProtectedRoute';

// Theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f97316', // Orange 500
      light: '#fb923c',
      dark: '#c2410c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3b82f6', // Blue 500
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b',   // Slate 800
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  typography: {
    fontFamily: '"Inter", "Outfit", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 600, letterSpacing: '-0.025em' },
    h4: { fontWeight: 600, letterSpacing: '-0.025em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b7280 #1e293b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#1e293b",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b7280",
            minHeight: 24,
            border: "3px solid #1e293b",
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "#9ca3af",
          },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
            backgroundColor: "#9ca3af",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#9ca3af",
          },
          "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
            backgroundColor: "#2b2b2b",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: 'none',
          padding: '10px 20px',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        },
        head: {
          color: '#94a3b8',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
        }
      }
    }
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
        theme="light"
      />

      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />

                {/* Products */}
                {/* <Route path="products" element={<Products />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="products/:id/edit" element={<ProductForm />} /> */}

                {/* Categories */}
                {/* <Route path="categories" element={<Categories />} /> */}

                {/* QR Features */}
                {/* <Route path="scan" element={<QRScanner />} /> */}
                <Route path="qr-generator" element={<QRGenerator />} />

                {/* Inventory */}
                {/* <Route path="inventory/logs" element={<InventoryLogs />} /> */}

                {/* Reports */}
                {/* <Route path="reports" element={<Reports />} /> */}

                {/* Users (Admin only) */}
                {/* <Route path="users" element={
                  <ProtectedRoute roles={['admin']}>
                    <Users />
                  </ProtectedRoute>
                } /> */}

                {/* Profile */}
                <Route path="/profile" element={<Profile />} />

                {/* Partners */}
                <Route path="/partners/customers" element={<ProtectedRoute roles={['admin', 'manager', 'staff']}><CustomerList /></ProtectedRoute>} />
                <Route path="/partners/suppliers" element={<ProtectedRoute roles={['admin', 'manager', 'staff']}><SupplierList /></ProtectedRoute>} />

                {/* QR & Inventory */}
                <Route path="/inventory/qr-scan" element={<ProtectedRoute roles={['admin', 'manager', 'staff']}><QRScannerPage /></ProtectedRoute>} />
                <Route path="/inventory/print-labels" element={<ProtectedRoute roles={['admin', 'manager']}><PrintLabels /></ProtectedRoute>} />

                {/* Transactions */}
                <Route path="/transactions" element={<ProtectedRoute roles={['admin', 'manager', 'staff']}><TransactionList /></ProtectedRoute>} />
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

export default App;