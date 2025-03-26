export const APP_CONFIG = {
  name: 'Student Attendance Tracking',
  description: 'Track and manage student attendance efficiently',
  url: process.env.KINDE_SITE_URL,
  apiEndpoint: '/api',
} as const;

export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  settings: '/settings',
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    callback: '/api/auth/callback',
  },
} as const;

export const DATE_FORMATS = {
  display: 'MMMM dd, yyyy',
  api: 'yyyy-MM-dd',
  time: 'HH:mm:ss',
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
} as const;

export const API_ENDPOINTS = {
  attendance: '/api/attendance',
  students: '/api/students',
  courses: '/api/courses',
  reports: '/api/reports',
} as const; 