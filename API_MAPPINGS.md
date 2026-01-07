# API Endpoint Mappings - Frontend to Backend

## Authentication Routes
- **Login**: `POST /api/auth/login`
- **Register**: `POST /api/auth/register` 
- **Logout**: `POST /api/auth/logout`
- **Dashboard Stats**: `GET /api/auth/dashboard`

## Book Management Routes
- **Get All Books**: `GET /api/books`
- **Get Book by ID**: `GET /api/books/:id`
- **Add Book**: `POST /api/books` (Admin/Librarian only)
- **Update Book**: `PUT /api/books/:id` (Admin/Librarian only)
- **Delete Book**: `DELETE /api/books/:id` (Admin/Librarian only)

## User Management Routes
- **Get All Users**: `GET /api/users` (Admin/Librarian only)
- **Get User by ID**: `GET /api/users/:id`
- **Add User**: `POST /api/users` (Admin/Librarian only)
- **Update User**: `PUT /api/users/:id` (Admin/Librarian only)
- **Delete User**: `DELETE /api/users/:id` (Admin only)

## Issue/Borrow Management Routes
- **Get All Issues**: `GET /api/issues`
- **Get Issues by User**: `GET /api/issues/user/:user_id`
- **Get Issue by ID**: `GET /api/issues/:id`
- **Issue Book**: `POST /api/issues` (Admin/Librarian only)
- **Return Book**: `PUT /api/issues/:id/return` (Admin/Librarian only)

## Reservation Routes
- **Get Reservations**: `GET /api/reservations?user_id=:userId`
- **Create Reservation**: `POST /api/reservations`

## Fine Management Routes
- **Get Fines**: `GET /api/fines?user_id=:userId`
- **Pay Fine**: `PUT /api/fines/:id/pay`

## Additional Available Routes
- **Categories**: `/api/categories`
- **Publishers**: `/api/publishers`
- **Authors**: `/api/authors`
- **Book Copies**: `/api/book-copies`

## Redux Slice Mappings

### authSlice.js
- Connected to `/api/auth/*` endpoints
- Handles login, register, logout, dashboard stats

### bookSlice.js  
- Connected to `/api/books/*` endpoints
- Handles CRUD operations for books

### userSlice.js
- Connected to `/api/users/*` endpoints  
- Handles CRUD operations for users

### issueSlice.js
- Connected to `/api/issues/*` and `/api/auth/dashboard` endpoints
- Handles book issuing, returning, and dashboard stats

### borrowSlice.js
- Connected to `/api/issues/user/*`, `/api/reservations`, `/api/fines` endpoints
- Handles user-specific borrowing, reservations, and fines

### popupSlice.js
- UI state management only (no API calls)
- Handles modal/popup state

## Authentication & Authorization
- Most routes require authentication via middleware
- Admin/Librarian roles required for management operations
- CORS enabled for `http://localhost:5173` (frontend)
- Credentials included in requests (`withCredentials: true`)

## Error Handling
- All API calls include proper error handling
- Error messages extracted from `err.response.data.message`
- Loading states managed in Redux slices