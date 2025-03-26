'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import AttendanceFilter from './_components/AttendanceFilter'
import AttendanceGrid from './_components/AttendanceGrid'
import GlobalApi from '@/app/_services/GlobalApi'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

function Attendance() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [levels, setLevels] = useState([]);
  const currentDate = new Date();
  const router = useRouter();

  useEffect(() => {
    // Load initial data and filter options
    loadPageData();
  }, []);

  const loadPageData = async () => {
    setIsLoading(true);
    try {
      // Fetch filter options first
      await fetchFilterOptions();
      
      // Load initial attendance data
      await getAttendanceList({
        month: format(currentDate, 'M'),
        year: format(currentDate, 'yyyy')
      });
    } catch (error) {
      console.error("Error loading page data:", error);
      toast.error("Error", {
        description: "Failed to load page data. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all filter options - departments, campuses, and levels
  const fetchFilterOptions = async () => {
    try {
      // Fetch departments
      const deptResponse = await fetch('/api/departments');
      const deptData = await deptResponse.json();
      setDepartments(deptData);

      // Fetch campuses
      const campusResponse = await fetch('/api/campuses');
      const campusData = await campusResponse.json();
      setCampuses(campusData);

      // Fetch levels from the API
      const levelsResponse = await GlobalApi.GetAllLevels();
      console.log('Levels response:', levelsResponse.data);
      
      // Ensure we're handling level data correctly (it might be an array of objects with a level property)
      const formattedLevels = levelsResponse.data?.map(item => 
        typeof item === 'object' && item !== null ? item.level : item
      ) || [];
      
      setLevels(formattedLevels);
    } catch (error) {
      console.error("Error fetching filter options:", error);
      toast.error("Error", {
        description: "Failed to load filter options"
      });
    }
  };

  // Function to get attendance data based on filters
  const getAttendanceList = async (searchParams) => {
    try {
      setIsLoading(true);
      console.log('Getting attendance with params:', searchParams);
      
      const resp = await GlobalApi.GetAttendanceByFilters(searchParams);
      console.log('Attendance API response:', resp);
      
      if (resp.success) {
        setAttendanceList(resp.data || []);
      } else {
        toast.error("Error", {
          description: resp.message || "Failed to fetch attendance data"
        });
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (searchFilters) => {
    console.log('Handling search with filters:', searchFilters);
    setFilters(searchFilters);
    getAttendanceList(searchFilters);
  };

  // Handle reset button click
  const handleReset = () => {
    setFilters(null);
    // Reset to current month data
    getAttendanceList({
      month: format(currentDate, 'M'),
      year: format(currentDate, 'yyyy')
    });
  };

  return (
    <div className='p-5'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-[24px] font-bold'>Attendance</h2>
          <p className="text-gray-500 mt-1">Track and manage student attendance records</p>
        </div>
        <Button className='bg-blue-600 gap-2'>
          <Plus className='h-4 w-4' />
          <Link href="/dashboard/attendance/add">Add New</Link>
        </Button>
      </div>
      
      {/* Filter Section */}
      <div className='mt-7'>
        <AttendanceFilter 
          onSearch={handleSearch}
          onReset={handleReset}
          departments={departments}
          campuses={campuses}
          levels={levels}
        />
      </div>
      
      {/* Attendance Grid */}
      <div className='mt-7'>
        <AttendanceGrid 
          isLoading={isLoading}
          attadanceList={attendanceList}
          onAttendanceChange={(updatedList) => setAttendanceList(updatedList)}
          selectedMonth={filters?.month || format(currentDate, 'M')}
          selectedYear={filters?.year || format(currentDate, 'yyyy')}
        />
      </div>
    </div>
  )
}

export default Attendance 