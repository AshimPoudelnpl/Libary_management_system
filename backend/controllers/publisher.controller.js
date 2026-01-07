import db from "../config/db.js";

// Get all publishers
export const getAllPublishers = async (req, res) => {
  try {
    const [publishers] = await db.execute(
      "SELECT * FROM publishers ORDER BY name"
    );
    res.status(200).json({ publishers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get publisher by ID
export const getPublisherById = async (req, res) => {
  try {
    const { id } = req.params;
    const [publishers] = await db.execute(
      "SELECT * FROM publishers WHERE publisher_id = ?",
      [id]
    );

    if (publishers.length === 0) {
      return res.status(404).json({ error: "Publisher not found" });
    }

    res.status(200).json({ publisher: publishers[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create publisher
export const createPublisher = async (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Publisher name is required" });
    }

    const [result] = await db.execute(
      "INSERT INTO publishers (name, address) VALUES (?, ?)",
      [name.trim(), address || null]
    );

    res.status(201).json({
      message: "Publisher created successfully",
      publisherId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update publisher
export const updatePublisher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Publisher name is required" });
    }

    const [result] = await db.execute(
      "UPDATE publishers SET name = ?, address = ? WHERE publisher_id = ?",
      [name.trim(), address || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Publisher not found" });
    }

    res.status(200).json({ message: "Publisher updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete publisher
export const deletePublisher = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if publisher is used by any books
    const [books] = await db.execute(
      "SELECT COUNT(*) as count FROM books WHERE publisher_id = ?",
      [id]
    );

    if (books[0].count > 0) {
      return res.status(400).json({
        error: "Cannot delete publisher. It is associated with books.",
      });
    }

    const [result] = await db.execute(
      "DELETE FROM publishers WHERE publisher_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Publisher not found" });
    }

    res.status(200).json({ message: "Publisher deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get books by publisher
export const getBooksByPublisher = async (req, res) => {
  try {
    const { id } = req.params;
    const [books] = await db.execute(
      `SELECT 
        b.book_id, b.isbn, b.title, b.publication_year, b.language,
        c.category_name,
        GROUP_CONCAT(a.name SEPARATOR ', ') as authors
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN book_authors ba ON b.book_id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.author_id
      WHERE b.publisher_id = ?
      GROUP BY b.book_id`,
      [id]
    );

    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

