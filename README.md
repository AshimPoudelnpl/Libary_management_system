# Library Management System

A comprehensive library management system built with React.js frontend and Node.js backend, featuring modern state management with RTK Query and MySQL database.

## 🚀 Features

### Admin/Librarian Features
- **User Management**: Add, edit, delete, and view library members
- **Book Management**: Complete CRUD operations for books, authors, publishers, and categories
- **Issue Management**: Issue books to users, track due dates, and manage returns
- **Fine Management**: Automatic fine calculation for overdue books
- **Dashboard**: Real-time statistics and analytics
- **Reservation System**: Handle book reservations and waitlists

### User Features
- **Book Search**: Browse and search available books
- **Book Borrowing**: Request and manage borrowed books
- **Reservation**: Reserve books that are currently unavailable
- **Fine Payment**: View and pay outstanding fines
- **Profile Management**: Update personal information

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Redux Toolkit Query (RTK Query)** - State management and API calls
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Library Management System/
├── admin/                  # Frontend (React.js)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── Redux/         # State management
│   │   │   ├── slices/    # RTK Query API slices
│   │   │   └── store.js   # Redux store configuration
│   │   └── App.js
│   └── package.json
├── backend/               # Backend (Node.js)
│   ├── controllers/       # Route handlers
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication & validation
│   ├── config/           # Database configuration
│   ├── schema/           # Database schema
│   └── index.js
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Library Management System"
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd admin
   npm install
   ```

4. **Database Setup**
   - Create a MySQL database
   - Run the SQL schema from `backend/schema/table.sql`
   - Update database credentials in `backend/.env`

5. **Environment Variables**
   Create `.env` file in backend directory:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=library_management
   DB_PORT=3306
   JWT_SECRET=your_jwt_secret
   PORT=4000
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Server runs on `http://localhost:4000`

2. **Start Frontend**
   ```bash
   cd admin
   npm start
   ```
   Application runs on `http://localhost:5173`

## 📊 Database Schema

### Core Tables
- **users** - Library members and staff
- **books** - Book information
- **authors** - Author details
- **publishers** - Publisher information
- **categories** - Book categories
- **book_copies** - Individual book copies with barcodes
- **issued_books** - Book borrowing records
- **reservations** - Book reservation system
- **fines** - Fine management

## 🔐 Authentication & Authorization

### Roles
- **ADMIN** - Full system access
- **LIBRARIAN** - Book and user management
- **MEMBER** - Basic user operations

### Security Features
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Protected API routes

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/dashboard` - Dashboard statistics

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Add new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Add new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Issues
- `GET /api/issues` - Get all issued books
- `POST /api/issues` - Issue a book
- `PUT /api/issues/:id/return` - Return a book

## 🔄 State Management

The application uses **RTK Query** for efficient state management:

### API Slices
- **authAPIs** - Authentication operations
- **userAPIs** - User management
- **bookAPIs** - Book operations
- **issueAPIs** - Book issuing/returning
- **borrowAPIs** - User borrowing operations

### Features
- Automatic caching and refetching
- Optimistic updates
- Built-in loading states
- Error handling
- Cache invalidation

## 🎨 UI Components

### Key Components
- **Users.jsx** - User management interface
- **Books.jsx** - Book management interface
- **Dashboard.jsx** - Statistics and overview
- **Login.jsx** - Authentication form
- **Register.jsx** - User registration

### Styling
- Tailwind CSS for responsive design
- Modern card-based layouts
- Interactive tables and forms
- Toast notifications for user feedback

## 🚀 Deployment

### Backend Deployment
1. Set up production database
2. Configure environment variables
3. Deploy to cloud service (AWS, Heroku, etc.)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Update API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Password reset functionality needs implementation
- Email notifications not yet implemented
- Advanced search filters pending

## 🔮 Future Enhancements

- [ ] Email notifications for due dates
- [ ] Advanced reporting system
- [ ] Mobile app development
- [ ] Barcode scanning integration
- [ ] Multi-library support
- [ ] Digital book management

## 📞 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using React.js and Node.js**