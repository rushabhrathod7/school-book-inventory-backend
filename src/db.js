const { Pool } = require("pg");

// Support both DATABASE_URL (for Render/Heroku) and individual env vars (for local dev)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes("render.com") 
          ? { rejectUnauthorized: false } 
          : false,
      }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
      }
);

pool.on("connect", () => {
  console.log("PostgreSQL connected successfully");
});

module.exports = pool;
