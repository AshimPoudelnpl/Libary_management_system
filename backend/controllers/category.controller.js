import db from "../config/db.js";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.execute(
      "SELECT * FROM categories ORDER BY category_name"
    );
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [categories] = await db.execute(
      "SELECT * FROM categories WHERE category_id = ?",
      [id]
    );

    if (categories.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ category: categories[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;

    if (!category_name || category_name.trim() === "") {
      return res.status(400).json({ error: "Category name is required" });
    }

    const [result] = await db.execute(
      "INSERT INTO categories (category_name) VALUES (?)",
      [category_name.trim()]
    );

    res.status(201).json({
      message: "Category created successfully",
      categoryId: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Category already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name } = req.body;

    if (!category_name || category_name.trim() === "") {
      return res.status(400).json({ error: "Category name is required" });
    }

    const [result] = await db.execute(
      "UPDATE categories SET category_name = ? WHERE category_id = ?",
      [category_name.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Category name already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is used by any books
    const [books] = await db.execute(
      "SELECT COUNT(*) as count FROM books WHERE category_id = ?",
      [id]
    );

    if (books[0].count > 0) {
      return res.status(400).json({
        error: "Cannot delete category. It is associated with books.",
      });
    }

    const [result] = await db.execute(
      "DELETE FROM categories WHERE category_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get books by category
export const getBooksByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [books] = await db.execute(
      `SELECT 
        b.book_id, b.isbn, b.title, b.publication_year, b.language,
        p.name as publisher_name,
        GROUP_CONCAT(a.name SEPARATOR ', ') as authors
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN book_authors ba ON b.book_id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.author_id
      WHERE b.category_id = ?
      GROUP BY b.book_id`,
      [id]
    );

    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

