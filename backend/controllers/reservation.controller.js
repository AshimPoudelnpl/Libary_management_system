import db from "../config/db.js";

// Get all reservations
export const getAllReservations = async (req, res) => {
  try {
    const { status, user_id, book_id } = req.query;
    let query = `
      SELECT 
        r.reservation_id, r.reservation_date, r.status,
        u.user_id, u.name as user_name, u.email as user_email,
        b.book_id, b.title as book_title, b.isbn
      FROM reservations r
      JOIN users u ON r.user_id = u.user_id
      JOIN books b ON r.book_id = b.book_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += " AND r.status = ?";
      params.push(status);
    }

    if (user_id) {
      query += " AND r.user_id = ?";
      params.push(user_id);
    }

    if (book_id) {
      query += " AND r.book_id = ?";
      params.push(book_id);
    }

    query += " ORDER BY r.reservation_date DESC";

    const [reservations] = await db.execute(query, params);
    res.status(200).json({ reservations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservation by ID
export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const [reservations] = await db.execute(
      `SELECT 
        r.reservation_id, r.reservation_date, r.status,
        u.user_id, u.name as user_name, u.email as user_email, u.phone,
        b.book_id, b.title as book_title, b.isbn, b.publication_year,
        p.name as publisher_name,
        c.category_name
      FROM reservations r
      JOIN users u ON r.user_id = u.user_id
      JOIN books b ON r.book_id = b.book_id
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      WHERE r.reservation_id = ?`,
      [id]
    );

    if (reservations.length === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(200).json({ reservation: reservations[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create reservation
export const createReservation = async (req, res) => {
  try {
    const { user_id, book_id } = req.body;

    if (!user_id || !book_id) {
      return res.status(400).json({ 
        error: "User ID and Book ID are required" 
      });
    }

    // Check if user exists
    const [users] = await db.execute(
      "SELECT user_id FROM users WHERE user_id = ?",
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if book exists
    const [books] = await db.execute(
      "SELECT book_id FROM books WHERE book_id = ?",
      [book_id]
    );

    if (books.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Check if user already has a pending reservation for this book
    const [existingReservations] = await db.execute(
      "SELECT reservation_id FROM reservations WHERE user_id = ? AND book_id = ? AND status = 'PENDING'",
      [user_id, book_id]
    );

    if (existingReservations.length > 0) {
      return res.status(409).json({ 
        error: "You already have a pending reservation for this book" 
      });
    }

    const [result] = await db.execute(
      "INSERT INTO reservations (user_id, book_id) VALUES (?, ?)",
      [user_id, book_id]
    );

    res.status(201).json({
      message: "Reservation created successfully",
      reservationId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update reservation status
export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ["PENDING", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Status must be one of: ${validStatuses.join(", ")}` 
      });
    }

    const [result] = await db.execute(
      "UPDATE reservations SET status = ? WHERE reservation_id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(200).json({ message: "Reservation updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel reservation
export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "UPDATE reservations SET status = 'CANCELLED' WHERE reservation_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(200).json({ message: "Reservation cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete reservation (when book is issued)
export const completeReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "UPDATE reservations SET status = 'COMPLETED' WHERE reservation_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(200).json({ message: "Reservation completed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservations by user
export const getReservationsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const [reservations] = await db.execute(
      `SELECT 
        r.reservation_id, r.reservation_date, r.status,
        b.book_id, b.title as book_title, b.isbn
      FROM reservations r
      JOIN books b ON r.book_id = b.book_id
      WHERE r.user_id = ?
      ORDER BY r.reservation_date DESC`,
      [user_id]
    );

    res.status(200).json({ reservations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservations by book
export const getReservationsByBook = async (req, res) => {
  try {
    const { book_id } = req.params;
    const [reservations] = await db.execute(
      `SELECT 
        r.reservation_id, r.reservation_date, r.status,
        u.user_id, u.name as user_name, u.email as user_email
      FROM reservations r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.book_id = ? AND r.status = 'PENDING'
      ORDER BY r.reservation_date ASC`,
      [book_id]
    );

    res.status(200).json({ reservations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

