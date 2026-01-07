import db from "../config/db.js";
import bcryptjs from "bcryptjs";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = `
      SELECT 
        u.user_id, u.name, u.email, u.phone, u.role, u.address, u.created_at,
        COUNT(DISTINCT CASE WHEN ib.return_date IS NULL THEN ib.issue_id END) as active_issues,
        COUNT(DISTINCT ib.issue_id) as total_issues
      FROM users u
      LEFT JOIN issued_books ib ON u.user_id = ib.user_id
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      query += " AND u.role = ?";
      params.push(role);
    }

    if (search) {
      query += " AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " GROUP BY u.user_id ORDER BY u.created_at DESC";

    const [users] = await db.execute(query, params);
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.execute(`
      SELECT 
        u.user_id, u.name, u.email, u.phone, u.role, u.address, u.created_at,
        COUNT(DISTINCT CASE WHEN ib.return_date IS NULL THEN ib.issue_id END) as active_issues,
        COUNT(DISTINCT ib.issue_id) as total_issues,
        COUNT(DISTINCT r.reservation_id) as total_reservations
      FROM users u
      LEFT JOIN issued_books ib ON u.user_id = ib.user_id
      LEFT JOIN reservations r ON u.user_id = r.user_id
      WHERE u.user_id = ?
      GROUP BY u.user_id
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get unpaid fines
    const [fines] = await db.execute(
      `SELECT SUM(f.amount) as total_unpaid FROM fines f
       JOIN issued_books ib ON f.issue_id = ib.issue_id
       WHERE ib.user_id = ? AND f.paid = FALSE`,
      [id]
    );

    res.status(200).json({ 
      user: {
        ...users[0],
        total_unpaid_fines: parseFloat(fines[0].total_unpaid || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create user
export const addUser = async (req, res) => {
  try {
    const { name, email, phone, role = "MEMBER", address, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ 
        error: "Name and email are required" 
      });
    }

    const validRoles = ["ADMIN", "LIBRARIAN", "MEMBER"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Must be one of: ${validRoles.join(", ")}` 
      });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcryptjs.hash(password, 10);
    }

    const [result] = await db.execute(
      "INSERT INTO users (name, email, phone, role, address, password) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, phone || null, role, address || null, hashedPassword]
    );

    res.status(201).json({ 
      message: "User added successfully", 
      userId: result.insertId 
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, address, password } = req.body;

    // Check if user exists
    const [users] = await db.execute(
      "SELECT user_id FROM users WHERE user_id = ?",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      params.push(email);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      params.push(phone);
    }
    if (role !== undefined) {
      const validRoles = ["ADMIN", "LIBRARIAN", "MEMBER"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          error: `Invalid role. Must be one of: ${validRoles.join(", ")}` 
        });
      }
      updates.push("role = ?");
      params.push(role);
    }
    if (address !== undefined) {
      updates.push("address = ?");
      params.push(address);
    }
    if (password !== undefined) {
      const hashedPassword = await bcryptjs.hash(password, 10);
      updates.push("password = ?");
      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    params.push(id);

    const [result] = await db.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`,
      params
    );

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has active issues
    const [activeIssues] = await db.execute(
      "SELECT COUNT(*) as count FROM issued_books WHERE user_id = ? AND return_date IS NULL",
      [id]
    );

    if (activeIssues[0].count > 0) {
      return res.status(400).json({
        error: "Cannot delete user. User has active book issues.",
      });
    }

    // Check if user has unpaid fines
    const [unpaidFines] = await db.execute(
      `SELECT COUNT(*) as count FROM fines f
       JOIN issued_books ib ON f.issue_id = ib.issue_id
       WHERE ib.user_id = ? AND f.paid = FALSE`,
      [id]
    );

    if (unpaidFines[0].count > 0) {
      return res.status(400).json({
        error: "Cannot delete user. User has unpaid fines.",
      });
    }

    const [result] = await db.execute(
      "DELETE FROM users WHERE user_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};