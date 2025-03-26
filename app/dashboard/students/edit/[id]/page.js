'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Form validation schema
const formSchema = z.object({
    matricule: z.string().min(3, "Matricule must be at least 3 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    level: z.string().min(1, "Level is required"),
    departmentId: z.string().min(1, "Department is required"),
    campusId: z.string().min(1, "Campus is required"),
    contact: z.string().optional(),
    address: z.string().optional(),
});

export default function EditStudentPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [campuses, setCampuses] = useState([]);
    const [error, setError] = useState(null);

    // Initialize form with empty values
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            matricule: '',
            name: '',
            level: '',
            departmentId: '',
            campusId: '',
            contact: '',
            address: '',
        }
    });

    // Fetch student data for editing
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
                
                // Reset form with student data
                form.reset({
                    matricule: data.matricule || '',
                    name: data.name || '',
                    level: data.level || '',
                    departmentId: data.departmentId ? data.departmentId.toString() : '',
                    campusId: data.campusId ? data.campusId.toString() : '',
                    contact: data.contact || '',
                    address: data.address || '',
                });
                
                setError(null);
            } catch (error) {
                console.error('Error fetching student details:', error);
                setError(error.message || 'An error occurred while fetching student details');
                toast.error(error.message || 'Failed to load student details');
            } finally {
                setLoading(false);
            }
        };

        // Fetch departments and campuses for dropdowns
        const fetchOptions = async () => {
            try {
                // Fetch departments
                const deptResponse = await fetch('/api/departments');
                if (deptResponse.ok) {
                    const deptData = await deptResponse.json();
                    setDepartments(deptData);
                }
                
                // Fetch campuses
                const campusResponse = await fetch('/api/campuses');
                if (campusResponse.ok) {
                    const campusData = await campusResponse.json();
                    setCampuses(campusData);
                }
            } catch (error) {
                console.error('Error fetching options:', error);
                toast.error('Failed to load departments or campuses');
            }
        };

        if (params.id) {
            fetchStudentDetails();
            fetchOptions();
        }
    }, [params.id, form]);

    const onSubmit = async (data) => {
        try {
            setSubmitting(true);
            
            const response = await fetch(`/api/student/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update student');
            }
            
            toast.success('Student updated successfully!');
            router.push('/dashboard/students');
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error(error.message || 'Failed to update student');
        } finally {
            setSubmitting(false);
        }
    };

    const goBack = () => {
        router.back();
    };

    return (
        <div className="container mx-auto py-6">
            <Button 
                variant="ghost" 
                onClick={goBack} 
                className="mb-6 flex items-center gap-2"
            >
                <ArrowLeft size={16} />
                Back
            </Button>
            
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Edit Student</CardTitle>
                    <CardDescription>
                        Update student information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Loading student data...</span>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 py-4">
                            <p>{error}</p>
                            <Button className="mt-4" onClick={goBack}>Go Back</Button>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="matricule"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Matricule</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter matricule" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter full name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="level"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Level</FormLabel>
                                            <Select 
                                                onValueChange={field.onChange} 
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Level 1">Level 1</SelectItem>
                                                    <SelectItem value="Level 2">Level 2</SelectItem>
                                                    <SelectItem value="Level 3">Level 3</SelectItem>
                                                    <SelectItem value="Level 4">Level 4</SelectItem>
                                                    <SelectItem value="Level 5">Level 5</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="departmentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <Select 
                                                onValueChange={field.onChange} 
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select department" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {departments.map((dept) => (
                                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                                            {dept.name} ({dept.category})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="campusId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Campus</FormLabel>
                                            <Select 
                                                onValueChange={field.onChange} 
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select campus" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {campuses.map((campus) => (
                                                        <SelectItem key={campus.id} value={campus.id.toString()}>
                                                            {campus.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="contact"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter contact number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="pt-4 flex justify-between">
                                    <Button type="button" variant="outline" onClick={goBack}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : 'Update Student'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 