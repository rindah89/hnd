var drizzle = require('drizzle-orm/sqlite-core');
var sqliteTable = drizzle.sqliteTable;
var text = drizzle.text;
var integer = drizzle.integer;

var campuses = sqliteTable('campuses', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    address: text('address').notNull()
});

var departments = sqliteTable('departments', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    category: text('category').notNull() // 'Engineering', 'Medical', etc.
});

var campus_departments = sqliteTable('campus_departments', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    campusId: integer('campus_id').references(() => campuses.id).notNull(),
    departmentId: integer('department_id').references(() => departments.id).notNull()
});

var students = sqliteTable('students', {
    id: integer('id').primaryKey(),
    matricule: text('matricule').notNull().unique(),
    name: text('name').notNull(),
    level: text('level').notNull(),
    address: text('address').notNull(),
    contact: text('contact').notNull(),
    departmentId: integer('department_id').references(() => departments.id).notNull(),
    campusId: integer('campus_id').references(() => campuses.id).notNull()
});

var levels = sqliteTable('levels', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    level: text('level').notNull()
});

var attendance = sqliteTable('attendance', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    studentId: integer('student_id').references(() => students.id).notNull(),
    present: integer('present', { mode: 'boolean' }).default(false).notNull(),
    day: text('day').notNull(),
    date: text('date').notNull(),
    month: integer('month'),
    year: integer('year')
});

module.exports = {
    students,
    levels,
    attendance,
    campuses,
    departments,
    campus_departments
}; 