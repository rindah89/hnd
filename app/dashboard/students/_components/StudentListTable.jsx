import React, { useEffect, useState, useRef, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { Building, BookOpen, Eye, FileDigit, FileEdit, Filter, MapPin, Phone, RefreshCw, Search, Tag, Trash, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import GlobalApi from '@/app/_services/GlobalApi';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const pagination = true;
const paginationPageSize = 10;
const paginationPageSizeSelector = [10, 25, 50, 100];

function StudentListTable({ studentList, refreshData }) {
    const router = useRouter();
    const gridRef = useRef(null);
    const [rowData, setRowData] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [filterOptions, setFilterOptions] = useState({
        level: "",
        department: "",
        campus: ""
    });
    const [departments, setDepartments] = useState([]);
    const [campuses, setCampuses] = useState([]);
    const [levels, setLevels] = useState([]);

    // Load filter options
    useEffect(() => {
        // Load departments, campuses, and levels for filtering
        fetchFilterOptions();
    }, []);

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

            // Extract unique levels from student data
            if (studentList && studentList.length > 0) {
                const uniqueLevels = [...new Set(studentList.map(student => student.level))];
                setLevels(uniqueLevels);
            }
        } catch (error) {
            console.error("Error fetching filter options:", error);
        }
    };

    // Custom cell renderers for better UI
    const MatriculeRenderer = (props) => {
        return (
            <div className="flex items-center gap-2">
                <FileDigit size={18} className="text-indigo-500 flex-shrink-0" />
                <span className="font-medium">{props.value}</span>
            </div>
        );
    };

    const NameRenderer = (props) => {
        return (
            <div className="flex items-center gap-2">
                <User size={18} className="text-gray-500 flex-shrink-0" />
                <span>{props.value}</span>
            </div>
        );
    };

    const LevelRenderer = (props) => {
        return (
            <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-blue-500 flex-shrink-0" />
                <span className="bg-blue-100 text-blue-700 py-1 px-2 rounded-full text-xs font-medium">
                    {props.value}
                </span>
            </div>
        );
    };

    const DepartmentRenderer = (props) => {
        return (
            <div className="flex items-center gap-2">
                <Building size={18} className="text-purple-500 flex-shrink-0" />
                <div className="flex flex-col justify-center">
                    <span className="font-medium leading-tight">{props.value || 'N/A'}</span>
                    {props.data?.departmentCategory && (
                        <p className="text-xs text-gray-500 leading-tight">{props.data.departmentCategory}</p>
                    )}
                </div>
            </div>
        );
    };

    const CampusRenderer = (props) => {
        return (
            <div className="flex items-center gap-2">
                <MapPin size={18} className="text-red-500 flex-shrink-0" />
                <span>{props.value || 'N/A'}</span>
            </div>
        );
    };

    const ContactRenderer = (props) => {
        return (
            <div className="flex items-center gap-2">
                <Phone size={18} className="text-green-500 flex-shrink-0" />
                <span>{props.value || 'N/A'}</span>
            </div>
        );
    };

    const AddressRenderer = (props) => {
        if (!props.value) return (
            <div className="flex items-center gap-2">
                <MapPin size={18} className="text-orange-500 flex-shrink-0" />
                <span className="text-gray-400">No address</span>
            </div>
        );
        return (
            <div className="flex items-center gap-2 truncate max-w-[200px]" title={props.value}>
                <MapPin size={18} className="text-orange-500 flex-shrink-0" />
                <span className="truncate">{props.value}</span>
            </div>
        );
    };

    const viewStudentDetails = (id) => {
        router.push(`/dashboard/students/${id}`);
    }

    const editStudentRecord = (id) => {
        router.push(`/dashboard/students/edit/${id}`);
    }

    const ActionButtons = (props) => {
        return (
            <div className="flex items-center gap-2">
                <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8 flex items-center justify-center" 
                    title="View Details"
                    onClick={() => viewStudentDetails(props?.data?.id)}
                >
                    <Eye size={16} />
                </Button>
                <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8 flex items-center justify-center" 
                    title="Edit Student"
                    onClick={() => editStudentRecord(props?.data?.id)}
                >
                    <FileEdit size={16} />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger>
                        <Button size="icon" variant="destructive" className="h-8 w-8 flex items-center justify-center" title="Delete Student">
                            <Trash size={16} />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the student record
                                and remove all related attendance data from the system.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={() => DeleteRecord(props?.data?.id)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        )
    }

    const [colDefs, setColDefs] = useState([
        { 
            headerName: 'Matricule',
            field: "matricule", 
            filter: true, 
            cellRenderer: MatriculeRenderer,
            minWidth: 130,
            flex: 1,
        },
        { 
            headerName: 'Name',
            field: "name", 
            filter: true, 
            cellRenderer: NameRenderer,
            minWidth: 180,
            flex: 2,
        },
        { 
            headerName: 'Level',
            field: "level", 
            filter: true,
            cellRenderer: LevelRenderer,
            minWidth: 120,
            flex: 1,
        },
        { 
            headerName: 'Department',
            field: "departmentName", 
            filter: true,
            cellRenderer: DepartmentRenderer,
            minWidth: 180,
            flex: 2,
        },
        { 
            headerName: 'Campus',
            field: "campusName", 
            filter: true, 
            cellRenderer: CampusRenderer,
            minWidth: 150,
            flex: 1.5,
        },
        { 
            headerName: 'Contact',
            field: "contact", 
            filter: true,
            cellRenderer: ContactRenderer,
            minWidth: 150,
            flex: 1.5,
        },
        { 
            headerName: 'Address',
            field: "address", 
            filter: true,
            cellRenderer: AddressRenderer,
            minWidth: 200,
            flex: 2,
        },
        { 
            headerName: 'Actions',
            field: 'action', 
            cellRenderer: ActionButtons,
            sortable: false,
            filter: false,
            minWidth: 150,
            width: 150,
            cellClass: "ag-center-cell",
        }
    ]);

    useEffect(() => {
        if (studentList && studentList.length > 0) {
            // Extract unique levels for filtering
            const uniqueLevels = [...new Set(studentList.map(student => student.level))];
            setLevels(uniqueLevels);
            
            // Enhance student list with department and campus details
            const enhancedStudentList = studentList.map(student => {
                return {
                    ...student,
                    departmentName: student.departmentName || 'Department ' + (student.departmentId || ''),
                    campusName: student.campusName || 'Campus ' + (student.campusId || '')
                };
            });
            
            // Apply filters if any are active
            let filteredData = [...enhancedStudentList];
            
            if (filterOptions.level) {
                filteredData = filteredData.filter(student => student.level === filterOptions.level);
            }
            
            if (filterOptions.department) {
                filteredData = filteredData.filter(student => 
                    student.departmentId.toString() === filterOptions.department);
            }
            
            if (filterOptions.campus) {
                filteredData = filteredData.filter(student => 
                    student.campusId.toString() === filterOptions.campus);
            }
            
            setRowData(filteredData);
        } else {
            setRowData([]);
        }
    }, [studentList, filterOptions]);

    const DeleteRecord = (id) => {
        setLoading(true);
        GlobalApi.DeleteStudentRecord(id).then(resp => {
            if (resp) {
                toast.success('Student record deleted successfully!');
                refreshData();
            }
        }).catch(error => {
            console.error("Error deleting student:", error);
            toast.error('Failed to delete student. Please try again.');
        }).finally(() => {
            setLoading(false);
        });
    }

    const handleRefresh = useCallback(() => {
        setLoading(true);
        refreshData();
        setTimeout(() => {
            setLoading(false);
            toast.success('Data refreshed successfully');
        }, 1000);
    }, [refreshData]);

    const handleFilterChange = (field, value) => {
        setFilterOptions(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setFilterOptions({
            level: "",
            department: "",
            campus: ""
        });
        toast.success('Filters cleared');
    };

    const exportToCSV = useCallback(() => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.exportDataAsCsv({
                fileName: 'students_export.csv'
            });
            toast.success('Data exported to CSV');
        }
    }, []);

    return (
        <div className='my-7'>
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className='p-2 rounded-lg border shadow-sm flex gap-2 w-full max-w-sm'>
                    <Search className="text-gray-400" />
                    <input 
                        type='text' 
                        placeholder='Search students...'
                        className='outline-none w-full'
                        onChange={(event) => setSearchInput(event.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Filter size={16} />
                                Filter
                                {(filterOptions.level || filterOptions.department || filterOptions.campus) && (
                                    <span className="ml-1 bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">
                                        Active
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4">
                            <div className="space-y-4">
                                <h4 className="font-medium">Filter Students</h4>
                                
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-500">Level</label>
                                    <select 
                                        className="w-full p-2 border rounded-md"
                                        value={filterOptions.level}
                                        onChange={(e) => handleFilterChange('level', e.target.value)}
                                    >
                                        <option value="">All Levels</option>
                                        {levels.map((level, index) => (
                                            <option key={index} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-500">Department</label>
                                    <select 
                                        className="w-full p-2 border rounded-md"
                                        value={filterOptions.department}
                                        onChange={(e) => handleFilterChange('department', e.target.value)}
                                    >
                                        <option value="">All Departments</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name} ({dept.category})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-500">Campus</label>
                                    <select 
                                        className="w-full p-2 border rounded-md"
                                        value={filterOptions.campus}
                                        onChange={(e) => handleFilterChange('campus', e.target.value)}
                                    >
                                        <option value="">All Campuses</option>
                                        {campuses.map((campus) => (
                                            <option key={campus.id} value={campus.id}>
                                                {campus.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="flex justify-between pt-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        Clear
                                    </Button>
                                    <Button 
                                        size="sm"
                                        onClick={() => toast.success('Filters applied')}
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    
                    <Button 
                        variant="outline" 
                        className="flex items-center gap-2" 
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        {loading ? (
                            <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <RefreshCw size={16} />
                        )}
                        Refresh
                    </Button>
                    
                    <Button 
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={exportToCSV}
                    >
                        Export CSV
                    </Button>
                </div>
            </div>
            
            <div
                className="ag-theme-quartz rounded-lg border shadow-sm" // applying the grid theme with better styling
                style={{ height: 600 }} // making the grid taller for better viewing
            >
                <style jsx global>{`
                    .ag-center-cell {
                        display: flex;
                        justify-content: center;
                    }
                    .ag-cell {
                        display: flex;
                        align-items: center;
                    }
                    .ag-row {
                        height: auto !important;
                        min-height: 48px;
                    }
                `}</style>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={colDefs}
                    quickFilterText={searchInput}
                    pagination={pagination}
                    paginationPageSize={paginationPageSize}
                    paginationPageSizeSelector={paginationPageSizeSelector}
                    defaultColDef={{
                        sortable: true,
                        resizable: true
                    }}
                    animateRows={true}
                    domLayout='autoHeight'
                    rowHeight={48}
                />
            </div>
            {rowData.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <User size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No students found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {filterOptions.level || filterOptions.department || filterOptions.campus 
                            ? 'Try changing your filters or adding a new student.' 
                            : 'Add your first student to get started.'}
                    </p>
                </div>
            )}
        </div>
    )
}

export default StudentListTable