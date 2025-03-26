"use client"
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import GlobalApi from '@/app/_services/GlobalApi';
import { toast } from 'sonner';
import { Building, BuildingIcon, FileDigit, HashIcon, LoaderIcon, MapPin, Phone, Plus, School, User, Users } from 'lucide-react';

function AddNewStudent({refreshData, isOpen, onOpenChange}) {
    const [loading, setLoading] = useState(false);
    const [grades, setGrades] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [campuses, setCampuses] = useState([]);
    
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm()

    useEffect(() => {
        GetAllGradesList();
        // Fetch departments and campuses
        fetchDepartments();
        fetchCampuses();
    }, [])

    const GetAllGradesList = () => {
        GlobalApi.GetAllGrades().then(resp => {
            setGrades(resp.data);
        })
    }

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/departments');
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error("Error fetching departments:", error);
            // Use mock data if API fails
            setDepartments([
                { id: 1, name: "Computer Science", category: "Engineering" },
                { id: 2, name: "Electrical Engineering", category: "Engineering" },
                { id: 3, name: "Business Administration", category: "Business" },
                { id: 4, name: "Medicine", category: "Health Sciences" }
            ]);
        }
    }

    const fetchCampuses = async () => {
        try {
            const response = await fetch('/api/campuses');
            const data = await response.json();
            setCampuses(data);
        } catch (error) {
            console.error("Error fetching campuses:", error);
            // Use mock data if API fails
            setCampuses([
                { id: 1, name: "Yaoundé Campus", address: "Simbock, Yaoundé" },
                { id: 2, name: "Bonaberi Campus", address: "Bonaberi, Douala" },
                { id: 3, name: "Bonamousadi Campus", address: "Bonamousadi, Douala" }
            ]);
        }
    }

    const onSubmit = (data) => {
        setLoading(true)
        GlobalApi.CreateNewStudent(data).then(resp => {
            console.log("--", resp);
            if (resp.data) {
                reset();
                refreshData();
                onOpenChange(false);
                toast('New Student Added!') 
            }
            setLoading(false)
        }).catch(error => {
            console.error("Error adding student:", error);
            toast.error(error.response?.data?.error || 'Failed to add student. Please try again.');
            setLoading(false);
        });
    }

    // Generate a random ID for the student ID field
    const generateRandomId = () => {
        return Math.floor(Math.random() * 1000000) + 1;
    };
    
    return (
        <div>
            <Button onClick={() => onOpenChange(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus size={16} />
                Add New Student
            </Button>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Users className="text-blue-600" />
                            Add New Student
                        </DialogTitle>
                        <DialogDescription>
                            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                                <div className="space-y-4">
                                    <input 
                                        type="hidden" 
                                        value={generateRandomId()} 
                                        {...register('id', { required: true, valueAsNumber: true })}
                                    />

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <FileDigit size={16} className="text-gray-500" />
                                            Matricule
                                        </label>
                                        <Input 
                                            placeholder="Ex. FE21A075"
                                            className={errors.matricule ? "border-red-500" : ""}
                                            {...register('matricule', { 
                                                required: true,
                                                pattern: {
                                                    value: /^[A-Z0-9]{6,8}$/,
                                                    message: "Matricule should be 6-8 alphanumeric characters"
                                                }
                                            })}
                                        />
                                        {errors.matricule && 
                                            <p className="text-xs text-red-500">
                                                {errors.matricule.message || "Matricule is required"}
                                            </p>
                                        }
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <User size={16} className="text-gray-500" />
                                            Full Name
                                        </label>
                                        <Input 
                                            placeholder="Ex. Ngono Essomba"
                                            className={errors.name ? "border-red-500" : ""}
                                            {...register('name', { required: true })}
                                        />
                                        {errors.name && <p className="text-xs text-red-500">Name is required</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <School size={16} className="text-gray-500" />
                                            Level
                                        </label>
                                        <select 
                                            className={`w-full p-2 border rounded-md ${errors.level ? "border-red-500" : ""}`}
                                            {...register('level', { required: true })}
                                        >
                                            <option value="">Select Level</option>
                                            {grades.map((item, index) => (
                                                <option key={index} value={item.level || item.grade}>{item.level || item.grade}</option>
                                            ))}
                                        </select>
                                        {errors.level && <p className="text-xs text-red-500">Level is required</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Building size={16} className="text-gray-500" />
                                            Department
                                        </label>
                                        <select 
                                            className={`w-full p-2 border rounded-md ${errors.departmentId ? "border-red-500" : ""}`}
                                            {...register('departmentId', { required: true, valueAsNumber: true })}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((dept) => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.name} ({dept.category})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.departmentId && <p className="text-xs text-red-500">Department is required</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <BuildingIcon size={16} className="text-gray-500" />
                                            Campus
                                        </label>
                                        <select 
                                            className={`w-full p-2 border rounded-md ${errors.campusId ? "border-red-500" : ""}`}
                                            {...register('campusId', { required: true, valueAsNumber: true })}
                                        >
                                            <option value="">Select Campus</option>
                                            {campuses.map((campus) => (
                                                <option key={campus.id} value={campus.id}>
                                                    {campus.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.campusId && <p className="text-xs text-red-500">Campus is required</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Phone size={16} className="text-gray-500" />
                                            Contact Number
                                        </label>
                                        <Input 
                                            type="tel" 
                                            placeholder="Ex. 677123456"
                                            className={errors.contact ? "border-red-500" : ""}
                                            {...register('contact', { required: true })} 
                                        />
                                        {errors.contact && <p className="text-xs text-red-500">Contact number is required</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-500" />
                                            Address
                                        </label>
                                        <Input 
                                            placeholder="Ex. Quartier Mvan, Yaoundé"
                                            className={errors.address ? "border-red-500" : ""}
                                            {...register('address', { required: true })} 
                                        />
                                        {errors.address && <p className="text-xs text-red-500">Address is required</p>}
                                    </div>
                                </div>

                                <div className="flex gap-3 items-center justify-end mt-6">
                                    <Button 
                                        type="button" 
                                        onClick={() => onOpenChange(false)} 
                                        variant="outline"
                                        className="border-gray-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {loading ? <LoaderIcon className="animate-spin mr-2" size={16} /> : null}
                                        {loading ? 'Saving...' : 'Save Student'}
                                    </Button>
                                </div>
                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewStudent