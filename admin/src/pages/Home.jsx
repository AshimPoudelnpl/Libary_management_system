import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import { Outlet } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Redirect based on user role
    if (user?.role === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/user-dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-[calc(100vh-4rem)] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Home;
