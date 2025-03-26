import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const GRADES = sqliteTable('grades', {
    id: integer('id').primaryKey(),
    grade: text('grade').notNull()
});

export const STUDENTS = sqliteTable('students', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    grade: text('grade').notNull(),
    address: text('address'),
    contact: text('contact')
});

export const ATTENDACE = sqliteTable('attendance', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    studentId: integer('studentId').notNull(),
    present: integer('present', { mode: 'boolean' }).notNull().default(false),
    day: integer('day').notNull(),
    date: text('date').notNull()
});

