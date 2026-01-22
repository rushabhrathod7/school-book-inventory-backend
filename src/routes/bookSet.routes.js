const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * Master Data API
 * GET /master-data
 */
router.get("/master-data", async (req, res) => {
  try {
    const [
      boards,
      mediums,
      classes,
      years,
      books,
    ] = await Promise.all([
      pool.query("SELECT id, name FROM boards ORDER BY name"),
      pool.query("SELECT id, name FROM mediums ORDER BY name"),
      pool.query("SELECT id, name FROM classes ORDER BY id"),
      pool.query(
        "SELECT id, year_label FROM academic_years ORDER BY year_label"
      ),
      pool.query(
        "SELECT id, book_name FROM books ORDER BY book_name"
      ),
    ]);

    res.json({
      boards: boards.rows,
      mediums: mediums.rows,
      classes: classes.rows,
      years: years.rows,
      books: books.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch master data" });
  }
});

/**
 * Create Book Set
 * POST /book-set/create
 */
router.post("/create", async (req, res) => {
  const {
    board_id,
    medium_id,
    class_id,
    academic_year_id,
    set_name,
    books,
  } = req.body;

  // Basic validation
  if (
    !board_id ||
    !medium_id ||
    !class_id ||
    !academic_year_id ||
    !set_name ||
    !Array.isArray(books) ||
    books.length === 0
  ) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Insert into book_sets
    const bookSetResult = await client.query(
      `INSERT INTO book_sets
       (board_id, medium_id, class_id, academic_year_id, set_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [board_id, medium_id, class_id, academic_year_id, set_name]
    );

    const bookSetId = bookSetResult.rows[0].id;

    // 2. Insert book_set_items
    for (const item of books) {
      await client.query(
        `INSERT INTO book_set_items
         (book_set_id, book_id, quantity)
         VALUES ($1, $2, $3)`,
        [bookSetId, item.book_id, item.quantity]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Book set created successfully",
      book_set_id: bookSetId,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
});

/**
 * Get Book Sets with filters
 * GET /book-set
 */
router.get("/", async (req, res) => {
    const { board_id, medium_id, class_id, academic_year_id } = req.query;
  
    let conditions = [];
    let values = [];
    let index = 1;
  
    if (board_id) {
      conditions.push(`bs.board_id = $${index++}`);
      values.push(board_id);
    }
  
    if (medium_id) {
      conditions.push(`bs.medium_id = $${index++}`);
      values.push(medium_id);
    }
  
    if (class_id) {
      conditions.push(`bs.class_id = $${index++}`);
      values.push(class_id);
    }
  
    if (academic_year_id) {
      conditions.push(`bs.academic_year_id = $${index++}`);
      values.push(academic_year_id);
    }
  
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  
    try {
      const query = `
        SELECT
          bs.id AS book_set_id,
          bs.set_name,
          b.name AS board,
          m.name AS medium,
          c.name AS class,
          ay.year_label AS academic_year,
          json_agg(
            json_build_object(
              'book_id', bk.id,
              'book_name', bk.book_name,
              'subject', bk.subject,
              'publisher', bk.publisher,
              'quantity', bsi.quantity
            )
          ) AS books
        FROM book_sets bs
        JOIN boards b ON b.id = bs.board_id
        JOIN mediums m ON m.id = bs.medium_id
        JOIN classes c ON c.id = bs.class_id
        JOIN academic_years ay ON ay.id = bs.academic_year_id
        JOIN book_set_items bsi ON bsi.book_set_id = bs.id
        JOIN books bk ON bk.id = bsi.book_id
        ${whereClause}
        GROUP BY
          bs.id, b.name, m.name, c.name, ay.year_label
        ORDER BY bs.id DESC;
      `;
  
      const result = await pool.query(query, values);
  
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
/**
 * Update Book Set
 * PUT /book-set/:id
 */
router.put("/:id", async (req, res) => {
    const bookSetId = req.params.id;
    const {
      board_id,
      medium_id,
      class_id,
      academic_year_id,
      set_name,
      books,
    } = req.body;
  
    if (
      !board_id ||
      !medium_id ||
      !class_id ||
      !academic_year_id ||
      !set_name ||
      !Array.isArray(books) ||
      books.length === 0
    ) {
      return res.status(400).json({ message: "Invalid request body" });
    }
  
    const client = await pool.connect();
  
    try {
      await client.query("BEGIN");
  
      // 1. Update book_sets metadata
      const updateResult = await client.query(
        `
        UPDATE book_sets
        SET board_id = $1,
            medium_id = $2,
            class_id = $3,
            academic_year_id = $4,
            set_name = $5
        WHERE id = $6
        RETURNING id
        `,
        [
          board_id,
          medium_id,
          class_id,
          academic_year_id,
          set_name,
          bookSetId,
        ]
      );
  
      if (updateResult.rowCount === 0) {
        throw new Error("Book set not found");
      }
  
      // 2. Remove existing books
      await client.query(
        `DELETE FROM book_set_items WHERE book_set_id = $1`,
        [bookSetId]
      );
  
      // 3. Insert updated books
      for (const item of books) {
        await client.query(
          `
          INSERT INTO book_set_items (book_set_id, book_id, quantity)
          VALUES ($1, $2, $3)
          `,
          [bookSetId, item.book_id, item.quantity]
        );
      }
  
      await client.query("COMMIT");
  
      res.json({ message: "Book set updated successfully" });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(error);
  
      if (error.message === "Book set not found") {
        return res.status(404).json({ message: error.message });
      }
  
      res.status(500).json({ message: "Internal server error" });
    } finally {
      client.release();
    }
  });
  
  router.delete("/:id", async (req, res) => {
    const bookSetId = req.params.id;
  
    try {
      const result = await pool.query(
        "DELETE FROM book_sets WHERE id = $1",
        [bookSetId]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Book set not found" });
      }
  
      res.json({ message: "Book set deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

module.exports = router;
