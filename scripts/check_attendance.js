/**
 * Script to verify the attendance table structure and data
 */
const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

// Check table structure
console.log('Checking attendance table structure:');
const columns = db.prepare('PRAGMA table_info(attendance)').all();
console.table(columns);

// Check sample data
console.log('\nSample attendance records:');
const records = db.prepare('SELECT id, student_id, day, date, month, year, present FROM attendance LIMIT 10').all();
console.table(records);

// Check if month and year need to be populated
const nullMonthYearCount = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE month IS NULL OR year IS NULL').get();
console.log(`\nRecords with null month or year: ${nullMonthYearCount.count}`);

if (nullMonthYearCount.count > 0) {
  console.log('Some records need month and year values populated. Running update...');
  
  // Update records with null month or year
  const updateResult = db.prepare(`
    UPDATE attendance 
    SET month = CAST(substr(date, 6, 2) AS INTEGER), 
        year = CAST(substr(date, 1, 4) AS INTEGER)
    WHERE month IS NULL OR year IS NULL
  `).run();
  
  console.log(`Updated ${updateResult.changes} records.`);
  
  // Verify update
  const remainingNullCount = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE month IS NULL OR year IS NULL').get();
  console.log(`Remaining records with null month or year: ${remainingNullCount.count}`);
  
  // Show updated records
  if (updateResult.changes > 0) {
    console.log('\nSample of updated records:');
    const updatedRecords = db.prepare('SELECT id, student_id, day, date, month, year FROM attendance LIMIT 10').all();
    console.table(updatedRecords);
  }
} else {
  console.log('All records have month and year values populated.');
}

db.close(); 