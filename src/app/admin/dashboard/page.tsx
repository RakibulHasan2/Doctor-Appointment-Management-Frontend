'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    Users,
    UserCheck,
    Settings,
    LogOut,
    CheckCircle,
    XCircle,
    AlertCircle,
    Shield,
    Activity,
    TrendingUp
} from 'lucide-react';
import { apiService, User as UserType, Appointment, Doctor } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        pendingApprovals: 0,
        pendingAppointments: 0
    });
    const [pendingDoctors, setPendingDoctors] = useState<Doctor[]>([]);
    const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingDoctorId, setRejectingDoctorId] = useState<string>('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        const currentUser = apiService.getCurrentUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        if (currentUser.Role !== 'Admin') {
            router.push('/');
            return;
        }
        setUser(currentUser);
        loadDashboardData();
    }, [router]);

    const loadDashboardData = async () => {
        try {
            const [users, appointments, , pendingDocs] = await Promise.all([
                apiService.getUsers(),
                apiService.getAppointments(),
                apiService.getDoctors(),
                apiService.getPendingApprovalDoctors()
            ]);

            setStats({
                totalUsers: users.length,
                totalDoctors: users.filter(u => u.Role === 'Doctor').length,
                totalPatients: users.filter(u => u.Role === 'Patient').length,
                totalAppointments: appointments.length,
                pendingApprovals: pendingDocs.length,
                pendingAppointments: appointments.filter(apt => apt.Status === 'Pending').length
            });

            setPendingDoctors(pendingDocs);
            setRecentAppointments(appointments.slice(0, 10));
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorApproval = async (doctorId: string, approve: boolean) => {
        try {
            if (approve) {
                await apiService.approveDoctor(doctorId);
                toast.success('Doctor approved successfully');
            } else {
                // Prompt for rejection reason
                const reason = prompt('Please provide a reason for rejecting this doctor:');
                if (!reason || reason.trim() === '') {
                    toast.error('Rejection reason is required');
                    return;
                }
                await apiService.rejectDoctor(doctorId, reason.trim());
                toast.success('Doctor rejected successfully');
            }
            loadDashboardData(); // Reload data
        } catch (error) {
            console.error('Error updating doctor approval:', error);
            toast.error('Failed to update doctor approval');
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
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Admin Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user?.Name}</span>
                            <button
                                onClick={() => router.push('/admin/settings')}
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Total Users</h3>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-full">
                                <UserCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Doctors</h3>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-purple-100 p-3 rounded-full">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Patients</h3>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <Calendar className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Appointments</h3>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <AlertCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Pending Doctors</h3>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-orange-100 p-3 rounded-full">
                                <Activity className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Pending Appts</h3>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <button
                                onClick={() => router.push('/admin/users')}
                                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <Users className="h-6 w-6 text-blue-600 mr-2" />
                                <span className="font-medium text-black">Manage Users</span>
                            </button>
                            <button
                                onClick={() => router.push('/admin/doctors')}
                                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <UserCheck className="h-6 w-6 text-blue-600 mr-2" />
                                <span className="font-medium text-black">Manage Doctors</span>
                            </button>
                            <button
                                onClick={() => router.push('/admin/appointments')}
                                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                                <span className="font-medium text-black">View Appointments</span>
                            </button>
                            <button
                                onClick={() => router.push('/admin/setup')}
                                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                                <span className="font-medium text-black">System Setup</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pending Doctor Approvals */}
                {pendingDoctors.length > 0 && (
                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Pending Doctor Approvals</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {pendingDoctors.map((doctor) => (
                                <div key={doctor.Id} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                                                Dr. {doctor.User.Name}
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Specialty:</span> {doctor.Specialty.Name}
                                                </div>
                                                <div>
                                                    <span className="font-medium">License:</span> {doctor.LicenseNumber}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Experience:</span> {doctor.Experience} years
                                                </div>
                                                <div>
                                                    <span className="font-medium">Fee:</span> ${doctor.ConsultationFee}
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-sm font-medium text-gray-600">Qualifications:</span>
                                                <p className="text-sm text-gray-600">{doctor.Qualification}</p>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-sm font-medium text-gray-600">Email:</span>
                                                <span className="text-sm text-gray-600 ml-1">{doctor.User.Email}</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => handleDoctorApproval(doctor.Id, true)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleDoctorApproval(doctor.Id, false)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Appointments */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Appointments</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recentAppointments.map((appointment) => (
                            <div key={appointment.Id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <h4 className="text-sm font-medium text-gray-900 mr-2">
                                                {appointment.Patient.Name} → Dr. {appointment.Doctor.User.Name}
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
                                                <span>{appointment.StartTime} - {appointment.EndTime}</span>
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
                        {recentAppointments.length === 0 && (
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
