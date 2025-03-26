"use client"
import React, { useEffect, useState, useCallback } from 'react'
import AddNewStudent from './_components/AddNewStudent'
import GlobalApi from '@/app/_services/GlobalApi'
import StudentListTable from './_components/StudentListTable';
import { Book, GraduationCap, Loader2, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';

function Student() {
  const [studentList, setStudentList] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const searchParams = useSearchParams();

  const [stats, setStats] = useState({
    totalStudents: 0,
    levelDistribution: {}
  });

  useEffect(() => {
    loadPageData();
    // Check if we should show the add dialog
    if (searchParams.get('action') === 'add') {
      setShowAddDialog(true);
    }
  }, [searchParams])

  const loadPageData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        GetAllStudents(),
        GetAllGrades()
      ]);
      setLoading(false);
    } catch (error) {
      console.error("Error loading page data:", error);
      setLoading(false);
    }
  }

  /**
   * Used to Get All Students
   */
  const GetAllStudents = useCallback(async () => {
    try {
      const resp = await GlobalApi.GetAllStudents();
      setStudentList(resp.data);
      
      // Calculate statistics
      const total = resp.data.length;
      
      // Get level distribution
      const levelDistribution = resp.data.reduce((acc, student) => {
        acc[student.level] = (acc[student.level] || 0) + 1;
        return acc;
      }, {});
      
      setStats({
        totalStudents: total,
        levelDistribution
      });
      
      return resp.data;
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  }, []);

  /**
   * Used to Get All Grades
   */
  const GetAllGrades = useCallback(async () => {
    try {
      const resp = await GlobalApi.GetAllGrades();
      setGrades(resp.data);
      return resp.data;
    } catch (error) {
      console.error("Error fetching grades:", error);
      return [];
    }
  }, []);

  // Memoized refresh data function to pass to child components
  const refreshData = useCallback(() => {
    return GetAllStudents();
  }, [GetAllStudents]);

  if (loading) {
    return (
      <div className="p-7 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 size={40} className="animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading student data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='p-7'>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className='font-bold text-2xl flex items-center gap-2'>
            <Users className="text-blue-600" />
            Students
          </h2>
          <p className="text-gray-500 mt-1">Manage all student records and information</p>
        </div>
        <AddNewStudent refreshData={refreshData} isOpen={showAddDialog} onOpenChange={setShowAddDialog} />
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <CardDescription>Total Students</CardDescription>
                <CardTitle className="text-3xl mt-2">{stats.totalStudents}</CardTitle>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <CardDescription>Total Levels</CardDescription>
                <CardTitle className="text-3xl mt-2">{grades.length}</CardTitle>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Book className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <CardDescription>Most Popular Level</CardDescription>
                <CardTitle className="text-3xl mt-2">
                  {Object.entries(stats.levelDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                </CardTitle>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Table */}
      <StudentListTable 
        studentList={studentList}
        refreshData={refreshData} 
      />
    </div>
  )
}

export default Student