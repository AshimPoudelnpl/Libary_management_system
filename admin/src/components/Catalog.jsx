import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBooks } from '../Redux/slices/bookSlice';
import { borrowBook } from '../Redux/slices/borrowSlice';
import { toast } from 'react-toastify';

const Catalog = () => {
  const dispatch = useDispatch();
  const { books, loading } = useSelector((state) => state.book);
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    dispatch(getAllBooks());
  }, [dispatch]);

  const handleBorrow = (bookId) => {
    if (!user) {
      toast.error('Please login to borrow books');
      return;
    }
    dispatch(borrowBook({ bookId, userId: user._id }));
  };

  const categories = ['all', ...new Set(books.map((book) => book.category).filter(Boolean))];

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory && book.availableCopies > 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Book Catalog</h1>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="text-center text-gray-600 py-12">Loading books...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center text-gray-600 py-12">No books found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{book.title}</h3>
                <p className="text-gray-600 mb-2">by {book.author}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {book.category}
                  </span>
                  <span className="text-sm text-gray-600">
                    {book.availableCopies} available
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-4">ISBN: {book.isbn}</div>
                <button
                  onClick={() => handleBorrow(book._id)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Borrow Book
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;

