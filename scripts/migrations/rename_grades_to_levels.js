/**
 * Migration script to rename the grades table to levels
 * and update the column name from 'grade' to 'level'
 */

const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

console.log('Starting migration to rename grades table to levels...');

try {
  // Start a transaction
  db.exec('BEGIN TRANSACTION;');
  
  // Check if levels table already exists
  const levelsTableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='levels'
  `).get();
  
  if (levelsTableExists) {
    console.log('Levels table already exists, skipping migration');
  } else {
    // Check if grades table exists
    const gradesTableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='grades'
    `).get();
    
    if (!gradesTableExists) {
      console.log('Grades table does not exist, creating levels table directly');
      
      // Create levels table
      db.exec(`
        CREATE TABLE levels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level TEXT NOT NULL
        );
      `);
    } else {
      console.log('Renaming grades table to levels...');
      
      // Create new levels table
      db.exec(`
        CREATE TABLE levels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level TEXT NOT NULL
        );
      `);
      
      // Copy data from grades to levels, renaming 'grade' column to 'level'
      const grades = db.prepare('SELECT id, grade FROM grades').all();
      
      if (grades.length > 0) {
        console.log(`Migrating ${grades.length} records from grades to levels...`);
        
        const insertLevel = db.prepare('INSERT INTO levels (id, level) VALUES (?, ?)');
        
        for (const grade of grades) {
          insertLevel.run(grade.id, grade.grade);
        }
        
        console.log('Data migration completed');
      } else {
        console.log('No grades data to migrate');
      }
      
      // Drop the old grades table
      db.exec('DROP TABLE IF EXISTS grades;');
      console.log('Dropped old grades table');
    }
    
    console.log('Migration completed successfully');
  }
  
  // Check result
  const levels = db.prepare('SELECT * FROM levels').all();
  console.log(`Levels table now contains ${levels.length} records:`);
  console.table(levels);
  
  // Commit the transaction
  db.exec('COMMIT;');
  
} catch (error) {
  // Roll back in case of error
  db.exec('ROLLBACK;');
  console.error('Migration failed:', error.message);
}

db.close();
console.log('Done! Remember to update the schema.js file and any references to the grades table in the codebase.'); 