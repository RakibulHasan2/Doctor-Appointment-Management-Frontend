'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    ArrowLeft,
    Save,
    Edit,
    Plus,
    Trash2,
    User,
    Stethoscope,
    Clock
} from 'lucide-react';
import { apiService, Doctor, Specialty, User as UserType, UpdateDoctorRequest } from '@/lib/api';
import toast from 'react-hot-toast';

const doctorProfileSchema = z.object({
    LicenseNumber: z.string().min(5, 'License number must be at least 5 characters'),
    Experience: z.number().min(0, 'Experience must be a positive number'),
    Qualification: z.string().min(10, 'Please provide detailed qualifications'),
    ConsultationFee: z.number().min(1, 'Consultation fee must be greater than 0'),
    SpecialtyId: z.string().min(1, 'Please select a specialty'),
});

type DoctorProfileFormData = z.infer<typeof doctorProfileSchema>;

interface FormDoctorAvailability {
    DayOfWeek: string;
    StartTime: string;
    EndTime: string;
    IsAvailable: boolean;
}

const DAYS_OF_WEEK = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function DoctorProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [availability, setAvailability] = useState<FormDoctorAvailability[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<DoctorProfileFormData>({
        resolver: zodResolver(doctorProfileSchema),
    });

    const loadData = useCallback(async (userId: string) => {
        try {
            const [doctorData, specialtiesData] = await Promise.all([
                apiService.getDoctorByUserId(userId),
                apiService.getActiveSpecialties()
            ]);

            setDoctor(doctorData);
            setSpecialties(specialtiesData);

            // Convert doctor availability to form format
            const formAvailability = doctorData.Availability.map(slot => ({
                DayOfWeek: slot.DayOfWeek,
                StartTime: slot.StartTime.substring(0, 5), // Convert "09:00:00" to "09:00"
                EndTime: slot.EndTime.substring(0, 5),     // Convert "17:00:00" to "17:00"
                IsAvailable: slot.IsAvailable
            }));
            setAvailability(formAvailability);

            // Set form values
            reset({
                LicenseNumber: doctorData.LicenseNumber,
                Experience: doctorData.Experience,
                Qualification: doctorData.Qualification,
                ConsultationFee: doctorData.ConsultationFee,
                SpecialtyId: doctorData.SpecialtyId
            });

        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load profile data');
            router.push('/doctor/dashboard');
        } finally {
            setLoadingData(false);
        }
    }, [reset, router]);

    useEffect(() => {
        const currentUser = apiService.getCurrentUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        if (currentUser.Role !== 'Doctor') {
            router.push('/');
            return;
        }
        setUser(currentUser);
        loadData(currentUser.Id);
    }, [router, loadData]); const addAvailability = () => {
        setAvailability([
            ...availability,
            { DayOfWeek: 'Monday', StartTime: '09:00', EndTime: '17:00', IsAvailable: true }
        ]);
    };

    const removeAvailability = (index: number) => {
        if (availability.length > 1) {
            setAvailability(availability.filter((_, i) => i !== index));
        }
    };

    const updateAvailability = (index: number, field: keyof FormDoctorAvailability, value: string | boolean) => {
        const updated = [...availability];
        updated[index] = { ...updated[index], [field]: value };
        setAvailability(updated);
    };

    const onSubmit = async (data: DoctorProfileFormData) => {
        if (!doctor) return;

        setIsLoading(true);
        try {
            // Convert form availability to backend format
            const backendAvailability = availability.map(slot => ({
                DayOfWeek: slot.DayOfWeek.trim(),
                StartTime: slot.StartTime + ":00", // Convert HH:MM to HH:MM:SS
                EndTime: slot.EndTime + ":00",     // Convert HH:MM to HH:MM:SS
                IsAvailable: slot.IsAvailable
            }));

            const updateData: UpdateDoctorRequest = {
                specialtyId: data.SpecialtyId,
                licenseNumber: data.LicenseNumber,
                experience: data.Experience,
                qualification: data.Qualification,
                consultationFee: data.ConsultationFee,
                availability: backendAvailability,
            };

            await apiService.updateDoctor(doctor.Id, updateData);

            // Reload data to reflect changes
            await loadData(user!.Id);

            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error: unknown) {
            console.error('Error updating profile:', error);
            let errorMessage = 'Failed to update profile';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (doctor) {
            // Reset form to original values
            reset({
                LicenseNumber: doctor.LicenseNumber,
                Experience: doctor.Experience,
                Qualification: doctor.Qualification,
                ConsultationFee: doctor.ConsultationFee,
                SpecialtyId: doctor.SpecialtyId
            });

            // Reset availability
            const formAvailability = doctor.Availability.map(slot => ({
                DayOfWeek: slot.DayOfWeek,
                StartTime: slot.StartTime.substring(0, 5),
                EndTime: slot.EndTime.substring(0, 5),
                IsAvailable: slot.IsAvailable
            }));
            setAvailability(formAvailability);
        }
        setIsEditing(false);
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 mb-4">Unable to load your doctor profile.</p>
                    <button
                        onClick={() => router.push('/doctor/dashboard')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white shadow-sm rounded-lg mb-6">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <button
                                    onClick={() => router.push('/doctor/dashboard')}
                                    className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <div className="flex items-center">
                                    <User className="h-6 w-6 text-blue-600 mr-2" />
                                    <h1 className="text-2xl font-bold text-gray-900">Doctor Profile</h1>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit(onSubmit)}
                                            disabled={isLoading}
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <User className="h-5 w-5 mr-2 text-blue-600" />
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                                    Dr. {user?.Name}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                                    {user?.Email}
                                </div>
                            </div>
                            {user?.Phone && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                                        {user.Phone}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <div className={`px-3 py-2 border border-gray-300 rounded-lg ${doctor.IsApproved ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                    {doctor.IsApproved ? '✓ Approved' : '⏳ Pending Approval'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                            Professional Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="SpecialtyId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Medical Specialty *
                                </label>
                                {isEditing ? (
                                    <select
                                        {...register('SpecialtyId')}
                                        id="SpecialtyId"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    >
                                        <option value="">Select your specialty</option>
                                        {specialties.map((specialty) => (
                                            <option key={specialty.Id} value={specialty.Id}>
                                                {specialty.Name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black">
                                        {doctor.Specialty.Name}
                                    </div>
                                )}
                                {errors.SpecialtyId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.SpecialtyId.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="LicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Medical License Number *
                                </label>
                                {isEditing ? (
                                    <input
                                        {...register('LicenseNumber')}
                                        type="text"
                                        id="LicenseNumber"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        placeholder="Enter your license number"
                                    />
                                ) : (
                                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black">
                                        {doctor.LicenseNumber}
                                    </div>
                                )}
                                {errors.LicenseNumber && (
                                    <p className="mt-1 text-sm text-red-600">{errors.LicenseNumber.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="Experience" className="block text-sm font-medium text-gray-700 mb-1">
                                    Years of Experience *
                                </label>
                                {isEditing ? (
                                    <input
                                        {...register('Experience', { valueAsNumber: true })}
                                        type="number"
                                        id="Experience"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        placeholder="0"
                                    />
                                ) : (
                                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black">
                                        {doctor.Experience} years
                                    </div>
                                )}
                                {errors.Experience && (
                                    <p className="mt-1 text-sm text-red-600">{errors.Experience.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="ConsultationFee" className="block text-sm font-medium text-gray-700 mb-1">
                                    Consultation Fee (USD) *
                                </label>
                                {isEditing ? (
                                    <input
                                        {...register('ConsultationFee', { valueAsNumber: true })}
                                        type="number"
                                        id="ConsultationFee"
                                        min="1"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        placeholder="50.00"
                                    />
                                ) : (
                                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black">
                                        ${doctor.ConsultationFee}
                                    </div>
                                )}
                                {errors.ConsultationFee && (
                                    <p className="mt-1 text-sm text-red-600">{errors.ConsultationFee.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label htmlFor="Qualification" className="block text-sm font-medium text-gray-700 mb-1">
                                Qualifications & Education *
                            </label>
                            {isEditing ? (
                                <textarea
                                    {...register('Qualification')}
                                    id="Qualification"
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    placeholder="Enter your medical qualifications, degrees, certifications, etc."
                                />
                            ) : (
                                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black min-h-[100px]">
                                    {doctor.Qualification}
                                </div>
                            )}
                            {errors.Qualification && (
                                <p className="mt-1 text-sm text-red-600">{errors.Qualification.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Availability Schedule */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                                Availability Schedule
                            </h2>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={addAvailability}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition duration-150"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Day
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {availability.map((slot, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                                            {isEditing ? (
                                                <select
                                                    value={slot.DayOfWeek}
                                                    onChange={(e) => updateAvailability(index, 'DayOfWeek', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                                                >
                                                    {DAYS_OF_WEEK.map((day) => (
                                                        <option key={day} value={day}>{day}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-black">
                                                    {slot.DayOfWeek}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                            {isEditing ? (
                                                <input
                                                    type="time"
                                                    value={slot.StartTime}
                                                    onChange={(e) => updateAvailability(index, 'StartTime', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                                                />
                                            ) : (
                                                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-black">
                                                    {slot.StartTime}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                            {isEditing ? (
                                                <input
                                                    type="time"
                                                    value={slot.EndTime}
                                                    onChange={(e) => updateAvailability(index, 'EndTime', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                                                />
                                            ) : (
                                                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-black">
                                                    {slot.EndTime}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Available</label>
                                            {isEditing ? (
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={slot.IsAvailable}
                                                        onChange={(e) => updateAvailability(index, 'IsAvailable', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-600">Available</span>
                                                </div>
                                            ) : (
                                                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
                                                    <span className={`text-sm font-medium ${slot.IsAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                                        {slot.IsAvailable ? '✓ Available' : '✗ Not Available'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            {isEditing && availability.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeAvailability(index)}
                                                    className="w-full px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition duration-150"
                                                >
                                                    <Trash2 className="h-4 w-4 mx-auto" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
