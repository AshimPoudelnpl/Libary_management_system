import db from "../config/db.js";

// Issue book
export const issueBook = async (req, res) => {
  try {
    const { user_id, copy_id, due_date } = req.body;

    if (!user_id || !copy_id || !due_date) {
      return res.status(400).json({ 
        error: "User ID, Copy ID, and Due Date are required" 
      });
    }

    await db.beginTransaction();

    try {
      // Check if copy exists and is available
      const [copies] = await db.execute(
        "SELECT copy_id, status FROM book_copies WHERE copy_id = ?",
        [copy_id]
      );

      if (copies.length === 0) {
        await db.rollback();
        return res.status(404).json({ error: "Book copy not found" });
      }

      if (copies[0].status !== "AVAILABLE") {
        await db.rollback();
        return res.status(400).json({ 
          error: `Book copy is not available. Current status: ${copies[0].status}` 
        });
      }

      // Check if user exists
      const [users] = await db.execute(
        "SELECT user_id FROM users WHERE user_id = ?",
        [user_id]
      );

      if (users.length === 0) {
        await db.rollback();
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has unpaid fines
      const [unpaidFines] = await db.execute(
        `SELECT SUM(f.amount) as total FROM fines f
         JOIN issued_books ib ON f.issue_id = ib.issue_id
         WHERE ib.user_id = ? AND f.paid = FALSE`,
        [user_id]
      );

      if (unpaidFines[0].total > 0) {
        await db.rollback();
        return res.status(400).json({ 
          error: `User has unpaid fines of ${unpaidFines[0].total}. Please pay fines before issuing books.` 
        });
      }

      const issue_date = new Date().toISOString().split('T')[0];
      
      // Insert issue record
      const [result] = await db.execute(
        "INSERT INTO issued_books (user_id, copy_id, issue_date, due_date) VALUES (?, ?, ?, ?)",
        [user_id, copy_id, issue_date, due_date]
      );
      
      // Update copy status
      await db.execute(
        "UPDATE book_copies SET status = 'ISSUED' WHERE copy_id = ?", 
        [copy_id]
      );

      // Complete any pending reservations for this book
      const [bookInfo] = await db.execute(
        "SELECT book_id FROM book_copies WHERE copy_id = ?",
        [copy_id]
      );

      if (bookInfo.length > 0) {
        await db.execute(
          `UPDATE reservations SET status = 'COMPLETED' 
           WHERE book_id = ? AND user_id = ? AND status = 'PENDING'`,
          [bookInfo[0].book_id, user_id]
        );
      }

      await db.commit();
      
      res.status(201).json({ 
        message: "Book issued successfully", 
        issueId: result.insertId 
      });
    } catch (error) {
      await db.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Return book
export const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const return_date = new Date().toISOString().split('T')[0];
    
    await db.beginTransaction();

    try {
      // Get issue details
      const [issues] = await db.execute(
        "SELECT copy_id, due_date, return_date FROM issued_books WHERE issue_id = ?",
        [id]
      );

      if (issues.length === 0) {
        await db.rollback();
        return res.status(404).json({ error: "Issue not found" });
      }

      const issue = issues[0];

      if (issue.return_date) {
        await db.rollback();
        return res.status(400).json({ error: "Book has already been returned" });
      }

      // Update return date
      await db.execute(
        "UPDATE issued_books SET return_date = ? WHERE issue_id = ?", 
        [return_date, id]
      );

      // Update copy status
      await db.execute(
        "UPDATE book_copies SET status = 'AVAILABLE' WHERE copy_id = ?", 
        [issue.copy_id]
      );

      // Calculate and create fine if overdue
      const dueDate = new Date(issue.due_date);
      const returnDate = new Date(return_date);
      const daysOverdue = Math.max(0, Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24)));

      if (daysOverdue > 0) {
        const fineAmount = daysOverdue * 10; // 10 per day
        await db.execute(
          "INSERT INTO fines (issue_id, amount) VALUES (?, ?)",
          [id, fineAmount]
        );
      }

      await db.commit();
      
      res.status(200).json({ 
        message: "Book returned successfully",
        daysOverdue,
        fineCreated: daysOverdue > 0
      });
    } catch (error) {
      await db.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all issued books
export const getAllIssuedBooks = async (req, res) => {
  try {
    const { user_id, overdue, returned } = req.query;
    let query = `
      SELECT 
        ib.issue_id, ib.issue_date, ib.due_date, ib.return_date,
        u.user_id, u.name as user_name, u.email as user_email,
        b.book_id, b.title as book_title, b.isbn,
        bc.copy_id, bc.barcode, bc.status as copy_status,
        CASE 
          WHEN ib.return_date IS NULL AND ib.due_date < CURDATE() THEN TRUE
          ELSE FALSE
        END as is_overdue
      FROM issued_books ib
      JOIN users u ON ib.user_id = u.user_id
      JOIN book_copies bc ON ib.copy_id = bc.copy_id
      JOIN books b ON bc.book_id = b.book_id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += " AND ib.user_id = ?";
      params.push(user_id);
    }

    if (overdue === "true") {
      query += " AND ib.return_date IS NULL AND ib.due_date < CURDATE()";
    }

    if (returned === "true") {
      query += " AND ib.return_date IS NOT NULL";
    } else if (returned === "false") {
      query += " AND ib.return_date IS NULL";
    }

    query += " ORDER BY ib.issue_date DESC";

    const [issues] = await db.execute(query, params);
    res.status(200).json({ issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get issue by ID
export const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const [issues] = await db.execute(`
      SELECT 
        ib.issue_id, ib.issue_date, ib.due_date, ib.return_date,
        u.user_id, u.name as user_name, u.email as user_email, u.phone,
        b.book_id, b.title as book_title, b.isbn,
        bc.copy_id, bc.barcode, bc.status as copy_status,
        CASE 
          WHEN ib.return_date IS NULL AND ib.due_date < CURDATE() THEN TRUE
          ELSE FALSE
        END as is_overdue
      FROM issued_books ib
      JOIN users u ON ib.user_id = u.user_id
      JOIN book_copies bc ON ib.copy_id = bc.copy_id
      JOIN books b ON bc.book_id = b.book_id
      WHERE ib.issue_id = ?
    `, [id]);

    if (issues.length === 0) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Get fine if exists
    const [fines] = await db.execute(
      "SELECT * FROM fines WHERE issue_id = ?",
      [id]
    );

    res.status(200).json({ 
      issue: issues[0],
      fine: fines[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get issues by user
export const getIssuesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const [issues] = await db.execute(`
      SELECT 
        ib.issue_id, ib.issue_date, ib.due_date, ib.return_date,
        b.book_id, b.title as book_title, b.isbn,
        bc.barcode,
        CASE 
          WHEN ib.return_date IS NULL AND ib.due_date < CURDATE() THEN TRUE
          ELSE FALSE
        END as is_overdue
      FROM issued_books ib
      JOIN book_copies bc ON ib.copy_id = bc.copy_id
      JOIN books b ON bc.book_id = b.book_id
      WHERE ib.user_id = ?
      ORDER BY ib.issue_date DESC
    `, [user_id]);

    res.status(200).json({ issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};