import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OTP from './pages/OTP';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import BookManagement from './components/BookManagement';
import Users from './components/Users';
import Catalog from './components/Catalog';
import MyBorrowedBooks from './components/MyBorrowedBooks';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/user-dashboard'} replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/otp-verification/:email" element={<OTP />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        >
          {/* Admin Routes */}
          <Route
            path="dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="books"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <BookManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="users"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="issues"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="p-8">
                  <h1 className="text-3xl font-bold text-gray-800">Issues Management</h1>
                  <p className="text-gray-600 mt-2">Manage all book issues here</p>
                </div>
              </PrivateRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="user-dashboard"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="catalog"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <Catalog />
              </PrivateRoute>
            }
          />
          <Route
            path="my-books"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <MyBorrowedBooks />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
};

export default App;
