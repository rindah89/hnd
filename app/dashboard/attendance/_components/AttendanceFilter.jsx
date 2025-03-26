'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

function AttendanceFilter({ onSearch, onReset, departments, campuses, levels }) {
  const [department, setDepartment] = useState('all');
  const [campus, setCampus] = useState('all');
  const [level, setLevel] = useState('all');
  const [date, setDate] = useState(new Date());
  const [studentName, setStudentName] = useState('');

  // Reset all form fields to their initial values
  const handleReset = () => {
    setDepartment('all');
    setCampus('all');
    setLevel('all');
    setDate(new Date());
    setStudentName('');
    
    // Call the onReset prop if it exists
    if (onReset) {
      onReset();
    }
  };

  // Handle search button click
  const handleSearch = () => {
    console.log('Search filters:', {
      department,
      campus,
      level,
      month: format(date, 'M'),
      year: format(date, 'yyyy'),
      studentName
    });
    
    if (onSearch) {
      onSearch({
        departmentId: department === 'all' ? null : parseInt(department),
        campusId: campus === 'all' ? null : parseInt(campus),
        level: level === 'all' ? null : level,
        month: format(date, 'M'),
        year: format(date, 'yyyy'),
        studentName: studentName || null
      });
    }
  };

  return (
    <div className='p-5 shadow-sm rounded-lg bg-white'>
      <h2 className='text-lg mb-3 font-bold'>Filter Attendance</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
        <div>
          <Label htmlFor="departmentSelect">Department</Label>
          <Select 
            value={department} 
            onValueChange={(value) => setDepartment(value)}
          >
            <SelectTrigger id="departmentSelect" className="w-full mt-1">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="campusSelect">Campus</Label>
          <Select 
            value={campus}
            onValueChange={(value) => setCampus(value)}
          >
            <SelectTrigger id="campusSelect" className="w-full mt-1">
              <SelectValue placeholder="Select Campus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campuses</SelectItem>
              {campuses?.map((campus) => (
                <SelectItem key={campus.id} value={campus.id.toString()}>
                  {campus.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="levelSelect">Level</Label>
          <Select 
            value={level} 
            onValueChange={(value) => setLevel(value)}
          >
            <SelectTrigger id="levelSelect" className="w-full mt-1">
              <SelectValue placeholder="Select Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels?.map((level, index) => (
                <SelectItem key={index} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Month</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "mt-1 w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "MMMM yyyy") : <span>Pick a month</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="studentNameInput">Student Name</Label>
          <Input 
            id="studentNameInput"
            type="text" 
            placeholder='Search by name' 
            className='mt-1 w-full'
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
        </div>
      </div>
      <div className='flex gap-3 mt-4 justify-end'>
        <Button onClick={handleReset} variant="outline">
          Reset
        </Button>
        <Button onClick={handleSearch} className='gap-2 bg-blue-600'>
          <Image src='/search.svg' width={16} height={16} alt='search' />
          Search
        </Button>
      </div>
    </div>
  )
}

export default AttendanceFilter 