'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    User,
    Clock,
    Phone,
    Mail,
    LogOut,
    Settings,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    DollarSign
} from 'lucide-react';
import { apiService, User as UserType, Appointment, Doctor } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDoctorData = useCallback(async (userId: string) => {
        try {
            const doctorData = await apiService.getDoctorByUserId(userId);
            setDoctor(doctorData);
            const appointmentData = await apiService.getAppointmentsByDoctor(doctorData.Id);
            setAppointments(appointmentData);
        } catch (error) {
            console.error('Error loading doctor data:', error);
            // If doctor profile doesn't exist, redirect to setup
            if (error instanceof Error && error.message.includes('404')) {
                toast.error('Doctor profile not found. Please complete your profile setup.');
                router.push('/doctor/setup');
                return;
            }
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const currentUser = apiService.getCurrentUser();
        console.log(currentUser);
        if (!currentUser) {
            router.push('/login');
            return;
        }
        if (currentUser.Role !== 'Doctor') {
            router.push('/');
            return;
        }
        setUser(currentUser);
        loadDoctorData(currentUser.Id);
    }, [router, loadDoctorData]);

    const handleLogout = () => {
        apiService.logout();
        router.push('/');
    };

    const handleStatusUpdate = async (appointmentId: string, status: string) => {
        if (!user || !doctor) return;

        try {
            await apiService.updateAppointmentStatus(appointmentId, user.Id, {
                Status: status as 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'NoShow',
                Notes: `Updated by Dr. ${user.Name}`
            });

            // Reload appointments
            const appointmentData = await apiService.getAppointmentsByDoctor(doctor.Id);
            setAppointments(appointmentData);
            toast.success(`Appointment ${status.toLowerCase()}`);
        } catch (error) {
            console.error('Error updating appointment:', error);
            toast.error('Failed to update appointment');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'text-green-600 bg-green-100';
            case 'Pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'Rejected':
                return 'text-red-600 bg-red-100';
            case 'Cancelled':
                return 'text-gray-600 bg-gray-100';
            case 'Completed':
                return 'text-blue-600 bg-blue-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'Pending':
                return <AlertCircle className="h-4 w-4" />;
            case 'Rejected':
            case 'Cancelled':
                return <XCircle className="h-4 w-4" />;
            case 'Completed':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Doctor Profile Not Found</h2>
                    <p className="text-gray-600 mb-4">Please contact administration to set up your doctor profile.</p>
                    <button
                        onClick={handleLogout}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Doctor Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Dr. {user?.Name}</span>
                            <button
                                onClick={() => router.push('/doctor/profile')}
                                className="flex items-center text-gray-700 hover:text-blue-600"
                            >
                                <Settings className="h-4 w-4 mr-1" />
                                Settings
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-gray-700 hover:text-red-600"
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Total Appointments</h3>
                                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <AlertCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Pending</h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {appointments.filter(apt => apt.Status === 'Pending').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-full">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Patients</h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Set(appointments.map(apt => apt.PatientId)).size}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-full">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Fee Rate</h3>
                                <p className="text-2xl font-bold text-gray-900">${doctor.ConsultationFee}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doctor Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">Dr. {user?.Name}</span>
                            </div>
                            <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">{user?.Email}</span>
                            </div>
                            {user?.Phone && (
                                <div className="flex items-center">
                                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">{user.Phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Specialty</span>
                                <span className="text-sm font-medium">{doctor.Specialty.Name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">License</span>
                                <span className="text-sm font-medium">{doctor.LicenseNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Experience</span>
                                <span className="text-sm font-medium">{doctor.Experience} years</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Status</span>
                                <span className={`text-sm font-medium ${doctor.IsApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {doctor.IsApproved ? 'Approved' : 'Pending Approval'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Qualifications</h3>
                        <p className="text-sm text-gray-600">{doctor.Qualification}</p>
                    </div>
                </div>

                {/* Pending Appointments */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Pending Appointments</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {appointments.filter(apt => apt.Status === 'Pending').map((appointment) => (
                            <div key={appointment.Id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                                            {appointment.Patient.Name}
                                        </h4>
                                        <div className="flex items-center text-xs text-gray-500 space-x-4 mb-2">
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {new Date(appointment.AppointmentDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {appointment.StartTime} - {appointment.EndTime}
                                            </div>
                                            <div className="flex items-center">
                                                <Mail className="h-3 w-3 mr-1" />
                                                {appointment.Patient.Email}
                                            </div>
                                        </div>
                                        {appointment.ReasonForVisit && (
                                            <p className="text-xs text-gray-600">
                                                Reason: {appointment.ReasonForVisit}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => handleStatusUpdate(appointment.Id, 'Approved')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(appointment.Id, 'Rejected')}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {appointments.filter(apt => apt.Status === 'Pending').length === 0 && (
                            <div className="p-6 text-center text-gray-500">
                                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No pending appointments</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* All Appointments */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">All Appointments</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {appointments.slice(0, 10).map((appointment) => (
                            <div key={appointment.Id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <h4 className="text-sm font-medium text-gray-900 mr-2">
                                                {appointment.Patient.Name}
                                            </h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.Status)}`}>
                                                {getStatusIcon(appointment.Status)}
                                                <span className="ml-1">{appointment.Status}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {new Date(appointment.AppointmentDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {appointment.StartTime} - {appointment.EndTime}
                                            </div>
                                            <div className="flex items-center">
                                                <Mail className="h-3 w-3 mr-1" />
                                                {appointment.Patient.Email}
                                            </div>
                                        </div>
                                        {appointment.ReasonForVisit && (
                                            <p className="text-xs text-gray-600 mt-2">
                                                Reason: {appointment.ReasonForVisit}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            ${appointment.ConsultationFee}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {appointments.length === 0 && (
                            <div className="p-6 text-center text-gray-500">
                                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No appointments found</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
