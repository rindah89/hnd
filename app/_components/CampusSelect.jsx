"use client"
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

function CampusSelect({ selectedCampus }) {
    const [campuses, setCampuses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampuses();
    }, []);

    const fetchCampuses = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/campuses');
            if (!response.ok) {
                throw new Error('Failed to fetch campuses');
            }
            
            const data = await response.json();
            console.log("Campuses loaded:", data.length);
            
            if (data && data.length > 0) {
                setCampuses(data);
                // Automatically select "All Campuses" option
                if (selectedCampus && typeof selectedCampus === 'function') {
                    selectedCampus('all');
                }
            } else {
                setCampuses([]);
                toast.warning("No campuses found in the system");
            }
        } catch (error) {
            console.error("Error fetching campuses:", error);
            setCampuses([]);
            toast.error("Failed to load campuses");
        } finally {
            setLoading(false);
        }
    };

    const handleCampusChange = (value) => {
        if (selectedCampus && typeof selectedCampus === 'function') {
            // Convert to a number if it's not 'all'
            const campusId = value === 'all' ? 'all' : Number(value);
            console.log("Selected campus:", campusId);
            selectedCampus(campusId);
        }
    };

    return (
        <div className="w-full">
            <Select 
                onValueChange={handleCampusChange} 
                disabled={loading}
                defaultValue="all"
            >
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder={loading ? "Loading..." : "Select campus"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Campuses</SelectItem>
                    {campuses.length > 0 ? (
                        campuses.map((campus) => (
                            <SelectItem key={campus.id} value={campus.id.toString()}>
                                {campus.name}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="no-campuses" disabled>
                            No campuses available
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}

export default CampusSelect; 