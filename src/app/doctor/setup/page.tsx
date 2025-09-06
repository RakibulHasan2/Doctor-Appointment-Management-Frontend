'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Plus, Trash2 } from 'lucide-react';
import { apiService, CreateDoctorRequest, Specialty, User as UserType } from '@/lib/api';
import toast from 'react-hot-toast';

const doctorSetupSchema = z.object({
    SpecialtyId: z.string().min(1, 'Please select a specialty'),
    LicenseNumber: z.string().min(5, 'License number must be at least 5 characters'),
    Experience: z.number().min(0, 'Experience must be a positive number'),
    Qualification: z.string().min(10, 'Please provide detailed qualifications'),
    ConsultationFee: z.number().min(1, 'Consultation fee must be greater than 0'),
});

type DoctorSetupFormData = z.infer<typeof doctorSetupSchema>;

// Form data structure for easier handling
interface FormDoctorAvailability {
    DayOfWeek: string;
    StartTime: string;
    EndTime: string;
    IsAvailable: boolean;
}

const DAYS_OF_WEEK = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function DoctorSetupPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [availability, setAvailability] = useState<FormDoctorAvailability[]>([
        { DayOfWeek: 'Monday', StartTime: '09:00', EndTime: '17:00', IsAvailable: true }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<DoctorSetupFormData>({
        resolver: zodResolver(doctorSetupSchema),
    });

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
        loadSpecialties();
    }, [router]);

    const loadSpecialties = async () => {
        try {
            const specialtiesData = await apiService.getActiveSpecialties();
            setSpecialties(specialtiesData);
        } catch (error) {
            console.error('Error loading specialties:', error);
            toast.error('Failed to load specialties');
        } finally {
            setLoadingData(false);
        }
    };

    const addAvailability = () => {
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

    const onSubmit = async (data: DoctorSetupFormData) => {
        if (!user) {
            toast.error('User information not available');
            return;
        }

        setIsLoading(true);
        try {
            // Validate that all required fields are present
            if (!user.Id) {
                throw new Error('User ID is missing');
            }
            if (!data.SpecialtyId) {
                throw new Error('Specialty ID is required');
            }
            if (!data.LicenseNumber || data.LicenseNumber.trim() === '') {
                throw new Error('License number is required');
            }

            // Validate MongoDB ObjectId format (24 hex characters)
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            if (!objectIdRegex.test(user.Id)) {
                throw new Error('Invalid User ID format');
            }
            if (!objectIdRegex.test(data.SpecialtyId)) {
                throw new Error('Invalid Specialty ID format');
            }

            // Convert form availability to backend format
            const backendAvailability = availability.map(slot => ({
                DayOfWeek: slot.DayOfWeek.trim(),
                StartTime: slot.StartTime + ":00", // Convert "09:00" to "09:00:00"
                EndTime: slot.EndTime + ":00",     // Convert "17:00" to "17:00:00"
                IsAvailable: slot.IsAvailable
            }));

            // Validate converted data
            backendAvailability.forEach((slot, index) => {
                if (!slot.DayOfWeek || typeof slot.DayOfWeek !== 'string') {
                    throw new Error(`Invalid DayOfWeek at slot ${index}`);
                }
                if (!slot.StartTime || typeof slot.StartTime !== 'string') {
                    throw new Error(`Invalid StartTime at slot ${index}`);
                }
                if (!slot.EndTime || typeof slot.EndTime !== 'string') {
                    throw new Error(`Invalid EndTime at slot ${index}`);
                }
                // Basic time format validation
                const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
                if (!timeRegex.test(slot.StartTime)) {
                    throw new Error(`Invalid StartTime format at slot ${index}`);
                }
                if (!timeRegex.test(slot.EndTime)) {
                    throw new Error(`Invalid EndTime format at slot ${index}`);
                }
            });

            // Ensure we have at least one availability slot
            if (availability.length === 0) {
                toast.error('Please add at least one time slot');
                return;
            }

            const doctorData: CreateDoctorRequest = {
                UserId: user.Id,
                SpecialtyId: data.SpecialtyId,
                LicenseNumber: data.LicenseNumber.trim(),
                Experience: data.Experience,
                Qualification: data.Qualification.trim(),
                ConsultationFee: data.ConsultationFee,
                Availability: backendAvailability,
            };

            console.log('User data:', {
                Id: user.Id,
                Role: user.Role,
                Email: user.Email
            });
            console.log('Form data:', data);
            console.log('Sending doctor data:', doctorData);
            console.log('Availability details:', JSON.stringify(backendAvailability, null, 2));

            // Additional validation
            backendAvailability.forEach((slot, index) => {
                console.log(`Slot ${index}:`, {
                    DayOfWeek: slot.DayOfWeek,
                    StartTime: slot.StartTime, // Will show "09:00:00"
                    EndTime: slot.EndTime,     // Will show "17:00:00"
                    IsAvailable: slot.IsAvailable
                });
            });

            await apiService.createDoctor(doctorData);
            toast.success('Doctor profile created successfully!');
            router.push('/doctor/dashboard');
        } catch (error: unknown) {
            console.error('Error creating doctor profile:', error);

            let errorMessage = 'Failed to create doctor profile';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="bg-blue-600 px-6 py-8">
                        <div className="text-center">
                            <Stethoscope className="h-12 w-12 text-white mx-auto mb-4" />
                            <h1 className="text-3xl font-bold text-white">Complete Your Doctor Profile</h1>
                            <p className="text-blue-100 mt-2">Please provide your professional information to get started</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="SpecialtyId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Medical Specialty *
                                </label>
                                <select
                                    {...register('SpecialtyId')}
                                    id="SpecialtyId"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-black"
                                >
                                    <option value="">Select your specialty</option>
                                    {specialties.map((specialty) => (
                                        <option key={specialty.Id} value={specialty.Id}>
                                            {specialty.Name}
                                        </option>
                                    ))}
                                </select>
                                {errors.SpecialtyId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.SpecialtyId.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="LicenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                    Medical License Number *
                                </label>
                                <input
                                    {...register('LicenseNumber')}
                                    type="text"
                                    id="LicenseNumber"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-black"
                                    placeholder="Enter your license number"
                                />
                                {errors.LicenseNumber && (
                                    <p className="mt-1 text-sm text-red-600">{errors.LicenseNumber.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="Experience" className="block text-sm font-medium text-gray-700 mb-2">
                                    Years of Experience *
                                </label>
                                <input
                                    {...register('Experience', { valueAsNumber: true })}
                                    type="number"
                                    id="Experience"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-black"
                                    placeholder="0"
                                />
                                {errors.Experience && (
                                    <p className="mt-1 text-sm text-red-600">{errors.Experience.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="ConsultationFee" className="block text-sm font-medium text-gray-700 mb-2">
                                    Consultation Fee (USD) *
                                </label>
                                <input
                                    {...register('ConsultationFee', { valueAsNumber: true })}
                                    type="number"
                                    id="ConsultationFee"
                                    min="1"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-black"
                                    placeholder="50.00"
                                />
                                {errors.ConsultationFee && (
                                    <p className="mt-1 text-sm text-red-600">{errors.ConsultationFee.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Qualifications */}
                        <div>
                            <label htmlFor="Qualification" className="block text-sm font-medium text-gray-700 mb-2">
                                Qualifications & Education *
                            </label>
                            <textarea
                                {...register('Qualification')}
                                id="Qualification"
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-black"
                                placeholder="Enter your medical qualifications, degrees, certifications, etc."
                            />
                            {errors.Qualification && (
                                <p className="mt-1 text-sm text-red-600">{errors.Qualification.message}</p>
                            )}
                        </div>

                        {/* Availability */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Availability Schedule</h3>
                                <button
                                    type="button"
                                    onClick={addAvailability}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition duration-150"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Day
                                </button>
                            </div>

                            <div className="space-y-4">
                                {availability.map((slot, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                                                <select
                                                    value={slot.DayOfWeek}
                                                    onChange={(e) => updateAvailability(index, 'DayOfWeek', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                                                >
                                                    {DAYS_OF_WEEK.map((day) => (
                                                        <option key={day} value={day}>{day}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                                <input
                                                    type="time"
                                                    value={slot.StartTime}
                                                    onChange={(e) => updateAvailability(index, 'StartTime', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                                <input
                                                    type="time"
                                                    value={slot.EndTime}
                                                    onChange={(e) => updateAvailability(index, 'EndTime', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Available</label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={slot.IsAvailable}
                                                        onChange={(e) => updateAvailability(index, 'IsAvailable', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-600">Available</span>
                                                </div>
                                            </div>

                                            <div>
                                                {availability.length > 1 && (
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

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Creating Profile...
                                    </div>
                                ) : (
                                    'Complete Doctor Profile'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
