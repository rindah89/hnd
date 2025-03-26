const Database = require('better-sqlite3');
const { faker } = require('@faker-js/faker');

// Delete existing database if it exists
const fs = require('fs');
if (fs.existsSync('sqlite.db')) {
  fs.unlinkSync('sqlite.db');
  console.log('Deleted existing database file');
}

// Create a new database
const db = new Database('sqlite.db');
console.log('Created new database file');

// Create the tables with the correct schema
db.exec(`
  -- Enable foreign keys
  PRAGMA foreign_keys = ON;
  
  -- Create campuses table
  CREATE TABLE campuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL
  );
  
  -- Create departments table
  CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL
  );
  
  -- Create campus_departments table
  CREATE TABLE campus_departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campus_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    FOREIGN KEY (campus_id) REFERENCES campuses(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
  );
  
  -- Create students table with matricule and level
  CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricule TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    address TEXT NOT NULL,
    contact TEXT NOT NULL,
    department_id INTEGER NOT NULL,
    campus_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (campus_id) REFERENCES campuses(id)
  );
  
  -- Create grades table
  CREATE TABLE grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grade TEXT NOT NULL
  );
  
  -- Create attendance table
  CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    present BOOLEAN NOT NULL DEFAULT 0,
    day TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );
`);

console.log('Created database tables');

// Seed campuses
const campuses = [
  { name: 'Yaoundé Campus', address: 'Quartier Bastos, Yaoundé, Cameroon' },
  { name: 'Douala Campus', address: 'Akwa, Douala, Cameroon' },
  { name: 'Buea Campus', address: 'Molyko, Buea, Cameroon' },
  { name: 'Bamenda Campus', address: 'Up Station, Bamenda, Cameroon' }
];

const insertCampus = db.prepare('INSERT INTO campuses (name, address) VALUES (?, ?)');
campuses.forEach(campus => {
  insertCampus.run(campus.name, campus.address);
});

console.log('Inserted campus data');

// Seed departments
const departmentsByCategory = {
  Engineering: [
    'Software Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Civil Engineering'
  ],
  Medical: [
    'Medicine',
    'Pharmacy',
    'Nursing',
    'Laboratory Science'
  ],
  Business: [
    'Business Administration',
    'Accounting',
    'Marketing',
    'Finance'
  ]
};

const insertDepartment = db.prepare('INSERT INTO departments (name, category) VALUES (?, ?)');
Object.entries(departmentsByCategory).forEach(([category, depts]) => {
  depts.forEach(dept => {
    insertDepartment.run(dept, category);
  });
});

console.log('Inserted department data');

// Configure department availability by campus
const campusConfig = {
  'Yaoundé Campus': ['Engineering', 'Medical', 'Business'],
  'Douala Campus': ['Engineering', 'Medical', 'Business'],
  'Buea Campus': ['Engineering', 'Business'],
  'Bamenda Campus': ['Medical', 'Business']
};

// Link departments to campuses
const insertCampusDepartment = db.prepare('INSERT INTO campus_departments (campus_id, department_id) VALUES (?, ?)');
Object.entries(campusConfig).forEach(([campusName, categories]) => {
  const campus = db.prepare('SELECT id FROM campuses WHERE name = ?').get(campusName);
  categories.forEach(category => {
    const departments = db.prepare('SELECT id FROM departments WHERE category = ?').all(category);
    departments.forEach(dept => {
      insertCampusDepartment.run(campus.id, dept.id);
    });
  });
});

console.log('Linked departments to campuses');

// Seed grades/levels
const levels = ['100', '200', '300', '400', 'Masters 1', 'Masters 2'];
const insertGrade = db.prepare('INSERT INTO grades (grade) VALUES (?)');
levels.forEach(level => {
  insertGrade.run(level);
});

console.log('Inserted level data');

// Seed students
const insertStudent = db.prepare(`
  INSERT INTO students (matricule, name, level, address, contact, department_id, campus_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

// Helper function to generate matricule
const generateMatricule = (index, department) => {
  // First letter of department + year + sequence number
  const deptCode = department.substring(0, 2).toUpperCase();
  const year = new Date().getFullYear().toString().substring(2);
  const sequence = String(index + 1).padStart(3, '0');
  return `${deptCode}${year}${sequence}`;
};

// Generate students
for (let i = 0; i < 30; i++) {
  const randomCampus = db.prepare('SELECT id FROM campuses ORDER BY RANDOM() LIMIT 1').get();
  const availableDepts = db.prepare(`
    SELECT DISTINCT d.id, d.name
    FROM departments d 
    JOIN campus_departments cd ON cd.department_id = d.id 
    WHERE cd.campus_id = ?
  `).all(randomCampus.id);
  
  const randomDeptObj = availableDepts[Math.floor(Math.random() * availableDepts.length)];
  const randomLevel = levels[Math.floor(Math.random() * levels.length)];
  
  const studentName = faker.person.fullName();
  const matricule = generateMatricule(i, randomDeptObj.name);
  const address = `${faker.location.streetAddress()}, Cameroon`;
  const contact = `6${faker.string.numeric(8)}`; // Cameroon-like phone number
  
  insertStudent.run(
    matricule,
    studentName,
    randomLevel,
    address,
    contact,
    randomDeptObj.id,
    randomCampus.id
  );
}

console.log('Inserted student data');

// Seed attendance for the past 30 days
const insertAttendance = db.prepare(`
  INSERT INTO attendance (student_id, present, day, date)
  VALUES (?, ?, ?, ?)
`);

const students = db.prepare('SELECT id FROM students').all();
const today = new Date();

for (let i = 0; i < 30; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  const day = date.getDate().toString();
  
  // Skip weekends
  if (date.getDay() === 0 || date.getDay() === 6) continue;
  
  students.forEach(student => {
    // 80% chance of being present
    const present = Math.random() < 0.8;
    insertAttendance.run(student.id, present ? 1 : 0, day, dateStr);
  });
}

console.log('Inserted attendance data');

// Verify the database
const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
console.log(`Database contains ${studentCount} students`);

// Show a sample student
const sampleStudent = db.prepare(`
  SELECT s.id, s.matricule, s.name, s.level, s.address, s.contact, 
         d.name as department_name, d.category as department_category,
         c.name as campus_name
  FROM students s
  JOIN departments d ON s.department_id = d.id
  JOIN campuses c ON s.campus_id = c.id
  LIMIT 1
`).get();

console.log('\nSample student:');
console.log(sampleStudent);

console.log('\nDatabase created and populated successfully!'); 