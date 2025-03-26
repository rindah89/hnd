"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import GlobalApi from "@/app/_services/GlobalApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AttendanceCalendar() {
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    late: 0,
    absent: 0
  });

  useEffect(() => {
    fetchAttendanceData();
  }, [date]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const month = format(date, 'M');
      const year = format(date, 'yyyy');
      const day = format(date, 'd');

      const response = await GlobalApi.GetAttendanceByFilters({
        month,
        year,
        day
      });

      if (response.success) {
        // Calculate statistics from the response data
        const stats = response.data.reduce((acc, record) => {
          if (record.present === true) {
            acc.present += 1;
          } else if (record.present === false) {
            acc.absent += 1;
          }
          return acc;
        }, { present: 0, late: 0, absent: 0 });

        setAttendanceStats(stats);
      } else {
        toast.error("Error", {
          description: "Failed to fetch attendance data"
        });
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Error", {
        description: "An unexpected error occurred while fetching attendance data"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Attendance Calendar</h1>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly View</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate);
                }
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary for {format(date, 'MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-100 rounded-lg">
                    <h3 className="font-semibold">Present</h3>
                    <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                  </div>
                  <div className="p-4 bg-yellow-100 rounded-lg">
                    <h3 className="font-semibold">Late</h3>
                    <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
                  </div>
                  <div className="p-4 bg-red-100 rounded-lg">
                    <h3 className="font-semibold">Absent</h3>
                    <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 