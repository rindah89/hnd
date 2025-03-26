const Database = require('better-sqlite3');

// Connect to the database
const db = new Database('sqlite.db');

console.log('Starting database migration...');

// Begin transaction
db.prepare('BEGIN TRANSACTION').run();

try {
    // Check if we need to run the migration (if matricule column doesn't exist)
    const tableInfo = db.prepare("PRAGMA table_info(students)").all();
    const hasMatricule = tableInfo.some(column => column.name === 'matricule');
    const hasLevel = tableInfo.some(column => column.name === 'level');
    
    if (!hasMatricule || !hasLevel) {
        console.log('Migrating students table...');
        
        // First, get the current schema to understand column names
        console.log('Analyzing current schema...');
        const columnNames = tableInfo.map(column => column.name);
        console.log('Current columns:', columnNames);
        
        // Check for proper department and campus column names
        const departmentIdColumn = columnNames.includes('department_id') ? 'department_id' : 
                                 columnNames.includes('departmentId') ? 'departmentId' : null;
        const campusIdColumn = columnNames.includes('campus_id') ? 'campus_id' : 
                             columnNames.includes('campusId') ? 'campusId' : null;
        
        if (!departmentIdColumn || !campusIdColumn) {
            console.error('Could not find department or campus ID columns');
            throw new Error('Required columns not found in schema');
        }
        
        console.log(`Using department column: ${departmentIdColumn}`);
        console.log(`Using campus column: ${campusIdColumn}`);
        
        // Create a new students table with the updated schema
        db.prepare(`
            CREATE TABLE new_students (
                id INTEGER PRIMARY KEY,
                matricule TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                level TEXT NOT NULL,
                address TEXT NOT NULL,
                contact TEXT NOT NULL,
                department_id INTEGER NOT NULL,
                campus_id INTEGER NOT NULL,
                FOREIGN KEY (department_id) REFERENCES departments(id),
                FOREIGN KEY (campus_id) REFERENCES campuses(id)
            )
        `).run();
        
        // First create sample departments and campuses if they don't exist
        const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get().count;
        if (deptCount === 0) {
            console.log('Creating sample departments...');
            db.prepare('INSERT INTO departments (name, category) VALUES (?, ?)').run('Computer Science', 'Engineering');
            db.prepare('INSERT INTO departments (name, category) VALUES (?, ?)').run('Electrical Engineering', 'Engineering');
            db.prepare('INSERT INTO departments (name, category) VALUES (?, ?)').run('Medicine', 'Medical');
        }
        
        const campusCount = db.prepare('SELECT COUNT(*) as count FROM campuses').get().count;
        if (campusCount === 0) {
            console.log('Creating sample campuses...');
            db.prepare('INSERT INTO campuses (name, address) VALUES (?, ?)').run('Yaoundé Campus', 'Yaoundé, Cameroon');
            db.prepare('INSERT INTO campuses (name, address) VALUES (?, ?)').run('Douala Campus', 'Douala, Cameroon');
        }
        
        // Get default department and campus IDs to use if needed
        const defaultDept = db.prepare('SELECT id FROM departments ORDER BY id LIMIT 1').get();
        const defaultCampus = db.prepare('SELECT id FROM campuses ORDER BY id LIMIT 1').get();
        
        if (!defaultDept || !defaultCampus) {
            throw new Error('Could not create or find default departments and campuses');
        }
        
        console.log(`Default department ID: ${defaultDept.id}, Default campus ID: ${defaultCampus.id}`);
        
        // Copy data from old table to new table with appropriate transformations
        // Generate a unique matricule for each student
        const query = `SELECT * FROM students`;
        console.log(`Executing query: ${query}`);
        const students = db.prepare(query).all();
        console.log(`Found ${students.length} students to migrate`);
        
        const insertStmt = db.prepare(`
            INSERT INTO new_students (id, matricule, name, level, address, contact, department_id, campus_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        students.forEach((student, index) => {
            // Generate a unique matricule based on the student's id
            const matricule = `CM${String(student.id).padStart(5, '0')}`;
            const gradeField = columnNames.includes('grade') ? 'grade' : 'level';
            const level = student[gradeField] || '100';
            
            const deptId = student[departmentIdColumn] || defaultDept.id;
            const campusId = student[campusIdColumn] || defaultCampus.id;
            
            console.log(`Migrating student ${student.id}: ${student.name} with dept=${deptId}, campus=${campusId}`);
            
            insertStmt.run(
                student.id,
                matricule, 
                student.name,
                level,
                student.address || 'Unknown Address',
                student.contact || 'Unknown Contact',
                deptId,
                campusId
            );
        });
        
        // Drop the old table
        db.prepare('DROP TABLE students').run();
        
        // Rename the new table
        db.prepare('ALTER TABLE new_students RENAME TO students').run();
        
        console.log(`Migrated ${students.length} students to new schema`);
    } else {
        console.log('Students table already has the matricule and level columns. No migration needed.');
    }
    
    // Commit the transaction
    db.prepare('COMMIT').run();
    console.log('Migration completed successfully!');
    
} catch (error) {
    // Rollback on error
    db.prepare('ROLLBACK').run();
    console.error('Migration failed:', error);
    process.exit(1);
} 