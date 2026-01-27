import pkg from "pg";

// Environemt variables
import dotenv from "dotenv";
import { initTables } from "../util/database";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, 
});

initTables() ? console.log("Tables initilized successfully!") : console.log("Error initilizing tables");

export default pool;