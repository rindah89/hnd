const { default: axios } = require("axios");

// Define API endpoints
const API_ENDPOINTS = {
    grade: '/api/grade',
    student: '/api/student',
    attendance: '/api/attendance',
    dashboard: '/api/dashboard',
    levels: '/api/levels'
};

const GetAllGrades = () => axios.get(API_ENDPOINTS.grade);
const CreateNewStudent = (data) => axios.post(API_ENDPOINTS.student, data);
const GetAllStudents = () => axios.get(API_ENDPOINTS.student);
const GetStudentById = (id) => axios.get(`${API_ENDPOINTS.student}/${id}`);
const UpdateStudent = (id, data) => axios.put(`${API_ENDPOINTS.student}/${id}`, data);
const DeleteStudentRecord = (id) => axios.delete(`${API_ENDPOINTS.student}?id=${id}`);
const GetAttendanceList = (grade, month) => axios.get(`${API_ENDPOINTS.attendance}?grade=${grade}&month=${month}`);

const MarkAttendance = (data) => {
    console.log("Marking attendance with data:", data);
    
    // Extract month and year from date (MM/YYYY)
    const month = parseInt(data.date.split('/')[0]);
    const year = parseInt(data.date.split('/')[1]);
    
    // Process data for database compatibility
    const processedData = {
        studentId: parseInt(data.studentId),
        day: data.day,
        month: month,
        year: year,
        present: Boolean(data.present)
    };
    
    console.log("Processed attendance data:", processedData);
    return axios.post(API_ENDPOINTS.attendance, processedData);
};

const DeleteAttendance = (studentId, day, date) => {
    console.log("Deleting attendance:", { studentId, day, date });
    // We're using date in MM/YYYY format which matches what the API expects
    return axios.delete(`${API_ENDPOINTS.attendance}?studentId=${studentId}&day=${day}&date=${date}`);
};

const TotalPresentCountByDay = (date, grade) => axios.get(`${API_ENDPOINTS.dashboard}?date=${date}&grade=${grade}`);
const GetAttendanceByGrade = (grade, month) => axios.get(`${API_ENDPOINTS.attendance}?grade=${grade}&month=${month}`);
const GetDashboardData = () => axios.get(API_ENDPOINTS.dashboard);

// Attendance endpoints with filters
const GetAttendanceByFilters = (params) => {
    let url = `${API_ENDPOINTS.attendance}?`;
    
    // Add level filter
    if (params.level) {
        url += `level=${encodeURIComponent(params.level)}&`;
    }
    
    // Add month filter
    if (params.month) {
        url += `month=${encodeURIComponent(params.month)}&`;
    }
    
    // Add year filter
    if (params.year) {
        url += `year=${encodeURIComponent(params.year)}&`;
    }
    
    // Add departmentId if specified and not 'all'
    if (params.departmentId && params.departmentId !== 'all') {
        url += `departmentId=${params.departmentId}&`;
    }
    
    // Add campusId if specified and not 'all'
    if (params.campusId && params.campusId !== 'all') {
        url += `campusId=${params.campusId}&`;
    }
    
    // Add student name filter if specified
    if (params.studentName) {
        url += `studentName=${encodeURIComponent(params.studentName)}&`;
    }
    
    // Remove trailing '&' if present
    url = url.endsWith('&') ? url.slice(0, -1) : url;
    
    console.log("Attendance API URL:", url);
    return axios.get(url)
        .then(response => {
            // Ensure we're handling the response structure correctly
            if (response && response.data) {
                return response.data;
            }
            return { success: false, message: "Invalid response format" };
        })
        .catch(error => {
            console.error("Error fetching attendance:", error);
            return { success: false, message: error.message || "An error occurred" };
        });
};

// Levels - using dedicated endpoint
const GetAllLevels = () => {
    // Return unique levels from the levels table
    return axios.get(API_ENDPOINTS.levels);
};

const GlobalApi = {
    GetAllGrades,
    GetAllStudents,
    GetStudentById,
    CreateNewStudent,
    UpdateStudent,
    DeleteStudentRecord,
    GetAttendanceList,
    MarkAttendance,
    DeleteAttendance,
    TotalPresentCountByDay,
    GetAttendanceByGrade,
    GetDashboardData,
    GetAttendanceByFilters,
    GetAllLevels
};

export default GlobalApi;