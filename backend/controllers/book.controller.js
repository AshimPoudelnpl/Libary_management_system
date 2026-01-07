import db from "../config/db.js";

// Get all books with filters
export const getAllBooks = async (req, res) => {
  try {
    const { category_id, publisher_id, author_id, search } = req.query;
    let query = `
      SELECT 
        b.book_id, b.isbn, b.title, b.publication_year, b.language, b.description,
        b.publisher_id, b.category_id,
        p.name as publisher_name,
        c.category_name,
        GROUP_CONCAT(a.name SEPARATOR ', ') as authors,
        COUNT(DISTINCT bc.copy_id) as total_copies,
        COUNT(DISTINCT CASE WHEN bc.status = 'AVAILABLE' THEN bc.copy_id END) as available_copies
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN book_authors ba ON b.book_id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.author_id
      LEFT JOIN book_copies bc ON b.book_id = bc.book_id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      query += " AND b.category_id = ?";
      params.push(category_id);
    }

    if (publisher_id) {
      query += " AND b.publisher_id = ?";
      params.push(publisher_id);
    }

    if (author_id) {
      query += " AND ba.author_id = ?";
      params.push(author_id);
    }

    if (search) {
      query += " AND (b.title LIKE ? OR b.isbn LIKE ? OR b.description LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " GROUP BY b.book_id ORDER BY b.title";

    const [books] = await db.execute(query, params);
    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get book by ID
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const [books] = await db.execute(`
      SELECT 
        b.book_id, b.isbn, b.title, b.publication_year, b.language, b.description,
        b.publisher_id, b.category_id,
        p.name as publisher_name, p.address as publisher_address,
        c.category_name,
        GROUP_CONCAT(a.name SEPARATOR ', ') as authors,
        GROUP_CONCAT(a.author_id SEPARATOR ',') as author_ids
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN book_authors ba ON b.book_id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.author_id
      WHERE b.book_id = ?
      GROUP BY b.book_id
    `, [id]);

    if (books.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    const book = books[0];
    // Get book copies
    const [copies] = await db.execute(
      "SELECT copy_id, barcode, status FROM book_copies WHERE book_id = ?",
      [id]
    );

    res.status(200).json({ 
      book: {
        ...book,
        copies
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create book
export const addBook = async (req, res) => {
  try {
    const { 
      isbn, 
      title, 
      publisher_id, 
      publication_year, 
      category_id,
      language,
      description,
      author_ids 
    } = req.body;

    if (!isbn || !title) {
      return res.status(400).json({ 
        error: "ISBN and title are required" 
      });
    }

    // Start transaction
    await db.beginTransaction();

    try {
      // Insert book
      const [result] = await db.execute(
        `INSERT INTO books (isbn, title, publisher_id, publication_year, category_id, language, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [isbn, title, publisher_id || null, publication_year || null, category_id || null, language || null, description || null]
      );

      const bookId = result.insertId;

      // Add authors if provided
      if (author_ids && Array.isArray(author_ids) && author_ids.length > 0) {
        for (const authorId of author_ids) {
          await db.execute(
            "INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)",
            [bookId, authorId]
          );
        }
      }

      await db.commit();

      res.status(201).json({
        message: "Book added successfully",
        bookId: bookId,
      });
    } catch (error) {
      await db.rollback();
      throw error;
    }
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "ISBN already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update book
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      isbn, 
      title, 
      publisher_id, 
      publication_year, 
      category_id,
      language,
      description,
      author_ids 
    } = req.body;

    // Check if book exists
    const [books] = await db.execute(
      "SELECT book_id FROM books WHERE book_id = ?",
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    await db.beginTransaction();

    try {
      // Update book details
      const updates = [];
      const params = [];

      if (isbn !== undefined) {
        updates.push("isbn = ?");
        params.push(isbn);
      }
      if (title !== undefined) {
        updates.push("title = ?");
        params.push(title);
      }
      if (publisher_id !== undefined) {
        updates.push("publisher_id = ?");
        params.push(publisher_id);
      }
      if (publication_year !== undefined) {
        updates.push("publication_year = ?");
        params.push(publication_year);
      }
      if (category_id !== undefined) {
        updates.push("category_id = ?");
        params.push(category_id);
      }
      if (language !== undefined) {
        updates.push("language = ?");
        params.push(language);
      }
      if (description !== undefined) {
        updates.push("description = ?");
        params.push(description);
      }

      if (updates.length > 0) {
        params.push(id);
        await db.execute(
          `UPDATE books SET ${updates.join(", ")} WHERE book_id = ?`,
          params
        );
      }

      // Update authors if provided
      if (author_ids !== undefined) {
        // Delete existing author associations
        await db.execute(
          "DELETE FROM book_authors WHERE book_id = ?",
          [id]
        );

        // Add new author associations
        if (Array.isArray(author_ids) && author_ids.length > 0) {
          for (const authorId of author_ids) {
            await db.execute(
              "INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)",
              [id, authorId]
            );
          }
        }
      }

      await db.commit();

      res.status(200).json({ message: "Book updated successfully" });
    } catch (error) {
      await db.rollback();
      throw error;
    }
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "ISBN already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete book
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book has issued copies
    const [issuedCopies] = await db.execute(
      `SELECT COUNT(*) as count FROM issued_books ib
       JOIN book_copies bc ON ib.copy_id = bc.copy_id
       WHERE bc.book_id = ? AND ib.return_date IS NULL`,
      [id]
    );

    if (issuedCopies[0].count > 0) {
      return res.status(400).json({
        error: "Cannot delete book. Some copies are currently issued.",
      });
    }

    const [result] = await db.execute(
      "DELETE FROM books WHERE book_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
