'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Calendar,
    Clock,
    CheckCircle,
    ArrowLeft
} from 'lucide-react';
import { apiService, User as UserType, Doctor, Specialty, AvailableSlot } from '@/lib/api';
import toast from 'react-hot-toast';

const appointmentSchema = z.object({
    specialtyId: z.string().min(1, 'Please select a specialty'),
    doctorId: z.string().min(1, 'Please select a doctor'),
    appointmentDate: z.string().min(1, 'Please select a date'),
    timeSlot: z.string().min(1, 'Please select a time slot'),
    reasonForVisit: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function BookAppointmentPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
    });

    const watchSpecialty = watch('specialtyId');
    const watchDoctor = watch('doctorId');
    const watchDate = watch('appointmentDate');

    const loadSpecialties = useCallback(async () => {
        try {
            const data = await apiService.getActiveSpecialties();
            setSpecialties(data);
        } catch (error) {
            console.error('Error loading specialties:', error);
            toast.error('Failed to load specialties');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const currentUser = apiService.getCurrentUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        if (currentUser.Role !== 'Patient') {
            router.push('/');
            return;
        }
        setUser(currentUser);
        loadSpecialties();
    }, [router, loadSpecialties]);

    const loadDoctorsBySpecialty = useCallback(async (specialtyId: string) => {
        try {
            const data = await apiService.getDoctorsBySpecialty(specialtyId);
            setDoctors(data.filter(doc => doc.IsApproved && doc.IsActive));
            setValue('doctorId', '');
            setSelectedDoctor(null);
            setAvailableSlots([]);
        } catch (error) {
            console.error('Error loading doctors:', error);
            toast.error('Failed to load doctors');
        }
    }, [setValue]);

    const loadAvailableSlots = useCallback(async (doctorId: string, date: string) => {
        try {
            const doctor = doctors.find(d => d.Id === doctorId);
            setSelectedDoctor(doctor || null);

            const slots = await apiService.getDoctorAvailableSlots(doctorId, date);
            setAvailableSlots(slots.filter(slot => slot.IsAvailable));
        } catch (error) {
            console.error('Error loading slots:', error);
            toast.error('Failed to load available slots');
        }
    }, [doctors]);

    useEffect(() => {
        if (watchSpecialty) {
            loadDoctorsBySpecialty(watchSpecialty);
        }
    }, [watchSpecialty, loadDoctorsBySpecialty]);

    useEffect(() => {
        if (watchDoctor && watchDate) {
            loadAvailableSlots(watchDoctor, watchDate);
        }
    }, [watchDoctor, watchDate, loadAvailableSlots]);

    const onSubmit = async (data: AppointmentFormData) => {
        if (!user) return;

        setSubmitting(true);
        try {
            const [startTime, endTime] = data.timeSlot.split('-');

            await apiService.createAppointment(user.Id, {
                DoctorId: data.doctorId,
                AppointmentDate: data.appointmentDate,
                StartTime: startTime.trim(),
                EndTime: endTime.trim(),
                ReasonForVisit: data.reasonForVisit || ''
            });

            toast.success('Appointment booked successfully!');
            router.push('/patient/dashboard');
        } catch (error) {
            console.error('Error booking appointment:', error);
            toast.error('Failed to book appointment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => router.back()}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <Calendar className="h-8 w-8 text-blue-600" />
                        <span className="ml-2 text-xl font-bold text-black">Book Appointment</span>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Specialty Selection */}
                        <div>
                            <label htmlFor="specialtyId" className="block text-sm font-medium text-black mb-2">
                                Select Specialty
                            </label>
                            <select
                                {...register('specialtyId')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                            >
                                <option value="">Choose a specialty...</option>
                                {specialties.map((specialty) => (
                                    <option key={specialty.Id} value={specialty.Id}>
                                        {specialty.Name}
                                    </option>
                                ))}
                            </select>
                            {errors.specialtyId && (
                                <p className="mt-1 text-sm text-red-600">{errors.specialtyId.message}</p>
                            )}
                        </div>

                        {/* Doctor Selection */}
                        {doctors.length > 0 && (
                            <div>
                                <label htmlFor="doctorId" className="block text-sm font-medium text-black mb-2">
                                    Select Doctor
                                </label>
                                <div className="space-y-3">
                                    {doctors.map((doctor) => (
                                        <div
                                            key={doctor.Id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${watchDoctor === doctor.Id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setValue('doctorId', doctor.Id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-2">
                                                        <input
                                                            type="radio"
                                                            {...register('doctorId')}
                                                            value={doctor.Id}
                                                            className="mr-3"
                                                        />
                                                        <h3 className="text-lg font-medium text-black">
                                                            Dr. {doctor.User.Name}
                                                        </h3>
                                                    </div>
                                                    <p className="text-sm text-black mb-1">{doctor.Specialty.Name}</p>
                                                    <p className="text-sm text-black mb-2">{doctor.Qualification}</p>
                                                    <div className="flex items-center text-xs text-black space-x-4">
                                                        <span>{doctor.Experience} years experience</span>
                                                        <span>License: {doctor.LicenseNumber}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-black">${doctor.ConsultationFee}</p>
                                                    <p className="text-xs text-black">Consultation Fee</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.doctorId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>
                                )}
                            </div>
                        )}

                        {/* Date Selection */}
                        {selectedDoctor && (
                            <div>
                                <label htmlFor="appointmentDate" className="block text-sm font-medium text-black mb-2">
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    {...register('appointmentDate')}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                />
                                {errors.appointmentDate && (
                                    <p className="mt-1 text-sm text-red-600">{errors.appointmentDate.message}</p>
                                )}
                            </div>
                        )}

                        {/* Time Slot Selection */}
                        {availableSlots.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Select Time Slot
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {availableSlots.map((slot, index) => (
                                        <label
                                            key={index}
                                            className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-colors ${watch('timeSlot') === `${slot.StartTime}-${slot.EndTime}`
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                {...register('timeSlot')}
                                                value={`${slot.StartTime}-${slot.EndTime}`}
                                                className="sr-only"
                                            />
                                            <span className="text-sm font-medium">
                                                {slot.StartTime} - {slot.EndTime}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.timeSlot && (
                                    <p className="mt-1 text-sm text-red-600">{errors.timeSlot.message}</p>
                                )}
                            </div>
                        )}

                        {availableSlots.length === 0 && watchDoctor && watchDate && (
                            <div className="text-center py-8">
                                <Clock className="h-12 w-12 mx-auto mb-4 text-black" />
                                <p className="text-black">No available slots for the selected date</p>
                                <p className="text-sm text-black">Please try a different date</p>
                            </div>
                        )}

                        {/* Reason for Visit */}
                        {watch('timeSlot') && (
                            <div>
                                <label htmlFor="reasonForVisit" className="block text-sm font-medium text-black mb-2">
                                    Reason for Visit (Optional)
                                </label>
                                <textarea
                                    {...register('reasonForVisit')}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    placeholder="Briefly describe your symptoms or reason for consultation..."
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        {watch('timeSlot') && (
                            <div className="flex items-center justify-between pt-6 border-t">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                    <span className="text-sm text-black">
                                        Appointment with Dr. {selectedDoctor?.User.Name} on {watchDate} at {watch('timeSlot')}
                                    </span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-md font-medium transition-colors"
                                >
                                    {submitting ? 'Booking...' : `Book Appointment - $${selectedDoctor?.ConsultationFee}`}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
