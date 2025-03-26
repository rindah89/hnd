/**
 * Migration script to update the attendance table structure:
 * 1. Add month and year columns
 * 2. Populate them with data extracted from the existing date field
 */

const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

console.log('Starting attendance table migration...');

// Check if the month and year columns already exist
const checkColumns = db.prepare(`
  PRAGMA table_info(attendance)
`).all();

const hasMonthColumn = checkColumns.some(col => col.name === 'month');
const hasYearColumn = checkColumns.some(col => col.name === 'year');

if (hasMonthColumn && hasYearColumn) {
  console.log('Month and year columns already exist in the attendance table.');
} else {
  // Start a transaction
  db.exec('BEGIN TRANSACTION;');
  
  try {
    // Step 1: Add the month and year columns if they don't exist
    if (!hasMonthColumn) {
      console.log('Adding month column to attendance table...');
      db.exec('ALTER TABLE attendance ADD COLUMN month INTEGER;');
    }
    
    if (!hasYearColumn) {
      console.log('Adding year column to attendance table...');
      db.exec('ALTER TABLE attendance ADD COLUMN year INTEGER;');
    }
    
    // Step 2: Update the month and year columns based on the date column
    console.log('Updating month and year values from date column...');
    const attendanceRecords = db.prepare('SELECT id, date FROM attendance').all();
    
    const updateRecord = db.prepare(`
      UPDATE attendance 
      SET month = ?, year = ? 
      WHERE id = ?
    `);
    
    let updatedCount = 0;
    
    for (const record of attendanceRecords) {
      if (record.date) {
        const dateParts = record.date.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]);
          
          if (!isNaN(year) && !isNaN(month)) {
            updateRecord.run(month, year, record.id);
            updatedCount++;
          }
        }
      }
    }
    
    console.log(`Updated ${updatedCount} attendance records with month and year values.`);
    
    // Create an index on the new columns to improve query performance
    console.log('Creating indexes on month and year columns...');
    db.exec('CREATE INDEX IF NOT EXISTS idx_attendance_month_year ON attendance(month, year);');
    
    // Commit the transaction
    db.exec('COMMIT;');
    console.log('Migration completed successfully!');
  } catch (error) {
    // Roll back the transaction in case of error
    db.exec('ROLLBACK;');
    console.error('Migration failed:', error.message);
  }
}

// Update the schema.js file to reflect the new structure
console.log('Done! Remember to update the schema.js file to include the new columns.'); 