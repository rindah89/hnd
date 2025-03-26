'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Building, FileDigit, MapPin, Phone, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function StudentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/student/${params.id}`);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch student details');
                }
                
                const data = await response.json();
                setStudent(data);
                setError(null);
            } catch (error) {
                console.error('Error fetching student details:', error);
                setError(error.message || 'An error occurred while fetching student details');
                toast.error(error.message || 'Failed to load student details');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchStudentDetails();
        }
    }, [params.id]);

    const goBack = () => {
        router.back();
    };

    const handleEdit = () => {
        router.push(`/dashboard/students/edit/${params.id}`);
    };

    return (
        <div className="container mx-auto py-6">
            <Button 
                variant="ghost" 
                onClick={goBack} 
                className="mb-6 flex items-center gap-2"
            >
                <ArrowLeft size={16} />
                Back to Students
            </Button>

            {loading ? (
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex items-start gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-6 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : error ? (
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl">Error</CardTitle>
                        <CardDescription>
                            We couldn't load the student details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500">{error}</p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={goBack}>Go Back</Button>
                    </CardFooter>
                </Card>
            ) : student ? (
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl">Student Details</CardTitle>
                        <CardDescription>
                            Complete information about the student
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-indigo-50 rounded-full">
                                <FileDigit className="text-indigo-500 h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Matricule</p>
                                <p className="text-lg font-medium">{student.matricule}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-gray-100 rounded-full">
                                <User className="text-gray-500 h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="text-lg font-medium">{student.name}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-50 rounded-full">
                                <BookOpen className="text-blue-500 h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Level</p>
                                <p className="text-lg">
                                    <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm font-medium">
                                        {student.level}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-purple-50 rounded-full">
                                <Building className="text-purple-500 h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Department</p>
                                <p className="text-lg font-medium">{student.departmentName || 'N/A'}</p>
                                {student.departmentCategory && (
                                    <p className="text-sm text-gray-500">{student.departmentCategory}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-red-50 rounded-full">
                                <MapPin className="text-red-500 h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Campus</p>
                                <p className="text-lg font-medium">{student.campusName || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-green-50 rounded-full">
                                <Phone className="text-green-500 h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Contact</p>
                                <p className="text-lg font-medium">{student.contact || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-orange-50 rounded-full">
                                <MapPin className="text-orange-500 h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="text-lg">{student.address || 'No address provided'}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={goBack}>Back</Button>
                        <Button onClick={handleEdit}>Edit Student</Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl">Student Not Found</CardTitle>
                        <CardDescription>
                            We couldn't find the student you're looking for
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>The student ID {params.id} does not exist in our records.</p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={goBack}>Go Back</Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
} 