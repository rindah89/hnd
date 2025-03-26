import React, { useEffect, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import moment from 'moment';
import GlobalApi from '@/app/_services/GlobalApi';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import StudentIdRenderer from './StudentIdRenderer';
import StudentNameRenderer from './StudentNameRenderer';
import LevelCampusRenderer from './LevelCampusRenderer';
import DateHeaderRenderer from './DateHeaderRenderer';

const pagination = true;
const paginationPageSize = 15;
const paginationPageSizeSelector = [15, 25, 50, 100];

function AttendanceGrid({ attadanceList, selectedMonth, selectedYear, onAttendanceChange, isLoading }) {
    const [rowData, setRowData] = useState([]);
    const [colDefs, setColDefs] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridReady, setGridReady] = useState(false);
    const [error, setError] = useState(null);

    // Calculate days in selected month
    const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
    const numberOfDays = selectedMonth && selectedYear ? 
        daysInMonth(selectedYear, selectedMonth) : 0;
    const daysArray = Array.from({ length: numberOfDays }, (_, i) => i + 1);

    // Add selectedYear to component scope
    useEffect(() => {
        // Log selected month and year for debugging
        console.log("Selected month and year:", selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear]);

    // Handle grid ready event
    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridReady(true);
        
        // Auto-size columns after data loads
        if (params.api && attadanceList) {
            setTimeout(() => {
                params.api.sizeColumnsToFit();
            }, 100);
        }
    };

    // Process attendance data when it changes
    useEffect(() => {
        try {
            setError(null);
            
            // Base column definitions
            setColDefs([
                { 
                    headerName: 'ID',
                    field: 'studentId',
                    filter: true,
                    cellRenderer: StudentIdRenderer,
                    width: 120,
                    minWidth: 100,
                    sortable: true,
                    pinned: 'left',
                },
                { 
                    headerName: 'Student Name',
                    field: 'name',
                    filter: true,
                    cellRenderer: StudentNameRenderer,
                    width: 220,
                    minWidth: 180,
                    sortable: true,
                    pinned: 'left',
                },
                { 
                    headerName: 'Level',
                    field: 'level',
                    filter: true,
                    cellRenderer: LevelCampusRenderer,
                    width: 150,
                    minWidth: 120,
                    sortable: true,
                }
            ]);

            if (attadanceList && attadanceList.length > 0) {
                console.log("Processing attendance data:", attadanceList);
                
                // First, extract unique students
                const uniqueStudents = new Map();
                
                attadanceList.forEach(record => {
                    // If this is the first time we've seen this student or we have no entry yet, add them
                    if (!uniqueStudents.has(record.studentId)) {
                        uniqueStudents.set(record.studentId, {
                            studentId: record.studentId,
                            name: record.name,
                            level: record.level,
                            matricule: record.matricule,
                            departmentId: record.departmentId,
                            departmentName: record.departmentName,
                            campusId: record.campusId,
                            campusName: record.campusName,
                        });
                    }
                });
                
                // Convert the Map values to an array
                const processedData = Array.from(uniqueStudents.values());
                
                // Add day columns to the column definitions
                const dayColumns = daysArray.map(day => ({
                    headerName: day.toString(),
                    headerComponent: DateHeaderRenderer,
                    field: day.toString(),
                    width: 80,
                    minWidth: 60,
                    maxWidth: 100,
                    editable: true,
                    cellRenderer: AttendanceCellRenderer,
                    cellClass: 'ag-cell-centered',
                    // Add a comparator for sorting
                    comparator: (valueA, valueB) => {
                        // True (present) comes before false (absent)
                        if (valueA === valueB) return 0;
                        if (valueA === true) return -1;
                        return 1;
                    }
                }));
                
                setColDefs(prevCols => [...prevCols, ...dayColumns]);
                
                // For each student, process their attendance for each day
                processedData.forEach(student => {
                    daysArray.forEach(day => {
                        // Find attendance record for this student and day
                        const dayStr = day.toString();
                        
                        // First find any record for this student on this day
                        const attendanceRecord = attadanceList.find(record => 
                            record.studentId === student.studentId && 
                            record.day === dayStr
                        );
                        
                        // Set the value for this day based on presence
                        // If record exists and present is true, mark as present
                        // If no record exists, leave it undefined (empty cell)
                        if (attendanceRecord) {
                            student[dayStr] = !!attendanceRecord.present;  // Convert to boolean
                        }
                    });
                });
                
                setRowData(processedData);
                console.log("Processed data:", processedData);
            } else if (attadanceList && attadanceList.length === 0) {
                setRowData([]);
            }
        } catch (err) {
            console.error("Error processing attendance data:", err);
            setError("Failed to process attendance data. Please try again.");
        }
    }, [attadanceList, selectedMonth, selectedYear]);

    // Check if student is present on a specific day
    const isPresent = (studentId, day) => {
        if (!attadanceList) return null;
        
        // Convert day to string for string comparison if needed
        const dayStr = day.toString();
        
        // Find an attendance record for this student on this day
        const record = attadanceList.find(item => {
            return (
                // Match both studentId and day
                item.studentId === studentId && 
                item.day === dayStr &&
                // Only consider records with present field
                item.present === true
            );
        });
        
        console.log(`Student ${studentId}, Day ${day}, Present: ${!!record}`);
        
        // Return true if record found, false otherwise
        return record ? true : false;
    };

    // Get unique student records from attendance data
    const getUniqueRecord = () => {
        if (!attadanceList) return [];
        
        const uniqueRecord = [];
        const existingUsers = new Set();

        attadanceList.forEach(record => {
            if (!existingUsers.has(record.studentId)) {
                existingUsers.add(record.studentId);
                uniqueRecord.push(record);
            }
        });

        return uniqueRecord;
    };

    // Mark student attendance when cell value changes
    const onMarkAttendance = (day, studentId, presentStatus) => {
        // Use selectedMonth and selectedYear from props
        const date = `${selectedMonth}/${selectedYear}`;
        setError(null);
        
        console.log(`Marking attendance: Student #${studentId}, Day ${day}, Date ${date}, Present: ${presentStatus}`);
        
        try {
            if (presentStatus) {
                // Mark student as present
                const data = {
                    day: day,
                    studentId: studentId,
                    present: true,  // Explicitly set to true
                    date: date
                };
                
                toast.loading("Marking attendance...");
                GlobalApi.MarkAttendance(data)
                    .then(resp => {
                        toast.dismiss();
                        toast.success(`Student #${studentId} marked as present on day ${day}`);
                        if (onAttendanceChange) onAttendanceChange(true);
                    })
                    .catch(err => {
                        toast.dismiss();
                        console.error("Error marking attendance:", err);
                        toast.error("Failed to mark student as present");
                        if (onAttendanceChange) onAttendanceChange(false);
                    });
            } else {
                // Mark student as absent
                toast.loading("Updating attendance...");
                GlobalApi.DeleteAttendance(studentId, day, date)
                    .then(resp => {
                        toast.dismiss();
                        toast.success(`Student #${studentId} marked as absent on day ${day}`);
                        if (onAttendanceChange) onAttendanceChange(true);
                    })
                    .catch(err => {
                        toast.dismiss();
                        console.error("Error marking absence:", err);
                        toast.error("Failed to mark student as absent");
                        if (onAttendanceChange) onAttendanceChange(false);
                    });
            }
        } catch (err) {
            toast.dismiss();
            console.error("Error in attendance update:", err);
            toast.error("An error occurred while updating attendance");
            if (onAttendanceChange) onAttendanceChange(false);
        }
    };

    // Custom cell renderer for attendance cells - moved inside the component to access props
    const AttendanceCellRenderer = (props) => {
        const { value, data, colDef, rowIndex, api, column } = props;
        const { day } = colDef.field ? { day: colDef.field } : { day: null };
        const studentId = data?.studentId;
        
        const [isPresent, setIsPresent] = useState(value);
        const [isLoading, setIsLoading] = useState(false);
        
        const handleClick = async () => {
            if (!studentId || !day) return;
            
            setIsLoading(true);
            try {
                // Toggle attendance status
                const newValue = !isPresent;
                
                // Format the date string for API calls (month/year)
                const formattedDate = `${selectedMonth}/${selectedYear}`;
                
                if (newValue === true) {
                    // Mark student as present
                    console.log(`Marking student ${studentId} as present for day ${day}`);
                    const resp = await GlobalApi.MarkAttendance({
                        studentId,
                        day,
                        date: formattedDate,
                        present: true
                    });
                    
                    if (resp.data && resp.data.success !== false) {
                        toast.success("Marked Present", {
                            description: `${data.name} has been marked present for day ${day}`
                        });
                        setIsPresent(true);
                    } else {
                        toast.error("Error", {
                            description: "Failed to mark attendance"
                        });
                    }
                } else {
                    // Mark student as absent
                    console.log(`Marking student ${studentId} as absent for day ${day}`);
                    const resp = await GlobalApi.MarkAttendance({
                        studentId,
                        day,
                        date: formattedDate,
                        present: false
                    });
                    
                    if (resp.data && resp.data.success !== false) {
                        toast.success("Marked Absent", {
                            description: `${data.name} has been marked absent for day ${day}`
                        });
                        setIsPresent(false);
                    } else {
                        toast.error("Error", {
                            description: "Failed to mark attendance"
                        });
                    }
                }
            } catch (error) {
                console.error("Error toggling attendance:", error);
                toast.error("Error", {
                    description: "An error occurred while marking attendance"
                });
            } finally {
                setIsLoading(false);
            }
        };
        
        // Set appropriate background color based on attendance state
        let buttonClass = "w-full h-full flex items-center justify-center transition-colors";
        let title = "";
        
        if (isLoading) {
            buttonClass += " bg-gray-200";
            title = "Loading...";
        } else if (isPresent === true) {
            buttonClass += " bg-green-100 hover:bg-green-200 text-green-700";
            title = "Present (click to mark as absent)";
        } else if (isPresent === false) {
            buttonClass += " bg-red-100 hover:bg-red-200 text-red-700";
            title = "Absent (click to mark as present)";
        } else {
            buttonClass += " bg-gray-50 hover:bg-gray-100 text-gray-500";
            title = "No record (click to mark as present)";
        }
        
        return (
            <button 
                className={buttonClass}
                onClick={handleClick}
                disabled={isLoading}
                title={title}
            >
                {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
                ) : isPresent === true ? (
                    <div className="flex items-center justify-center">
                        <Check className="h-5 w-5 text-green-600" />
                    </div>
                ) : isPresent === false ? (
                    <div className="flex items-center justify-center">
                        <X className="h-5 w-5 text-red-600" />
                    </div>
                ) : (
                    <div className="h-5 w-5"></div>
                )}
            </button>
        );
    };

    return (
        <div>
            {error && (
                <div className="bg-red-50 text-red-500 p-3 mb-4 rounded-md">
                    {error}
                </div>
            )}
            
            <div className="p-3 bg-white rounded-lg shadow-sm mb-4">
                <h3 className="text-sm font-semibold mb-2">Attendance Legend:</h3>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-100 text-green-700 flex items-center justify-center rounded mr-2">
                            <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm">Present</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-red-100 text-red-700 flex items-center justify-center rounded mr-2">
                            <X className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-sm">Absent</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-50 text-gray-500 flex items-center justify-center rounded mr-2">
                            <div className="h-4 w-4"></div>
                        </div>
                        <span className="text-sm">No Record</span>
                    </div>
                    <div className="ml-auto text-xs text-gray-500">
                        Click on a cell to toggle attendance status
                    </div>
                </div>
            </div>
            
            <div
                className="ag-theme-quartz rounded-lg border shadow-sm"
                style={{ height: 600, width: '100%' }}
            >
                <style jsx global>{`
                    .ag-cell-centered {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .ag-header-cell-text {
                        width: 100%;
                    }
                    .ag-theme-quartz .ag-cell {
                        font-size: 14px;
                    }
                    .ag-theme-quartz .ag-row-odd {
                        background-color: #f9fafb;
                    }
                `}</style>
                
                <AgGridReact
                    rowData={rowData}
                    columnDefs={colDefs}
                    onGridReady={onGridReady}
                    onCellValueChanged={(e) => onMarkAttendance(e.colDef.field, e.data.studentId, e.newValue)}
                    pagination={pagination}
                    paginationPageSize={paginationPageSize}
                    paginationPageSizeSelector={paginationPageSizeSelector}
                    animateRows={true}
                    domLayout="autoHeight"
                    rowHeight={48}
                    defaultColDef={{
                        resizable: true,
                    }}
                />
            </div>
            
            {rowData.length === 0 && !error && (
                <div className="text-center py-10 text-gray-500">
                    {attadanceList ? 'No attendance records found for this period' : 'Select month and grade to view attendance'}
                </div>
            )}
        </div>
    );
}

export default AttendanceGrid;