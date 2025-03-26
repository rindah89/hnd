import { db } from "@/app/db";
import { students, attendance, departments, campuses } from "@/app/db/schema";
import { sql, and, between, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, format } from 'date-fns';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const fromDate = searchParams.get('from');
        const toDate = searchParams.get('to');
        const department = searchParams.get('department');

        console.log('API: Raw parameters received:', { 
            fromDate, 
            toDate, 
            department,
            rawParams: Object.fromEntries(searchParams.entries())
        });

        // Validate dates
        if (!fromDate || !toDate) {
            const now = new Date();
            const defaultFrom = format(startOfMonth(now), 'yyyy-MM-dd');
            const defaultTo = format(endOfMonth(now), 'yyyy-MM-dd');
            console.log('API: Using default dates:', { defaultFrom, defaultTo });
            return NextResponse.json({ 
                error: 'Invalid date range provided, using defaults',
                defaultRange: { from: defaultFrom, to: defaultTo }
            }, { status: 400 });
        }

        // Department filter condition
        const deptCondition = department && department !== 'all' 
            ? and(sql`${departments.name} = ${department}`)
            : undefined;

        // Get total students
        const totalStudents = await db.select({ count: sql`count(*)` })
            .from(students)
            .leftJoin(departments, sql`${students.departmentId} = ${departments.id}`)
            .where(deptCondition || sql`1=1`);

        console.log('API: Total students:', totalStudents[0].count);

        // Get attendance stats with department filter
        const todayStats = await db.select({
            present: sql`count(case when ${attendance.present} = 1 then 1 end)`,
            total: sql`count(distinct ${students.id})`,
            late: sql`count(case when ${attendance.present} = 0 then 1 end)`
        })
        .from(students)
        .leftJoin(departments, sql`${students.departmentId} = ${departments.id}`)
        .leftJoin(
            attendance,
            and(
                sql`${attendance.studentId} = ${students.id}`,
                between(attendance.date, fromDate, toDate)
            )
        )
        .where(deptCondition || sql`1=1`);

        console.log('API: Today stats:', todayStats[0]);

        // Get trend data with department filter
        const trendData = await db.select({
            date: attendance.date,
            present: sql`count(case when present = 1 then 1 end)`,
            absent: sql`count(case when present = 0 then 1 end)`,
            total: sql`count(distinct ${students.id})`
        })
        .from(students)
        .leftJoin(departments, sql`${students.departmentId} = ${departments.id}`)
        .leftJoin(
            attendance,
            and(
                sql`${attendance.studentId} = ${students.id}`,
                between(attendance.date, fromDate, toDate)
            )
        )
        .where(deptCondition || sql`1=1`)
        .groupBy(attendance.date)
        .orderBy(attendance.date);

        console.log('API: Trend data count:', trendData.length);

        // Department stats (keep all departments but highlight selected)
        const departmentStats = await db.select({
            department: departments.name,
            category: departments.category,
            total: sql`count(distinct ${students.id})`,
            present: sql`count(case when ${attendance.present} = 1 then 1 end)`,
            total_days: sql`count(distinct ${attendance.date})`
        })
        .from(departments)
        .leftJoin(students, sql`${students.departmentId} = ${departments.id}`)
        .leftJoin(
            attendance, 
            and(
                sql`${attendance.studentId} = ${students.id}`,
                between(attendance.date, fromDate, toDate)
            )
        )
        .groupBy(departments.id, departments.name, departments.category)
        .orderBy(departments.name);

        console.log('API: Department stats count:', departmentStats.length);

        // Get campus-wise stats for the date range
        const campusStats = await db.select({
            campus: campuses.name,
            total: sql`count(distinct ${students.id})`,
            present: sql`count(case when ${attendance.present} = 1 then 1 end)`
        })
        .from(campuses)
        .leftJoin(students, sql`${students.campusId} = ${campuses.id}`)
        .leftJoin(
            attendance, 
            and(
                sql`${attendance.studentId} = ${students.id}`,
                between(attendance.date, fromDate, toDate)
            )
        )
        .groupBy(campuses.id, campuses.name)
        .orderBy(campuses.name);

        console.log('API: Campus stats count:', campusStats.length);

        // Format trend data to ensure dates are properly formatted
        const formattedTrendData = trendData.map(record => ({
            ...record,
            date: new Date(record.date).toISOString().split('T')[0],
            present: Number(record.present) || 0,
            absent: Number(record.absent) || 0,
            total: Number(record.total) || 0
        }));

        const response = {
            totalStudents: Number(totalStudents[0].count),
            todayStats: {
                present: Number(todayStats[0]?.present) || 0,
                total: Number(todayStats[0]?.total) || 0,
                late: Number(todayStats[0]?.late) || 0
            },
            trendData: formattedTrendData,
            departmentStats: departmentStats.map(dept => ({
                ...dept,
                total: Number(dept.total) || 0,
                present: Number(dept.present) || 0,
                total_days: Number(dept.total_days) || 1,
                attendance_rate: (Number(dept.present) / (Number(dept.total) * Number(dept.total_days)) * 100) || 0
            })),
            campusStats: campusStats.map(campus => ({
                ...campus,
                total: Number(campus.total) || 0,
                present: Number(campus.present) || 0
            }))
        };

        console.log('API: Sending response:', {
            totalStudents: response.totalStudents,
            todayStats: response.todayStats,
            trendDataCount: response.trendData.length,
            departmentStatsCount: response.departmentStats.length,
            campusStatsCount: response.campusStats.length
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
    }
} 