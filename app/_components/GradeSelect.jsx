"use client"
import React, { useEffect, useState } from 'react'
import GlobalApi from '../_services/GlobalApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

function GradeSelect({ selectedGrade }) {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllGradesList();
    }, []);

    const getAllGradesList = () => {
        setLoading(true);
        GlobalApi.GetAllGrades()
            .then(resp => {
                setGrades(resp.data);
                // Automatically select the first grade when grades are loaded
                if (resp.data.length > 0 && selectedGrade) {
                    selectedGrade(resp.data[0].grade || resp.data[0].level);
                }
            })
            .catch(error => {
                console.error("Error fetching grades:", error);
                setGrades([]);
                toast.warning("No grades found in the system");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleGradeChange = (value) => {
        if (selectedGrade && typeof selectedGrade === 'function') {
            selectedGrade(value);
        }
    };

    return (
        <div className="w-full">
            <Select 
                onValueChange={handleGradeChange} 
                disabled={loading || grades.length === 0}
                defaultValue={grades[0]?.grade}
            >
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder={loading ? "Loading..." : "Select grade"} />
                </SelectTrigger>
                <SelectContent>
                    {grades.length > 0 ? (
                        grades.map((item, index) => (
                            <SelectItem key={index} value={item.grade}>
                                {item.grade}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="no-grades" disabled>
                            No grades available
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}

export default GradeSelect;