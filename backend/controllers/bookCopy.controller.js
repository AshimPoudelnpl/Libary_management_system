import db from "../config/db.js";

// Get all book copies
export const getAllBookCopies = async (req, res) => {
  try {
    const { book_id, status } = req.query;
    let query = `
      SELECT 
        bc.copy_id, bc.barcode, bc.status,
        b.book_id, b.isbn, b.title
      FROM book_copies bc
      JOIN books b ON bc.book_id = b.book_id
      WHERE 1=1
    `;
    const params = [];

    if (book_id) {
      query += " AND bc.book_id = ?";
      params.push(book_id);
    }

    if (status) {
      query += " AND bc.status = ?";
      params.push(status);
    }

    query += " ORDER BY bc.copy_id DESC";

    const [copies] = await db.execute(query, params);
    res.status(200).json({ copies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get book copy by ID
export const getBookCopyById = async (req, res) => {
  try {
    const { id } = req.params;
    const [copies] = await db.execute(
      `SELECT 
        bc.copy_id, bc.barcode, bc.status,
        b.book_id, b.isbn, b.title, b.publication_year,
        p.name as publisher_name,
        c.category_name
      FROM book_copies bc
      JOIN books b ON bc.book_id = b.book_id
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      WHERE bc.copy_id = ?`,
      [id]
    );

    if (copies.length === 0) {
      return res.status(404).json({ error: "Book copy not found" });
    }

    res.status(200).json({ copy: copies[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create book copy
export const createBookCopy = async (req, res) => {
  try {
    const { book_id, barcode, status = "AVAILABLE" } = req.body;

    if (!book_id || !barcode) {
      return res.status(400).json({ 
        error: "Book ID and barcode are required" 
      });
    }

    // Validate status
    const validStatuses = ["AVAILABLE", "ISSUED", "LOST", "DAMAGED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Status must be one of: ${validStatuses.join(", ")}` 
      });
    }

    // Check if book exists
    const [books] = await db.execute(
      "SELECT book_id FROM books WHERE book_id = ?",
      [book_id]
    );

    if (books.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    const [result] = await db.execute(
      "INSERT INTO book_copies (book_id, barcode, status) VALUES (?, ?, ?)",
      [book_id, barcode, status]
    );

    res.status(201).json({
      message: "Book copy created successfully",
      copyId: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Barcode already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update book copy
export const updateBookCopy = async (req, res) => {
  try {
    const { id } = req.params;
    const { barcode, status } = req.body;

    if (!barcode && !status) {
      return res.status(400).json({ 
        error: "At least one field (barcode or status) is required" 
      });
    }

    const updates = [];
    const params = [];

    if (barcode) {
      updates.push("barcode = ?");
      params.push(barcode);
    }

    if (status) {
      const validStatuses = ["AVAILABLE", "ISSUED", "LOST", "DAMAGED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: `Status must be one of: ${validStatuses.join(", ")}` 
        });
      }
      updates.push("status = ?");
      params.push(status);
    }

    params.push(id);

    const [result] = await db.execute(
      `UPDATE book_copies SET ${updates.join(", ")} WHERE copy_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Book copy not found" });
    }

    res.status(200).json({ message: "Book copy updated successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Barcode already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete book copy
export const deleteBookCopy = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if copy is currently issued
    const [issues] = await db.execute(
      "SELECT COUNT(*) as count FROM issued_books WHERE copy_id = ? AND return_date IS NULL",
      [id]
    );

    if (issues[0].count > 0) {
      return res.status(400).json({
        error: "Cannot delete book copy. It is currently issued.",
      });
    }

    const [result] = await db.execute(
      "DELETE FROM book_copies WHERE copy_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Book copy not found" });
    }

    res.status(200).json({ message: "Book copy deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available copies for a book
export const getAvailableCopies = async (req, res) => {
  try {
    const { book_id } = req.params;
    const [copies] = await db.execute(
      `SELECT 
        bc.copy_id, bc.barcode, bc.status
      FROM book_copies bc
      WHERE bc.book_id = ? AND bc.status = 'AVAILABLE'`,
      [book_id]
    );

    res.status(200).json({ 
      availableCopies: copies.length,
      copies 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

