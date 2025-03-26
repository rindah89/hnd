const Database = require('better-sqlite3');

// Connect to the database
const db = new Database('sqlite.db');

console.log('Checking database structure...');

// Get list of all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\nTables in the database:');
console.log(tables.map(t => t.name).join(', '));

// For each table, get its schema
tables.forEach(table => {
  const tableName = table.name;
  if (tableName === 'sqlite_sequence') return; // Skip internal sqlite table
  
  console.log(`\n===== Schema for table: ${tableName} =====`);
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  
  columns.forEach(col => {
    console.log(`${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
  });
  
  // Show foreign keys
  const foreignKeys = db.prepare(`PRAGMA foreign_key_list(${tableName})`).all();
  if (foreignKeys.length > 0) {
    console.log('\nForeign Keys:');
    foreignKeys.forEach(fk => {
      console.log(`${fk.from} -> ${fk.table}(${fk.to})`);
    });
  }
});

// Specifically check the students table
try {
  console.log('\n\n===== Checking Students Table for Migration =====');
  const studentColumns = db.prepare("PRAGMA table_info(students)").all();
  const columnNames = studentColumns.map(col => col.name);
  
  console.log('Student table columns:', columnNames.join(', '));
  
  const hasMatricule = columnNames.includes('matricule');
  const hasLevel = columnNames.includes('level');
  const hasGrade = columnNames.includes('grade');
  
  console.log(`Has matricule column: ${hasMatricule}`);
  console.log(`Has level column: ${hasLevel}`);
  console.log(`Has grade column: ${hasGrade}`);
  
  if (!hasMatricule || !hasLevel) {
    console.log('\n⚠️ WARNING: Students table does not have the expected schema after migration!');
  } else {
    console.log('\n✅ Students table has the expected schema.');
  }

  // Check if we can query the students table with the expected schema
  try {
    const students = db.prepare(`
      SELECT id, matricule, name, level, address, contact, department_id, campus_id 
      FROM students LIMIT 5
    `).all();
    
    console.log('\nSample data from students table:');
    console.log(students);
  } catch (error) {
    console.error('Error querying students table:', error.message);
  }
} catch (error) {
  console.error('Error checking students table:', error.message);
}

console.log('\nDatabase check completed.'); 