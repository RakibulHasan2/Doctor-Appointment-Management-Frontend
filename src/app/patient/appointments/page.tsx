'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    Clock,
    Search,
    Filter,
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    X
} from 'lucide-react';
import { apiService, User as UserType, Appointment } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PatientAppointmentsPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

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

    useEffect(() => {
        filterAppointments();
    }, [appointments, searchTerm, statusFilter]);

    const loadAppointments = async (patientId: string) => {
        try {
            const data = await apiService.getAppointmentsByPatient(patientId);
            // Sort by date descending (newest first)
            const sortedData = data.sort((a, b) => 
                new Date(b.AppointmentDate).getTime() - new Date(a.AppointmentDate).getTime()
            );
            setAppointments(sortedData);
        } catch (error) {
            console.error('Error loading appointments:', error);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = useCallback(() => {
        let filtered = appointments;

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(apt => apt.Status.toLowerCase() === statusFilter);
        }

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(apt =>
                apt.Doctor.User.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.Doctor.Specialty.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.ReasonForVisit?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAppointments(filtered);
    }, [appointments, searchTerm, statusFilter]);

    const handleCancelAppointment = async () => {
        if (!selectedAppointment || !user) return;

        if (!cancelReason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        setCancelling(true);
        try {
            await apiService.cancelAppointment(selectedAppointment.Id, user.Id, cancelReason);
            toast.success('Appointment cancelled successfully');
            setShowCancelModal(false);
            setCancelReason('');
            setSelectedAppointment(null);
            loadAppointments(user.Id);
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            toast.error('Failed to cancel appointment');
        } finally {
            setCancelling(false);
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
            case 'NoShow':
                return 'text-purple-600 bg-purple-100';
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
            case 'NoShow':
                return <XCircle className="h-4 w-4" />;
            case 'Completed':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const canCancelAppointment = (appointment: Appointment) => {
        return appointment.Status === 'Pending' || appointment.Status === 'Approved';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                            <button
                                onClick={() => router.back()}
                                className="mr-4 p-2 hover:bg-gray-100 rounded-full"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">My Appointments</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">{user?.Name}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by doctor, specialty, or reason..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="rejected">Rejected</option>
                                <option value="noshow">No Show</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Appointments Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Total</p>
                                <p className="text-lg font-bold text-gray-900">{appointments.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {appointments.filter(apt => apt.Status === 'Pending').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {appointments.filter(apt => apt.Status === 'Approved').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {appointments.filter(apt => apt.Status === 'Completed').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Appointments ({filteredAppointments.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {filteredAppointments.map((appointment) => (
                            <div key={appointment.Id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <h4 className="text-lg font-medium text-gray-900 mr-3">
                                                Dr. {appointment.Doctor.User.Name}
                                            </h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.Status)}`}>
                                                {getStatusIcon(appointment.Status)}
                                                <span className="ml-1">{appointment.Status}</span>
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 mb-3">{appointment.Doctor.Specialty.Name}</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">
                                                    {formatDate(appointment.AppointmentDate)}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">
                                                    {appointment.StartTime} - {appointment.EndTime}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-600">Fee: </span>
                                                <span className="text-sm font-medium text-gray-900 ml-1">
                                                    ${appointment.ConsultationFee}
                                                </span>
                                            </div>
                                        </div>

                                        {appointment.ReasonForVisit && (
                                            <div className="mb-2">
                                                <span className="text-sm font-medium text-gray-700">Reason: </span>
                                                <span className="text-sm text-gray-900">{appointment.ReasonForVisit}</span>
                                            </div>
                                        )}

                                        {appointment.Notes && (
                                            <div className="mb-2">
                                                <span className="text-sm font-medium text-gray-700">Notes: </span>
                                                <span className="text-sm text-gray-900">{appointment.Notes}</span>
                                            </div>
                                        )}

                                        {appointment.CancellationReason && (
                                            <div className="mb-2">
                                                <span className="text-sm font-medium text-red-700">Cancellation Reason: </span>
                                                <span className="text-sm text-red-600">{appointment.CancellationReason}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={() => router.push(`/patient/appointments/${appointment.Id}`)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        
                                        {canCancelAppointment(appointment) && (
                                            <button
                                                onClick={() => {
                                                    setSelectedAppointment(appointment);
                                                    setShowCancelModal(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                title="Cancel Appointment"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {filteredAppointments.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                                <p className="text-gray-500 mb-4">
                                    {searchTerm || statusFilter !== 'all' 
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'You haven\'t booked any appointments yet.'
                                    }
                                </p>
                                {!searchTerm && statusFilter === 'all' && (
                                    <button
                                        onClick={() => router.push('/patient/book-appointment')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                                    >
                                        Book Your First Appointment
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Cancel Appointment Modal */}
            {showCancelModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-start mb-4">
                            <div className="flex-shrink-0">
                                <X className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900">Cancel Appointment</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Are you sure you want to cancel your appointment with Dr. {selectedAppointment.Doctor.User.Name}?
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cancellation Reason *
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="Please provide a reason for cancellation..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                    setSelectedAppointment(null);
                                }}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                disabled={cancelling}
                            >
                                Keep Appointment
                            </button>
                            <button
                                onClick={handleCancelAppointment}
                                disabled={cancelling || !cancelReason.trim()}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-md font-medium"
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
