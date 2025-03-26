"use client"
import React, { useEffect, useState } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button'
import { CalendarDays } from 'lucide-react'
import { addMonths } from 'date-fns';
import moment from 'moment/moment';
import { Calendar } from "@/components/ui/calendar"

function MonthSelection({ selectedMonth }) {
    const today = new Date();
    const [month, setMonth] = useState(today);
    const [isOpen, setIsOpen] = useState(false);

    // Initialize the selected month when component loads
    useEffect(() => {
        if (selectedMonth && typeof selectedMonth === 'function') {
            selectedMonth(today);
        }
    }, []);

    const handleMonthChange = (value) => {
        setMonth(value);
        setIsOpen(false);
        
        if (selectedMonth && typeof selectedMonth === 'function') {
            selectedMonth(value);
        }
    };

    return (
        <div className="w-full">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button 
                        variant="outline" 
                        className="w-full md:w-[180px] justify-start"
                    >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {moment(month).format('MMMM YYYY')}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={month}
                        onSelect={handleMonthChange}
                        month={month}
                        onMonthChange={setMonth}
                        initialFocus
                        disabled={(date) => date > today}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default MonthSelection;