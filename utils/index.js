import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// Initialize SQLite database
const sqlite = new Database('sqlite.db');

// Create drizzle database instance
export const db = drizzle(sqlite);

// Log successful connection
console.log("SQLite database connection established successfully");