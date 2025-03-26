"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  CalendarDays,
  Clock,
  FileSpreadsheet,
  Filter,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { DateRangePicker } from "@/components/date-range-picker";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addDays, format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayStats: {
      present: 0,
      total: 0,
      late: 0
    },
    trendData: [],
    departmentStats: [],
    campusStats: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  
  // Initialize with current month
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(today),
    to: endOfMonth(today)
  });
  const [tempDateRange, setTempDateRange] = useState({
    from: startOfMonth(today),
    to: endOfMonth(today)
  });

  const handleDateRangeChange = (range) => {
    if (!range?.from || !range?.to) return;
    
    // Ensure we're working with Date objects and handling timezone consistently
    const newRange = {
      from: new Date(new Date(range.from).toISOString().split('T')[0]),
      to: new Date(new Date(range.to).toISOString().split('T')[0])
    };
    
    console.log('Date range picker changed:', {
      from: format(newRange.from, 'yyyy-MM-dd'),
      to: format(newRange.to, 'yyyy-MM-dd'),
      rawFrom: range.from,
      rawTo: range.to
    });
    
    setTempDateRange(newRange);
  };

  const handleDepartmentChange = (value) => {
    console.log('Department changed:', value);
    setSelectedDepartment(value);
  };

  const applyDateRange = () => {
    if (!tempDateRange?.from || !tempDateRange?.to) return;
    
    // Ensure we're working with Date objects and handling timezone consistently
    const newRange = {
      from: new Date(new Date(tempDateRange.from).toISOString().split('T')[0]),
      to: new Date(new Date(tempDateRange.to).toISOString().split('T')[0])
    };
    
    console.log('Applying date range:', {
      from: format(newRange.from, 'yyyy-MM-dd'),
      to: format(newRange.to, 'yyyy-MM-dd'),
      rawFrom: tempDateRange.from,
      rawTo: tempDateRange.to
    });
    
    setDateRange(newRange);
    fetchData(); // Immediately fetch data with new range
    toast.success("Date range updated");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (!dateRange?.from || !dateRange?.to) {
        console.error('Invalid date range:', dateRange);
        return;
      }

      // Ensure consistent date formatting
      const fromDate = format(new Date(dateRange.from), 'yyyy-MM-dd');
      const toDate = format(new Date(dateRange.to), 'yyyy-MM-dd');
      
      console.log('Fetching dashboard stats with params:', { 
        fromDate, 
        toDate, 
        department: selectedDepartment,
        rawDateRange: dateRange
      });
      
      const queryParams = new URLSearchParams({
        from: fromDate,
        to: toDate,
        department: selectedDepartment || 'all'
      });
      
      const response = await fetch(`/api/dashboard/stats?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Format trend data dates
      const formattedData = {
        ...data,
        trendData: data.trendData.map(item => ({
          ...item,
          date: format(new Date(item.date), 'MMM dd'),
          present: Number(item.present) || 0,
          absent: Number(item.absent) || 0
        }))
      };

      setStats(formattedData);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error("Error", {
        description: error.message || "An unexpected error occurred while fetching dashboard data"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, selectedDepartment]);

  // Calculate low attendance departments
  const lowAttendanceDepts = stats.departmentStats
    .filter(dept => {
      const present = dept.present || 0;
      const total = dept.total || 1;
      return total > 0 && (present / total) < 0.8;
    })
    .map(dept => ({
      ...dept,
      attendanceRate: ((dept.present || 0) / (dept.total || 1) * 100).toFixed(1)
    }));

  console.log('Low attendance departments:', lowAttendanceDepts);

  useEffect(() => {
    console.log('Current dashboard stats:', {
      totalStudents: stats.totalStudents,
      todayStats: stats.todayStats,
      departmentStats: stats.departmentStats,
      trendData: stats.trendData
    });
  }, [stats]);

  const handleQuickAction = (action) => {
    switch (action) {
      case 'mark-attendance':
        router.push('/dashboard/attendance');
        break;
      case 'late-arrivals':
        router.push('/dashboard/attendance?filter=late');
        break;
      case 'analytics':
        router.push('/dashboard/analytics');
        break;
      case 'export':
        // Handle report export
        const reportData = {
          dateRange: {
            from: format(dateRange.from, 'yyyy-MM-dd'),
            to: format(dateRange.to, 'yyyy-MM-dd')
          },
          stats: {
            totalStudents: stats.totalStudents,
            attendance: stats.todayStats,
            departmentStats: stats.departmentStats
          }
        };
        
        // Create CSV content
        const csvContent = `Date Range: ${reportData.dateRange.from} to ${reportData.dateRange.to}\n\n` +
          `Total Students: ${reportData.stats.totalStudents}\n` +
          `Present: ${reportData.stats.attendance.present}\n` +
          `Late: ${reportData.stats.attendance.late}\n` +
          `Absent: ${reportData.stats.totalStudents - reportData.stats.attendance.present}\n\n` +
          `Department Breakdown:\n` +
          `Department,Category,Total Students,Present,Attendance Rate\n` +
          stats.departmentStats.map(dept => 
            `${dept.department},${dept.category},${dept.total},${dept.present},${dept.attendance_rate}%`
          ).join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success("Report downloaded successfully");
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span>Notifications</span>
                {lowAttendanceDepts.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                    {lowAttendanceDepts.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Recent updates and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lowAttendanceDepts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No alerts at this time</p>
                  ) : (
                    lowAttendanceDepts.map((dept, index) => (
                      <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                        <div className="p-2 rounded-full bg-red-100">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium">Low Attendance Alert</p>
                          <p className="text-sm text-muted-foreground">
                            {dept.department} has {dept.attendanceRate}% attendance today
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Just now</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
          <Button asChild>
            <Link href="/dashboard/students?action=add">
              <Users className="mr-2 h-4 w-4" />
              Add Student
            </Link>
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/attendance/calendar')}>
            <CalendarDays className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-10" />
        </div>
        <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {stats.departmentStats.map((dept, index) => (
              <SelectItem key={index} value={dept.department}>{dept.department}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <DateRangePicker 
            value={tempDateRange}
            onChange={handleDateRangeChange}
          />
          <Button onClick={applyDateRange} variant="secondary">
            Apply Date Range
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold">{stats.todayStats.present}</p>
                <p className="text-xs text-green-500 mt-1">
                  {((stats.todayStats.present / stats.todayStats.total) * 100).toFixed(1)}% attendance rate
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Late Arrivals</p>
                <p className="text-2xl font-bold">{stats.todayStats.late}</p>
                <p className="text-xs text-yellow-500 mt-1">Needs attention</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold">
                  {stats.todayStats.total - stats.todayStats.present}
                </p>
                <p className="text-xs text-red-500 mt-1">Requires attention</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-8">
        {/* Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>
              {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {stats.trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="present" 
                      stroke="#22c55e" 
                      name="Present"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="absent" 
                      stroke="#ef4444" 
                      name="Absent"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No attendance data available for the selected date range
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Department Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
            <CardDescription>
              {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.departmentStats.map((dept, index) => {
                const attendanceRate = dept.attendance_rate;
                const bgColorClass = attendanceRate >= 80 ? 'bg-green-100' : 
                                   attendanceRate >= 60 ? 'bg-yellow-100' : 
                                   'bg-red-100';
                const textColorClass = attendanceRate >= 80 ? 'text-green-600' : 
                                     attendanceRate >= 60 ? 'text-yellow-600' : 
                                     'text-red-600';
                
                return (
                  <div key={index} className={`p-4 rounded-lg ${bgColorClass}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{dept.department}</h3>
                        <p className="text-sm text-gray-500">{dept.category}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${textColorClass}`}>
                          {attendanceRate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-500">
                          {dept.present} / {dept.total * dept.total_days} attendance days
                        </p>
                        <p className="text-xs text-gray-400">
                          {dept.total} students over {dept.total_days} days
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('mark-attendance')}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('late-arrivals')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Late Arrivals
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('analytics')}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('export')}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 