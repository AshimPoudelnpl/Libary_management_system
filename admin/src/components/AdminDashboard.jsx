import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardStats } from '../Redux/slices/issueSlice';
import { getAllBooks } from '../Redux/slices/bookSlice';
import { getAllUsers } from '../Redux/slices/userSlice';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading: statsLoading } = useSelector((state) => state.issue);
  const { books, loading: booksLoading } = useSelector((state) => state.book);
  const { users, loading: usersLoading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getAllBooks());
    dispatch(getAllUsers());
  }, [dispatch]);

  const stats = dashboardStats || {
    totalBooks: books.length || 0,
    totalUsers: users.length || 0,
    issuedBooks: 0,
    availableBooks: books.filter((b) => b.available).length || 0,
  };

  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks || books.length,
      icon: '📚',
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers || users.length,
      icon: '👥',
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      title: 'Issued Books',
      value: stats.issuedBooks || 0,
      icon: '📖',
      color: 'bg-yellow-500',
      change: '+3%',
    },
    {
      title: 'Available Books',
      value: stats.availableBooks || 0,
      icon: '✅',
      color: 'bg-indigo-500',
      change: '+8%',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                <p className="text-green-600 text-sm mt-2">{stat.change}</p>
              </div>
              <div
                className={`${stat.color} w-16 h-16 rounded-lg flex items-center justify-center text-3xl`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Books */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Books</h2>
          {booksLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : books.length === 0 ? (
            <p className="text-gray-600">No books available</p>
          ) : (
            <div className="space-y-3">
              {books.slice(0, 5).map((book) => (
                <div
                  key={book._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{book.title}</p>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      book.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {book.available ? 'Available' : 'Issued'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Users</h2>
          {usersLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-600">No users available</p>
          ) : (
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition text-left">
            <span className="text-2xl mb-2 block">➕</span>
            <p className="font-medium text-gray-800">Add New Book</p>
            <p className="text-sm text-gray-600">Add a new book to the library</p>
          </button>
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-left">
            <span className="text-2xl mb-2 block">👤</span>
            <p className="font-medium text-gray-800">Add New User</p>
            <p className="text-sm text-gray-600">Register a new library user</p>
          </button>
          <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-left">
            <span className="text-2xl mb-2 block">📋</span>
            <p className="font-medium text-gray-800">View Issues</p>
            <p className="text-sm text-gray-600">Check all book issues</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

