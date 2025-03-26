import { db } from "@/app/db";
import { attendance, students, departments, campuses } from "@/app/db/schema";
import { and, asc, eq, sql, like, isNull, or, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Get and log all parameters
        const departmentId = searchParams.get('departmentId');
        const campusId = searchParams.get('campusId');
        const level = searchParams.get('level');
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const studentName = searchParams.get('studentName');
        
        console.log('Attendance API - Received parameters:', {
            departmentId,
            campusId,
            level,
            month,
            year,
            studentName
        });
        
        // Build where conditions based on filters
        const whereConditions = [];
        const appliedFilters = [];
        
        // Add student name filter if specified
        if (studentName) {
            whereConditions.push(like(students.name, `%${studentName}%`));
            appliedFilters.push(`Student name: ${studentName}`);
        }
        
        // Add level filter if specified and not 'all'
        if (level && level !== 'all') {
            whereConditions.push(eq(students.level, level));
            appliedFilters.push(`Level: ${level}`);
        }
        
        // Parse departmentId as integer if it exists and is not 'all'
        if (departmentId && departmentId !== 'all') {
            try {
                const deptId = parseInt(departmentId);
                if (!isNaN(deptId)) {
                    whereConditions.push(eq(students.departmentId, deptId));
                    appliedFilters.push(`Department ID: ${deptId}`);
                } else {
                    console.warn(`Invalid departmentId: ${departmentId}`);
                }
            } catch (error) {
                console.warn(`Error parsing departmentId: ${departmentId}. Error: ${error.message}`);
            }
        }
        
        // Parse campusId as integer if it exists and is not 'all'
        if (campusId && campusId !== 'all') {
            try {
                const campId = parseInt(campusId);
                if (!isNaN(campId)) {
                    whereConditions.push(eq(students.campusId, campId));
                    appliedFilters.push(`Campus ID: ${campId}`);
                } else {
                    console.warn(`Invalid campusId: ${campusId}`);
                }
            } catch (error) {
                console.warn(`Error parsing campusId: ${campusId}. Error: ${error.message}`);
            }
        }
        
        // Parse month and year for attendance records
        const monthValue = month ? parseInt(month) : null;
        const yearValue = year ? parseInt(year) : null;
        
        if (monthValue && yearValue) {
            appliedFilters.push(`Month: ${monthValue}, Year: ${yearValue}`);
        }
        
        if (appliedFilters.length > 0) {
            console.log(`Applying filters: ${appliedFilters.join(', ')}`);
        } else {
            console.log('No filters applied, returning all students');
        }
        
        // Get all students based on filters
        let studentsQuery = db.select({
            id: students.id,
            name: students.name,
            matricule: students.matricule,
            level: students.level,
            departmentId: students.departmentId,
            campusId: students.campusId,
            departmentName: departments.name,
            campusName: campuses.name
        })
        .from(students)
        .leftJoin(departments, eq(students.departmentId, departments.id))
        .leftJoin(campuses, eq(students.campusId, campuses.id));
        
        // Apply where conditions if any exist
        if (whereConditions.length > 0) {
            studentsQuery = studentsQuery.where(and(...whereConditions));
        }
        
        // Execute the query
        const studentsResult = await studentsQuery.orderBy(asc(students.name));
        console.log(`Found ${studentsResult.length} students matching filters`);
        
        // If no students found, return empty array
        if (studentsResult.length === 0) {
            console.log('No students found matching filters, returning empty array');
            return NextResponse.json({
                success: true,
                data: []
            });
        }
        
        // Get attendance records for these students
        let attendanceQuery;
        
        // Only build the attendance query if we have students
        if (studentsResult.length > 0) {
            const studentIds = studentsResult.map(student => student.id);
            console.log(`Searching attendance for ${studentIds.length} students`);
            
            // Create a valid SQL condition for student IDs
            let attendanceQueryBuilder = db.select().from(attendance);
            
            // Add WHERE clause for studentIds if there are any
            if (studentIds.length > 0) {
                if (studentIds.length === 1) {
                    // For a single student, use eq operator
                    attendanceQueryBuilder = attendanceQueryBuilder.where(
                        eq(attendance.studentId, studentIds[0])
                    );
                } else {
                    // For multiple students, use SQL IN clause
                    attendanceQueryBuilder = attendanceQueryBuilder.where(
                        sql`${attendance.studentId} IN (${sql.join(studentIds, sql`, `)})`
                    );
                }
            }
            
            // Add month and year filter using the dedicated columns
            if (monthValue && yearValue) {
                attendanceQueryBuilder = attendanceQueryBuilder.where(
                    and(
                        eq(attendance.month, monthValue),
                        eq(attendance.year, yearValue)
                    )
                );
                console.log(`Filtering attendance by month: ${monthValue}, year: ${yearValue}`);
            }
            
            attendanceQuery = attendanceQueryBuilder;
        }
        
        // Get attendance records or use empty array if no students
        const attendanceRecords = attendanceQuery ? await attendanceQuery : [];
        console.log(`Found ${attendanceRecords.length} attendance records`);
        
        // Combine student info with attendance records
        const result = attendanceRecords.map(record => {
            const student = studentsResult.find(s => s.id === record.studentId);
            
            if (!student) {
                console.warn(`Cannot find student with ID ${record.studentId}`);
                return null;
            }
            
            return {
                id: record.id,
                studentId: student.id,
                name: student.name,
                matricule: student.matricule,
                level: student.level,
                departmentId: student.departmentId,
                departmentName: student.departmentName,
                campusId: student.campusId,
                campusName: student.campusName,
                day: record.day,
                present: record.present,
                month: record.month,
                year: record.year
            };
        }).filter(Boolean);
        
        // Also create records for students with no attendance
        const allStudentsResult = studentsResult.map(student => ({
            studentId: student.id,
            name: student.name,
            matricule: student.matricule,
            level: student.level,
            departmentId: student.departmentId,
            departmentName: student.departmentName,
            campusId: student.campusId,
            campusName: student.campusName,
            day: null,
            present: null,
            month: monthValue,
            year: yearValue
        }));
        
        // Combine both arrays
        const combinedResult = [...result];
        
        // Add students that don't have attendance records
        allStudentsResult.forEach(student => {
            // Check if student already has any attendance records in our result
            const hasAttendanceRecord = result.some(r => r.studentId === student.studentId);
            
            if (!hasAttendanceRecord) {
                combinedResult.push(student);
            }
        });
        
        return NextResponse.json({
            success: true,
            data: combinedResult
        });
    } catch (error) {
        console.error('Error in attendance GET route:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        
        // Log the request body
        console.log('Attendance POST - Request body:', data);
        
        // Validate request data
        if (!data.studentId || data.present === undefined || !data.day || !data.month || !data.year) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields"
            }, { status: 400 });
        }
        
        // Format date in YYYY-MM-DD format
        const yearString = parseInt(data.year).toString();
        const monthString = parseInt(data.month).toString().padStart(2, '0');
        const dayString = data.day.toString().padStart(2, '0');
        const formattedDate = `${yearString}-${monthString}-${dayString}`;
        
        // Check if attendance record already exists
        const existingRecord = await db.select()
            .from(attendance)
            .where(
                and(
                    eq(attendance.studentId, data.studentId),
                    eq(attendance.day, data.day),
                    eq(attendance.month, parseInt(data.month)),
                    eq(attendance.year, parseInt(data.year))
                )
            );
        
        let result;
        
        if (existingRecord.length > 0) {
            // Update existing record
            console.log(`Updating attendance record ID ${existingRecord[0].id} for student ${data.studentId}`);
            result = await db.update(attendance)
                .set({ present: data.present })
                .where(eq(attendance.id, existingRecord[0].id))
                .returning();
        } else {
            // Create new record
            console.log(`Creating new attendance record for student ${data.studentId}`);
            result = await db.insert(attendance)
                .values({
                    studentId: parseInt(data.studentId),
                    day: data.day,
                    date: formattedDate,
                    month: parseInt(data.month),
                    year: parseInt(data.year),
                    present: Boolean(data.present)
                })
                .returning();
        }
        
        // Get student details
        const studentResult = await db.select({
            student: students,
            departmentName: departments.name,
            campusName: campuses.name
        })
        .from(students)
        .where(eq(students.id, parseInt(data.studentId)))
        .leftJoin(departments, eq(students.departmentId, departments.id))
        .leftJoin(campuses, eq(students.campusId, campuses.id));
        
        if (studentResult.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Student not found"
            }, { status: 404 });
        }
        
        const student = studentResult[0];
        
        // Return updated record with student info
        return NextResponse.json({
            success: true,
            data: {
                id: result[0].id,
                studentId: student.student.id,
                name: student.student.name,
                matricule: student.student.matricule,
                level: student.student.level,
                departmentId: student.student.departmentId,
                departmentName: student.departmentName || 'Unknown Department',
                campusId: student.student.campusId,
                campusName: student.campusName || 'Unknown Campus',
                day: result[0].day,
                present: result[0].present,
                month: result[0].month,
                year: result[0].year
            }
        });
    } catch (error) {
        console.error('Error in attendance POST route:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const attendanceId = searchParams.get('id');
        const studentId = searchParams.get('studentId');
        const day = searchParams.get('day');
        const date = searchParams.get('date');
        
        // Log the deletion attempt
        console.log(`Attempting to delete attendance record:`, {
            attendanceId,
            studentId,
            day,
            date
        });
        
        let whereCondition;
        
        if (attendanceId) {
            // Delete by ID if provided
            whereCondition = eq(attendance.id, parseInt(attendanceId));
        } else if (studentId && day && date) {
            // Parse month and year from date format (MM/YYYY)
            const [month, year] = date.split('/').map(num => parseInt(num));
            
            if (!month || !year) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid date format. Expected MM/YYYY"
                }, { status: 400 });
            }
            
            console.log(`Deleting attendance for student ${studentId}, day ${day}, month ${month}, year ${year}`);
            
            // Use month and year fields directly
            whereCondition = and(
                eq(attendance.studentId, parseInt(studentId)),
                eq(attendance.day, day),
                eq(attendance.month, month),
                eq(attendance.year, year)
            );
        } else {
            return NextResponse.json({
                success: false,
                message: "Either attendance ID or combination of studentId, day, and date is required"
            }, { status: 400 });
        }
        
        // Delete the attendance record
        const result = await db.delete(attendance)
            .where(whereCondition)
            .returning();
        
        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Attendance record not found"
            }, { status: 404 });
        }
        
        console.log(`Successfully deleted attendance record`);
        
        return NextResponse.json({
            success: true,
            message: "Attendance record deleted successfully"
        });
    } catch (error) {
        console.error('Error in attendance DELETE route:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}