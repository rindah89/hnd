"use client"
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

function DepartmentSelect({ selectedDepartment }) {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/departments');
            if (!response.ok) {
                throw new Error('Failed to fetch departments');
            }
            
            const data = await response.json();
            console.log("Departments loaded:", data.length);
            
            if (data && data.length > 0) {
                setDepartments(data);
                // Automatically select "All Departments" option
                if (selectedDepartment && typeof selectedDepartment === 'function') {
                    selectedDepartment('all');
                }
            } else {
                setDepartments([]);
                toast.warning("No departments found in the system");
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
            setDepartments([]);
            toast.error("Failed to load departments");
        } finally {
            setLoading(false);
        }
    };

    const handleDepartmentChange = (value) => {
        if (selectedDepartment && typeof selectedDepartment === 'function') {
            // Convert to a number if it's not 'all'
            const departmentId = value === 'all' ? 'all' : Number(value);
            console.log("Selected department:", departmentId);
            selectedDepartment(departmentId);
        }
    };

    return (
        <div className="w-full">
            <Select 
                onValueChange={handleDepartmentChange} 
                disabled={loading}
                defaultValue="all"
            >
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder={loading ? "Loading..." : "Select department"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.length > 0 ? (
                        departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                {dept.name} ({dept.category})
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="no-departments" disabled>
                            No departments available
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}

export default DepartmentSelect; 