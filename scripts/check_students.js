/**
 * Script to check the student table structure
 */
const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

// Check table structure
console.log('Student table columns:');
const columns = db.prepare('PRAGMA table_info(students)').all();
console.table(columns);

// Get a sample record
console.log('\nSample student record:');
const student = db.prepare('SELECT * FROM students LIMIT 1').get();
console.log(student);

db.close(); 