import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../utils/schema';

// Initialize SQLite database
const sqlite = new Database('sqlite.db', { verbose: console.log });

// Create drizzle database instance
export const db = drizzle(sqlite, { schema });

// Optionally export the raw database instance
export const sqliteDb = sqlite; 