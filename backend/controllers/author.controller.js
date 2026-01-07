import db from "../config/db.js";

// Get all authors
export const getAllAuthors = async (req, res) => {
  try {
    const [authors] = await db.execute(
      "SELECT * FROM authors ORDER BY name"
    );
    res.status(200).json({ authors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get author by ID
export const getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;
    const [authors] = await db.execute(
      "SELECT * FROM authors WHERE author_id = ?",
      [id]
    );

    if (authors.length === 0) {
      return res.status(404).json({ error: "Author not found" });
    }

    res.status(200).json({ author: authors[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create author
export const createAuthor = async (req, res) => {
  try {
    const { name, bio } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Author name is required" });
    }

    const [result] = await db.execute(
      "INSERT INTO authors (name, bio) VALUES (?, ?)",
      [name.trim(), bio || null]
    );

    res.status(201).json({
      message: "Author created successfully",
      authorId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update author
export const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bio } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Author name is required" });
    }

    const [result] = await db.execute(
      "UPDATE authors SET name = ?, bio = ? WHERE author_id = ?",
      [name.trim(), bio || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Author not found" });
    }

    res.status(200).json({ message: "Author updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete author
export const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "DELETE FROM authors WHERE author_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Author not found" });
    }

    res.status(200).json({ message: "Author deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get books by author
export const getBooksByAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const [books] = await db.execute(
      `SELECT 
        b.book_id, b.isbn, b.title, b.publication_year, b.language,
        p.name as publisher_name,
        c.category_name
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      INNER JOIN book_authors ba ON b.book_id = ba.book_id
      WHERE ba.author_id = ?`,
      [id]
    );

    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

