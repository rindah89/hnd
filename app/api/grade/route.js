import { db } from "@/app/db";
import { levels } from "@/app/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    const result = await db.select().from(levels);
    return NextResponse.json(result);
}