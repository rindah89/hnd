import { db } from "@/app/db";
import { campuses } from "@/app/db/schema";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const result = await db.select().from(campuses);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching campuses:", error);
        return NextResponse.json({ error: "Failed to fetch campuses" }, { status: 500 });
    }
} 