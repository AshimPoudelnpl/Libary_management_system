import db from "../config/db.js";

export const getAllBooks = async (req, res) => {
  try {
    const [books] = await db.execute(`
      SELECT 
        b.book_id, b.isbn, b.title, b.publication_year, b.language, b.description,
        p.name as publisher_name,
        c.category_name,
        GROUP_CONCAT(a.name SEPARATOR ', ') as authors
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN book_authors ba ON b.book_id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.author_id
      GROUP BY b.book_id
    `);
    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addBook = async (req, res) => {
  try {
    const { isbn, title, publisher_id, publication_year, category_id } =
      req.body;
    const [result] = await db.execute(
      "INSERT INTO books (isbn, title, publisher_id, publication_year, category_id) VALUES (?, ?, ?, ?, ?)",
      [isbn, title, publisher_id, publication_year, category_id]
    );
    res
      .status(201)
      .json({ message: "Book added successfully", bookId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const [books] = await db.execute(`
      SELECT 
        b.book_id, b.isbn, b.title, b.publication_year, b.language, b.description,
        p.name as publisher_name, p.address as publisher_address,
        c.category_name,
        GROUP_CONCAT(a.name SEPARATOR ', ') as authors
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN book_authors ba ON b.book_id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.author_id
      WHERE b.book_id = ?
      GROUP BY b.book_id
    `, [id]);
    res.status(200).json({ book: books[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
