import { db } from "@/app/db";
import { students, departments, campuses } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET a single student by ID
export async function GET(req, { params }) {
    try {
        const { id } = params;
        
        if (!id) {
            return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
        }

        // Join with departments and campuses to get their names
        const result = await db.select({
            id: students.id,
            matricule: students.matricule,
            name: students.name,
            level: students.level,
            address: students.address,
            contact: students.contact,
            departmentId: students.departmentId,
            campusId: students.campusId,
            departmentName: departments.name,
            departmentCategory: departments.category,
            campusName: campuses.name
        })
        .from(students)
        .leftJoin(departments, eq(students.departmentId, departments.id))
        .leftJoin(campuses, eq(students.campusId, campuses.id))
        .where(eq(students.id, id))
        .limit(1);

        if (result.length === 0) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error("Error fetching student:", error);
        return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
    }
}

// PUT to update a student
export async function PUT(req, { params }) {
    try {
        const { id } = params;
        const data = await req.json();
        
        if (!id) {
            return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
        }

        // Check if student exists
        const existingStudent = await db.select({ id: students.id })
            .from(students)
            .where(eq(students.id, id))
            .limit(1);

        if (existingStudent.length === 0) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Check if matricule is already in use by another student
        if (data.matricule) {
            const duplicateMatricule = await db.select({ id: students.id })
                .from(students)
                .where(eq(students.matricule, data.matricule))
                .limit(1);

            if (duplicateMatricule.length > 0 && duplicateMatricule[0].id !== id) {
                return NextResponse.json({ 
                    error: "Matricule already exists. Please use a different matricule." 
                }, { status: 400 });
            }
        }

        // Update the student record
        const updateData = {};
        if (data.matricule) updateData.matricule = data.matricule;
        if (data.name) updateData.name = data.name;
        if (data.level) updateData.level = data.level;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.contact !== undefined) updateData.contact = data.contact;
        if (data.departmentId !== undefined) updateData.departmentId = data.departmentId;
        if (data.campusId !== undefined) updateData.campusId = data.campusId;

        const result = await db.update(students)
            .set(updateData)
            .where(eq(students.id, id));

        return NextResponse.json({ message: "Student updated successfully", id });
    } catch (error) {
        console.error("Error updating student:", error);
        return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
    }
} 