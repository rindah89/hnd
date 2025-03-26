import { db } from "@/app/db";
import { students, departments, campuses } from "@/app/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req, res) {
    try {
        const data = await req.json();

        // Validate required fields
        if (!data.id || !data.matricule || !data.name || !data.level || !data.departmentId || !data.campusId || !data.contact || !data.address) {
            return NextResponse.json({ 
                error: "Missing required fields. Please provide id, matricule, name, level, departmentId, campusId, contact, and address." 
            }, { status: 400 });
        }

        // Check if matricule is already in use
        const existingStudent = await db.select({ id: students.id })
            .from(students)
            .where(eq(students.matricule, data.matricule))
            .limit(1);

        if (existingStudent.length > 0) {
            return NextResponse.json({ 
                error: "Matricule already exists. Please use a different matricule." 
            }, { status: 400 });
        }

        const result = await db.insert(students)
            .values({
                id: data.id,
                matricule: data.matricule,
                name: data.name,
                level: data.level,
                address: data.address,
                contact: data.contact,
                departmentId: data.departmentId,
                campusId: data.campusId
            });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error creating student:", error);
        return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
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
        .orderBy(sql`${students.name} asc`);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
        }

        const result = await db.delete(students)
            .where(eq(students.id, id));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error deleting student:", error);
        return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
    }
}