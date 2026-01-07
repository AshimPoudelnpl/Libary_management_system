import db from "../config/db.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    const [users] = await db.execute(
      "SELECT user_id, name, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "please fill all credentials" });
    }

    const user = users[0];
    console.log(user);
    if (!user.password) {
      return res.status(401).json({ error: "Invalid credentials1" });
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    console.log(isValidPassword)

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials2" });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role = "MEMBER", address } = req.body;

    const hashedPassword = await bcryptjs.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, phone, role, address) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone, role, address]
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getDashboardStats = async (req, res) => {
  try {
    const [totalBooks] = await db.execute(
      "SELECT COUNT(*) as count FROM books"
    );
    const [totalUsers] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE role != "ADMIN"'
    );
    const [totalIssued] = await db.execute(
      "SELECT COUNT(*) as count FROM issued_books WHERE return_date IS NULL"
    );
    const [totalOverdue] = await db.execute(
      "SELECT COUNT(*) as count FROM issued_books WHERE due_date < CURDATE() AND return_date IS NULL"
    );
    const [totalFines] = await db.execute(
      "SELECT SUM(amount) as total FROM fines WHERE paid = FALSE"
    );

    res.status(200).json({
      totalBooks: totalBooks[0].count,
      totalUsers: totalUsers[0].count,
      totalIssued: totalIssued[0].count,
      totalOverdue: totalOverdue[0].count,
      totalUnpaidFines: totalFines[0].total || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
