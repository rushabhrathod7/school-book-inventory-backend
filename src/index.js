require("dotenv").config();
const express = require("express");
const pool = require("./db");
const cors = require("cors");


const bookSetRoutes = require("./routes/bookSet.routes");

const app = express();
app.use(express.json());

app.use(cors({
  origin: "school-book-inventory-frontend-g1fh.vercel.app"
}));

app.use("/book-set", bookSetRoutes);

app.get("/", (req, res) => {
  res.send("School Book Inventory API running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    await pool.query("SELECT 1");
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error("Database connection failed", error);
  }
});
