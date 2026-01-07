import db from "../config/db.js";

// Get all fines
export const getAllFines = async (req, res) => {
  try {
    const { paid, user_id } = req.query;
    let query = `
      SELECT 
        f.fine_id, f.amount, f.paid, f.paid_date,
        ib.issue_id, ib.issue_date, ib.due_date, ib.return_date,
        u.user_id, u.name as user_name, u.email as user_email,
        b.title as book_title, b.isbn
      FROM fines f
      JOIN issued_books ib ON f.issue_id = ib.issue_id
      JOIN users u ON ib.user_id = u.user_id
      JOIN book_copies bc ON ib.copy_id = bc.copy_id
      JOIN books b ON bc.book_id = b.book_id
      WHERE 1=1
    `;
    const params = [];

    if (paid !== undefined) {
      query += " AND f.paid = ?";
      params.push(paid === "true" ? 1 : 0);
    }

    if (user_id) {
      query += " AND u.user_id = ?";
      params.push(user_id);
    }

    query += " ORDER BY f.fine_id DESC";

    const [fines] = await db.execute(query, params);
    res.status(200).json({ fines });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get fine by ID
export const getFineById = async (req, res) => {
  try {
    const { id } = req.params;
    const [fines] = await db.execute(
      `SELECT 
        f.fine_id, f.amount, f.paid, f.paid_date,
        ib.issue_id, ib.issue_date, ib.due_date, ib.return_date,
        u.user_id, u.name as user_name, u.email as user_email,
        b.title as book_title, b.isbn, bc.barcode
      FROM fines f
      JOIN issued_books ib ON f.issue_id = ib.issue_id
      JOIN users u ON ib.user_id = u.user_id
      JOIN book_copies bc ON ib.copy_id = bc.copy_id
      JOIN books b ON bc.book_id = b.book_id
      WHERE f.fine_id = ?`,
      [id]
    );

    if (fines.length === 0) {
      return res.status(404).json({ error: "Fine not found" });
    }

    res.status(200).json({ fine: fines[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create fine
export const createFine = async (req, res) => {
  try {
    const { issue_id, amount } = req.body;

    if (!issue_id || !amount) {
      return res.status(400).json({ 
        error: "Issue ID and amount are required" 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        error: "Fine amount must be greater than 0" 
      });
    }

    // Check if issue exists
    const [issues] = await db.execute(
      "SELECT issue_id FROM issued_books WHERE issue_id = ?",
      [issue_id]
    );

    if (issues.length === 0) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Check if fine already exists for this issue
    const [existingFines] = await db.execute(
      "SELECT fine_id FROM fines WHERE issue_id = ?",
      [issue_id]
    );

    if (existingFines.length > 0) {
      return res.status(409).json({ 
        error: "Fine already exists for this issue" 
      });
    }

    const [result] = await db.execute(
      "INSERT INTO fines (issue_id, amount) VALUES (?, ?)",
      [issue_id, amount]
    );

    res.status(201).json({
      message: "Fine created successfully",
      fineId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update fine (mark as paid)
export const updateFine = async (req, res) => {
  try {
    const { id } = req.params;
    const { paid, amount } = req.body;

    const updates = [];
    const params = [];

    if (paid !== undefined) {
      updates.push("paid = ?");
      params.push(paid ? 1 : 0);
      
      if (paid) {
        updates.push("paid_date = CURDATE()");
      } else {
        updates.push("paid_date = NULL");
      }
    }

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ 
          error: "Fine amount must be greater than 0" 
        });
      }
      updates.push("amount = ?");
      params.push(amount);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        error: "At least one field (paid or amount) is required" 
      });
    }

    params.push(id);

    const [result] = await db.execute(
      `UPDATE fines SET ${updates.join(", ")} WHERE fine_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Fine not found" });
    }

    res.status(200).json({ message: "Fine updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pay fine
export const payFine = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "UPDATE fines SET paid = TRUE, paid_date = CURDATE() WHERE fine_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Fine not found" });
    }

    res.status(200).json({ message: "Fine paid successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get fines by user
export const getFinesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const [fines] = await db.execute(
      `SELECT 
        f.fine_id, f.amount, f.paid, f.paid_date,
        ib.issue_id, ib.issue_date, ib.due_date,
        b.title as book_title, b.isbn
      FROM fines f
      JOIN issued_books ib ON f.issue_id = ib.issue_id
      JOIN book_copies bc ON ib.copy_id = bc.copy_id
      JOIN books b ON bc.book_id = b.book_id
      WHERE ib.user_id = ?
      ORDER BY f.paid ASC, f.fine_id DESC`,
      [user_id]
    );

    const totalUnpaid = fines
      .filter(f => !f.paid)
      .reduce((sum, f) => sum + parseFloat(f.amount), 0);

    res.status(200).json({ 
      fines,
      totalUnpaid: totalUnpaid.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate and create fine for overdue book
export const calculateFineForIssue = async (req, res) => {
  try {
    const { issue_id } = req.params;

    // Get issue details
    const [issues] = await db.execute(
      "SELECT issue_id, due_date, return_date FROM issued_books WHERE issue_id = ?",
      [issue_id]
    );

    if (issues.length === 0) {
      return res.status(404).json({ error: "Issue not found" });
    }

    const issue = issues[0];

    // Check if already returned
    if (issue.return_date) {
      return res.status(400).json({ 
        error: "Book has already been returned" 
      });
    }

    // Check if fine already exists
    const [existingFines] = await db.execute(
      "SELECT fine_id FROM fines WHERE issue_id = ?",
      [issue_id]
    );

    if (existingFines.length > 0) {
      return res.status(409).json({ 
        error: "Fine already exists for this issue" 
      });
    }

    // Calculate fine (assuming 10 per day overdue)
    const dueDate = new Date(issue.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
    const fineAmount = daysOverdue * 10; // 10 per day

    if (fineAmount > 0) {
      const [result] = await db.execute(
        "INSERT INTO fines (issue_id, amount) VALUES (?, ?)",
        [issue_id, fineAmount]
      );

      res.status(201).json({
        message: "Fine calculated and created successfully",
        fineId: result.insertId,
        daysOverdue,
        amount: fineAmount,
      });
    } else {
      res.status(200).json({
        message: "No fine required. Book is not overdue.",
        daysOverdue: 0,
        amount: 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

