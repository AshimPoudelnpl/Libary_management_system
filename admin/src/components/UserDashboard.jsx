import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBorrowedBooks } from '../Redux/slices/borrowSlice';
import { getAllBooks } from '../Redux/slices/bookSlice';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { borrowedBooks } = useSelector((state) => state.borrow);
  const { books } = useSelector((state) => state.book);

  useEffect(() => {
    if (user?._id) {
      dispatch(getBorrowedBooks(user._id));
    }
    dispatch(getAllBooks());
  }, [dispatch, user]);

  const stats = [
    {
      title: 'Borrowed Books',
      value: borrowedBooks.length || 0,
      icon: '📖',
      color: 'bg-blue-500',
    },
    {
      title: 'Available Books',
      value: books.filter((b) => b.availableCopies > 0).length || 0,
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      title: 'Total Books',
      value: books.length || 0,
      icon: '📚',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name || 'User'}!</h1>
        <p className="text-gray-600 mt-2">Here's your library overview</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
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

      {/* Borrowed Books */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Borrowed Books</h2>
        {borrowedBooks.length === 0 ? (
          <p className="text-gray-600">You haven't borrowed any books yet.</p>
        ) : (
          <div className="space-y-3">
            {borrowedBooks.slice(0, 5).map((borrow) => (
              <div
                key={borrow._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">{borrow.book?.title}</p>
                  <p className="text-sm text-gray-600">
                    Due Date: {new Date(borrow.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    new Date(borrow.dueDate) < new Date()
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {new Date(borrow.dueDate) < new Date() ? 'Overdue' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

