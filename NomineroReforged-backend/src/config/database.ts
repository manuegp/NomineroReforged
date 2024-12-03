import dotenv from 'dotenv';
import { Database } from 'sqlite3';

dotenv.config();

const dbPath = process.env.DB_PATH || ':memory:';

export const db = new Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});