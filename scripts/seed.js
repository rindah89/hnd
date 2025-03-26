const Database = require('better-sqlite3');
const { faker } = require('@faker-js/faker');

const db = new Database('sqlite.db');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS campuses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS campus_departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campus_id INTEGER NOT NULL,
        department_id INTEGER NOT NULL,
        FOREIGN KEY (campus_id) REFERENCES campuses(id),
        FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        grade TEXT NOT NULL,
        address TEXT NOT NULL,
        contact TEXT NOT NULL,
        department_id INTEGER NOT NULL,
        campus_id INTEGER NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id),
        FOREIGN KEY (campus_id) REFERENCES campuses(id)
    );

    CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        grade TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        present BOOLEAN NOT NULL DEFAULT 0,
        day TEXT NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id)
    );
`);

// Seed campuses
const campuses = [
    { name: 'Bonaberi', address: 'Bonaberi, Douala' },
    { name: 'Bonamousadi', address: 'Kamga Area, Bonamousadi' },
    { name: 'Yaounde', address: 'Yaounde Central' },
    { name: 'Bamenda', address: 'Bamenda Main Campus' }
];

const insertCampus = db.prepare('INSERT INTO campuses (name, address) VALUES (?, ?)');
campuses.forEach(campus => {
    insertCampus.run(campus.name, campus.address);
});

// Seed departments
const departmentsByCategory = {
    Engineering: [
        'Software Engineering',
        'Network and Security',
        'MIT',
        'EPS'
    ],
    Medical: [
        'Medicine',
        'Pharmacy',
        'Nursing',
        'Laboratory Science'
    ]
};

const insertDepartment = db.prepare('INSERT INTO departments (name, category) VALUES (?, ?)');
Object.entries(departmentsByCategory).forEach(([category, depts]) => {
    depts.forEach(dept => {
        insertDepartment.run(dept, category);
    });
});

// Configure department availability by campus
const campusConfig = {
    'Bonaberi': ['Engineering', 'Medical'],
    'Bonamousadi': ['Engineering', 'Medical'],
    'Yaounde': ['Engineering', 'Medical'],
    'Bamenda': ['Engineering', 'Medical']
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

// Seed grades
const grades = ['100', '200', '300', '400', 'Masters 1', 'Masters 2'];
const insertGrade = db.prepare('INSERT INTO grades (grade) VALUES (?)');
grades.forEach(grade => {
    insertGrade.run(grade);
});

// Seed students
const insertStudent = db.prepare(`
    INSERT INTO students (name, grade, address, contact, department_id, campus_id)
    VALUES (?, ?, ?, ?, ?, ?)
`);

// Generate 40 students
for (let i = 0; i < 40; i++) {
    const randomCampus = db.prepare('SELECT id FROM campuses ORDER BY RANDOM() LIMIT 1').get();
    const availableDepts = db.prepare(`
        SELECT DISTINCT d.id 
        FROM departments d 
        JOIN campus_departments cd ON cd.department_id = d.id 
        WHERE cd.campus_id = ?
    `).all(randomCampus.id);
    
    const randomDept = availableDepts[Math.floor(Math.random() * availableDepts.length)];
    const randomGrade = grades[Math.floor(Math.random() * grades.length)];
    
    insertStudent.run(
        faker.person.fullName(),
        randomGrade,
        faker.location.streetAddress(),
        faker.phone.number(),
        randomDept.id,
        randomCampus.id
    );
}

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

console.log('Database seeded successfully!'); 