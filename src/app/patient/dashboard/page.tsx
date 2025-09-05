'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    User,
    Clock,
    Phone,
    Mail,
    LogOut,
    Plus,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { apiService, User as UserType, Appointment } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

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
        loadAppointments(currentUser.Id);
    }, [router]);

    const loadAppointments = async (patientId: string) => {
        try {
            const data = await apiService.getAppointmentsByPatient(patientId);
            setAppointments(data);
        } catch (error) {
            console.error('Error loading appointments:', error);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        apiService.logout();
        router.push('/');
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Patient Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user?.Name}</span>
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
                {/* Quick Actions */}
                <div className="mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => router.push('/patient/book-appointment')}
                                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <Plus className="h-6 w-6 text-blue-600 mr-2" />
                                <span className="font-medium">Book New Appointment</span>
                            </button>
                            <button
                                onClick={() => router.push('/patient/appointments')}
                                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                                <span className="font-medium">View All Appointments</span>
                            </button>
                            <button
                                onClick={() => router.push('/patient/profile')}
                                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <User className="h-6 w-6 text-blue-600 mr-2" />
                                <span className="font-medium">Manage Profile</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">{user?.Name}</span>
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
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Appointments</span>
                                <span className="text-sm font-medium">{appointments.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Upcoming</span>
                                <span className="text-sm font-medium">
                                    {appointments.filter(apt => apt.Status === 'Approved' || apt.Status === 'Pending').length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Completed</span>
                                <span className="text-sm font-medium">
                                    {appointments.filter(apt => apt.Status === 'Completed').length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Next Appointment</h3>
                        {appointments.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">{appointments[0].Doctor.User.Name}</p>
                                <p className="text-sm text-gray-600">{appointments[0].Doctor.Specialty.Name}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(appointments[0].AppointmentDate).toLocaleDateString()} at {appointments[0].StartTime}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No upcoming appointments</p>
                        )}
                    </div>
                </div>

                {/* Recent Appointments */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Appointments</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {appointments.slice(0, 5).map((appointment) => (
                            <div key={appointment.Id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <h4 className="text-sm font-medium text-gray-900 mr-2">
                                                Dr. {appointment.Doctor.User.Name}
                                            </h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.Status)}`}>
                                                {getStatusIcon(appointment.Status)}
                                                <span className="ml-1">{appointment.Status}</span>
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">{appointment.Doctor.Specialty.Name}</p>
                                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {new Date(appointment.AppointmentDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {appointment.StartTime} - {appointment.EndTime}
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
                                <button
                                    onClick={() => router.push('/patient/book-appointment')}
                                    className="mt-2 text-blue-600 hover:text-blue-500 text-sm font-medium"
                                >
                                    Book your first appointment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
