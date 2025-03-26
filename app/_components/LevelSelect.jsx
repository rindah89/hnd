"use client"
import React, { useEffect, useState } from 'react';
import GlobalApi from '../_services/GlobalApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

function LevelSelect({ selectedLevel }) {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllLevels();
    }, []);

    const getAllLevels = () => {
        setLoading(true);
        GlobalApi.GetAllLevels()
            .then(resp => {
                if (resp.data && resp.data.length > 0) {
                    setLevels(resp.data);
                    // Automatically select the first level when levels are loaded
                    if (selectedLevel && typeof selectedLevel === 'function') {
                        selectedLevel(resp.data[0].level);
                    }
                } else {
                    // Set empty array if no data
                    setLevels([]);
                    toast.warning("No levels found in the system");
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching levels:", error);
                setLevels([]);
                toast.error("Failed to load levels information");
                setLoading(false);
            });
    };

    const handleLevelChange = (value) => {
        if (selectedLevel && typeof selectedLevel === 'function') {
            selectedLevel(value);
        }
    };

    return (
        <div className="w-full">
            <Select 
                onValueChange={handleLevelChange} 
                disabled={loading || levels.length === 0}
                defaultValue={levels[0]?.level}
            >
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder={loading ? "Loading..." : "Select level"} />
                </SelectTrigger>
                <SelectContent>
                    {levels.length > 0 ? (
                        levels.map((item, index) => (
                            <SelectItem key={index} value={item.level}>
                                {item.level}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="no-levels" disabled>
                            No levels available
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}

export default LevelSelect; 