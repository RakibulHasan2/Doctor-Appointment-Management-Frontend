'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertCircle,
    MapPin,
    FileText,
    DollarSign,
    X
} from 'lucide-react';
import { apiService, User as UserType, Appointment } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AppointmentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.id as string;

    const [user, setUser] = useState<UserType | null>(null);
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
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
        loadAppointment();
    }, [router, appointmentId]);

    const loadAppointment = async () => {
        try {
            const data = await apiService.getAppointmentById(appointmentId);
            setAppointment(data);
        } catch (error) {
            console.error('Error loading appointment:', error);
            toast.error('Failed to load appointment details');
            router.push('/patient/appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async () => {
        if (!appointment || !user) return;

        if (!cancelReason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        setCancelling(true);
        try {
            await apiService.cancelAppointment(appointment.Id, user.Id, cancelReason);
            toast.success('Appointment cancelled successfully');
            setShowCancelModal(false);
            setCancelReason('');
            loadAppointment();
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
                return <CheckCircle className="h-5 w-5" />;
            case 'Pending':
                return <AlertCircle className="h-5 w-5" />;
            case 'Rejected':
            case 'Cancelled':
            case 'NoShow':
                return <XCircle className="h-5 w-5" />;
            case 'Completed':
                return <CheckCircle className="h-5 w-5" />;
            default:
                return <AlertCircle className="h-5 w-5" />;
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

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Appointment Not Found</h2>
                    <p className="text-gray-600 mb-4">The appointment you&apos;re looking for doesn&apos;t exist.</p>
                    <button
                        onClick={() => router.push('/patient/appointments')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Back to Appointments
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
                            <button
                                onClick={() => router.back()}
                                className="mr-4 p-2 hover:bg-gray-100 rounded-full"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Appointment Details</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">{user?.Name}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Status Banner */}
                <div className="mb-6">
                    <div className={`rounded-lg p-4 ${appointment.Status === 'Approved' ? 'bg-green-50 border border-green-200' :
                        appointment.Status === 'Pending' ? 'bg-yellow-50 border border-yellow-200' :
                            appointment.Status === 'Cancelled' ? 'bg-gray-50 border border-gray-200' :
                                appointment.Status === 'Rejected' ? 'bg-red-50 border border-red-200' :
                                    appointment.Status === 'Completed' ? 'bg-blue-50 border border-blue-200' :
                                        'bg-purple-50 border border-purple-200'}`}>
                        <div className="flex items-center text-black">
                            {getStatusIcon(appointment.Status)}
                            <span className="ml-2 text-black text-lg font-medium">
                                Appointment {appointment.Status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Appointment Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Date</p>
                                            <p className="text-sm text-gray-900">{formatDate(appointment.AppointmentDate)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <Clock className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Time</p>
                                            <p className="text-sm text-gray-900">{appointment.StartTime} - {appointment.EndTime}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Consultation Fee</p>
                                            <p className="text-sm text-gray-900">${appointment.ConsultationFee}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="mr-3 mt-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.Status)}`}>
                                                {getStatusIcon(appointment.Status)}
                                                <span className="ml-1">{appointment.Status}</span>
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Status</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {appointment.Status === 'Pending' && 'Waiting for doctor confirmation'}
                                                {appointment.Status === 'Approved' && 'Confirmed by doctor'}
                                                {appointment.Status === 'Cancelled' && 'Appointment cancelled'}
                                                {appointment.Status === 'Rejected' && 'Doctor declined appointment'}
                                                {appointment.Status === 'Completed' && 'Consultation completed'}
                                                {appointment.Status === 'NoShow' && 'Patient did not attend'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Booking ID</p>
                                            <p className="text-sm text-gray-900 font-mono">{appointment.Id}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reason & Notes */}
                        {(appointment.ReasonForVisit || appointment.Notes) && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>

                                {appointment.ReasonForVisit && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Reason for Visit</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                            {appointment.ReasonForVisit}
                                        </p>
                                    </div>
                                )}

                                {appointment.Notes && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Doctor&apos;s Notes</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                            {appointment.Notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cancellation Info */}
                        {appointment.CancellationReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-red-900 mb-4">Cancellation Details</h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-red-700">Reason</p>
                                        <p className="text-sm text-red-900">{appointment.CancellationReason}</p>
                                    </div>
                                    {appointment.CancelledAt && (
                                        <div>
                                            <p className="text-sm font-medium text-red-700">Cancelled On</p>
                                            <p className="text-sm text-red-900">{formatDateTime(appointment.CancelledAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Approval Info */}
                        {appointment.ApprovedAt && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-green-900 mb-4">Approval Details</h2>
                                <div>
                                    <p className="text-sm font-medium text-green-700">Approved On</p>
                                    <p className="text-sm text-green-900">{formatDateTime(appointment.ApprovedAt)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Doctor Info & Actions */}
                    <div className="space-y-6">
                        {/* Doctor Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Doctor Information</h2>

                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Dr. {appointment.Doctor.User.Name}</h3>
                                <p className="text-sm text-gray-600">{appointment.Doctor.Specialty.Name}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                                    <span className="text-sm text-gray-900">{appointment.Doctor.User.Email}</span>
                                </div>

                                {appointment.Doctor.User.Phone && (
                                    <div className="flex items-center">
                                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                                        <span className="text-sm text-gray-900">{appointment.Doctor.User.Phone}</span>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                                        <div>
                                            <p className="font-medium">Experience</p>
                                            <p>{appointment.Doctor.Experience} years</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">License</p>
                                            <p>{appointment.Doctor.LicenseNumber}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-xs font-medium text-gray-600">Qualification</p>
                                        <p className="text-xs text-gray-900">{appointment.Doctor.Qualification}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>

                            <div className="space-y-3">
                                {canCancelAppointment(appointment) && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
                                    >
                                        Cancel Appointment
                                    </button>
                                )}

                                <button
                                    onClick={() => router.push('/patient/appointments')}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
                                >
                                    Back to All Appointments
                                </button>

                                <button
                                    onClick={() => router.push('/patient/book-appointment')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                                >
                                    Book New Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Cancel Appointment Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-start mb-4">
                            <div className="flex-shrink-0">
                                <X className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-black">Cancel Appointment</h3>
                                <p className="text-sm text-black mt-1">
                                    Are you sure you want to cancel your appointment with Dr. {appointment.Doctor.User.Name}?
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                                placeholder="Please provide a reason for cancellation..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
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
