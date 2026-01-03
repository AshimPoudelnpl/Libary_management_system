import db from "../config/db.js";

export const issueBook = async (req, res) => {
  try {
    const { user_id, copy_id, due_date } = req.body;
    const issue_date = new Date().toISOString().split('T')[0];
    
    const [result] = await db.execute(
      "INSERT INTO issued_books (user_id, copy_id, issue_date, due_date) VALUES (?, ?, ?, ?)",
      [user_id, copy_id, issue_date, due_date]
    );
    
    await db.execute("UPDATE book_copies SET status = 'ISSUED' WHERE copy_id = ?", [copy_id]);
    
    res.status(201).json({ message: "Book issued successfully", issueId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const return_date = new Date().toISOString().split('T')[0];
    
    const [issue] = await db.execute("SELECT copy_id FROM issued_books WHERE issue_id = ?", [id]);
    
    await db.execute("UPDATE issued_books SET return_date = ? WHERE issue_id = ?", [return_date, id]);
    await db.execute("UPDATE book_copies SET status = 'AVAILABLE' WHERE copy_id = ?", [issue[0].copy_id]);
    
    res.status(200).json({ message: "Book returned successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllIssuedBooks = async (req, res) => {
  try {
    const [issues] = await db.execute(`
      SELECT 
        ib.issue_id, ib.issue_date, ib.due_date, ib.return_date,
        u.name as user_name, u.email as user_email,
        b.title as book_title, b.isbn,
        bc.barcode, bc.status as copy_status
      FROM issued_books ib
      JOIN users u ON ib.user_id = u.user_id
      JOIN book_copies bc ON ib.copy_id = bc.copy_id
      JOIN books b ON bc.book_id = b.book_id
      ORDER BY ib.issue_date DESC
    `);
    res.status(200).json({ issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};