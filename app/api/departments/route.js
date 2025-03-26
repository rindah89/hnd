import { db } from "@/app/db";
import { departments } from "@/app/db/schema";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const result = await db.select().from(departments);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching departments:", error);
        return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
    }
} 