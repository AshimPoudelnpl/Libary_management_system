import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBorrowedBooks, renewBook } from '../Redux/slices/borrowSlice';
import { toast } from 'react-toastify';

const MyBorrowedBooks = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { borrowedBooks, loading, message, error } = useSelector((state) => state.borrow);

  useEffect(() => {
    if (user?._id) {
      dispatch(getBorrowedBooks(user._id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (message) {
      toast.success(message);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRenew = (issueId) => {
    dispatch(renewBook(issueId));
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Borrowed Books</h1>
        <p className="text-gray-600 mt-2">Manage your borrowed books</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-600 py-12">Loading...</div>
      ) : borrowedBooks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">You haven't borrowed any books yet.</p>
          <p className="text-gray-500 mt-2">Browse our catalog to borrow books!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {borrowedBooks.map((borrow) => {
            const daysRemaining = getDaysRemaining(borrow.dueDate);
            const isOverdue = daysRemaining < 0;

            return (
              <div
                key={borrow._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {borrow.book?.title || 'Unknown Book'}
                    </h3>
                    <p className="text-gray-600 mb-1">
                      Author: {borrow.book?.author || 'Unknown'}
                    </p>
                    <p className="text-gray-600 mb-1">
                      Borrowed: {new Date(borrow.borrowDate).toLocaleDateString()}
                    </p>
                    <p
                      className={`font-medium ${
                        isOverdue ? 'text-red-600' : daysRemaining <= 3 ? 'text-yellow-600' : 'text-gray-600'
                      }`}
                    >
                      Due Date: {new Date(borrow.dueDate).toLocaleDateString()}
                      {isOverdue
                        ? ` (${Math.abs(daysRemaining)} days overdue)`
                        : ` (${daysRemaining} days remaining)`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-3 mt-4 md:mt-0">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        isOverdue
                          ? 'bg-red-100 text-red-800'
                          : daysRemaining <= 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {isOverdue ? 'Overdue' : daysRemaining <= 3 ? 'Due Soon' : 'Active'}
                    </span>
                    <button
                      onClick={() => handleRenew(borrow._id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                    >
                      Renew
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBorrowedBooks;

