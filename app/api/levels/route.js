import { db } from "@/app/db";
import { levels } from "@/app/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Get all levels from the levels table
        const result = await db.select().from(levels);
        
        // Format the response to match the expected format by existing components
        return NextResponse.json(
            result.map(item => ({ level: item.level }))
        );
    } catch (error) {
        console.error("Error fetching levels:", error);
        return NextResponse.json(
            { error: "Failed to fetch levels" },
            { status: 500 }
        );
    }
} 