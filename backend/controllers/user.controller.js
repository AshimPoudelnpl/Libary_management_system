import db from "../config/db.js";

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT 
        u.user_id, u.name, u.email, u.phone, u.role, u.address, u.created_at,
        COUNT(ib.issue_id) as total_books_issued
      FROM users u
      LEFT JOIN issued_books ib ON u.user_id = ib.user_id AND ib.return_date IS NULL
      GROUP BY u.user_id
    `);
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, email, phone, role, address } = req.body;
    const [result] = await db.execute(
      "INSERT INTO users (name, email, phone, role, address) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, role, address]
    );
    res.status(201).json({ message: "User added successfully", userId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.execute(`
      SELECT 
        u.user_id, u.name, u.email, u.phone, u.role, u.address, u.created_at,
        COUNT(ib.issue_id) as total_books_issued,
        COUNT(f.fine_id) as total_fines
      FROM users u
      LEFT JOIN issued_books ib ON u.user_id = ib.user_id
      LEFT JOIN fines f ON ib.issue_id = f.issue_id
      WHERE u.user_id = ?
      GROUP BY u.user_id
    `, [id]);
    res.status(200).json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};