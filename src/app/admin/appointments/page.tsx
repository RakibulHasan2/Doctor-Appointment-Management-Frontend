'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    User,
    DollarSign,
    Eye
} from 'lucide-react';
import { apiService, Appointment, User as UserType } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminAppointmentsPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('All');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);

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
        loadAppointments();
    }, [router]);

    useEffect(() => {
        filterAppointments();
    }, [appointments, searchTerm, selectedStatus]);

    const loadAppointments = async () => {
        try {
            const appointmentData = await apiService.getAppointments();
            setAppointments(appointmentData);
        } catch (error) {
            console.error('Error loading appointments:', error);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        let filtered = appointments;

        // Filter by status
        if (selectedStatus !== 'All') {
            filtered = filtered.filter(appointment => appointment.Status === selectedStatus);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(appointment =>
                appointment.Patient.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.Doctor.User.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.Doctor.Specialty.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (appointment.ReasonForVisit && appointment.ReasonForVisit.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredAppointments(filtered);
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
                return 'text-orange-600 bg-orange-100';
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
            case 'NoShow':
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5); // Convert "09:00:00" to "09:00"
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white shadow-sm rounded-lg mb-6">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <button
                                    onClick={() => router.push('/admin/dashboard')}
                                    className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <div className="flex items-center">
                                    <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                                    <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                Total Appointments: <span className="font-semibold text-black">{appointments.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white shadow-sm rounded-lg mb-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by patient, doctor, specialty, or reason..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Rejected">Rejected</option>
                                <option value="NoShow">No Show</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            Appointments ({filteredAppointments.length})
                        </h2>
                    </div>
                    
                    {filteredAppointments.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {filteredAppointments.map((appointment) => (
                                <div key={appointment.Id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Main Info */}
                                            <div className="flex items-center mb-3">
                                                <div className="flex items-center">
                                                    <User className="h-5 w-5 text-gray-400 mr-2" />
                                                    <span className="text-lg font-medium text-black">
                                                        {appointment.Patient.Name}
                                                    </span>
                                                    <span className="mx-2 text-gray-400">→</span>
                                                    <span className="text-lg font-medium text-black">
                                                        Dr. {appointment.Doctor.User.Name}
                                                    </span>
                                                </div>
                                                <span className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.Status)}`}>
                                                    {getStatusIcon(appointment.Status)}
                                                    <span className="ml-1">{appointment.Status}</span>
                                                </span>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-black">
                                                        {formatDate(appointment.AppointmentDate)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-black">
                                                        {formatTime(appointment.StartTime)} - {formatTime(appointment.EndTime)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-black">
                                                        {appointment.Doctor.Specialty.Name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-black">
                                                        ${appointment.ConsultationFee}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Patient: </span>
                                                    <span className="text-black">{appointment.Patient.Email}</span>
                                                    {appointment.Patient.Phone && (
                                                        <span className="text-black"> • {appointment.Patient.Phone}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Doctor: </span>
                                                    <span className="text-black">{appointment.Doctor.User.Email}</span>
                                                    {appointment.Doctor.User.Phone && (
                                                        <span className="text-black"> • {appointment.Doctor.User.Phone}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Reason & Notes */}
                                            {appointment.ReasonForVisit && (
                                                <div className="mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Reason: </span>
                                                    <span className="text-sm text-black">{appointment.ReasonForVisit}</span>
                                                </div>
                                            )}
                                            {appointment.Notes && (
                                                <div className="mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Notes: </span>
                                                    <span className="text-sm text-black">{appointment.Notes}</span>
                                                </div>
                                            )}
                                            {appointment.CancellationReason && (
                                                <div className="mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Cancellation Reason: </span>
                                                    <span className="text-sm text-red-600">{appointment.CancellationReason}</span>
                                                </div>
                                            )}

                                            {/* Timestamps */}
                                            <div className="text-xs text-gray-500 mt-2">
                                                <span>Created: {formatDate(appointment.CreatedAt)}</span>
                                                {appointment.ApprovedAt && (
                                                    <span className="ml-4">Approved: {formatDate(appointment.ApprovedAt)}</span>
                                                )}
                                                {appointment.CancelledAt && (
                                                    <span className="ml-4">Cancelled: {formatDate(appointment.CancelledAt)}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="ml-4">
                                            <button
                                                onClick={() => setSelectedAppointment(appointment)}
                                                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-sm font-medium text-gray-900 mb-2">No appointments found</h3>
                            <p className="text-sm text-gray-500">
                                {searchTerm || selectedStatus !== 'All' 
                                    ? 'Try adjusting your search or filter criteria.' 
                                    : 'No appointments have been scheduled yet.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-yellow-600">
                            {appointments.filter(a => a.Status === 'Pending').length}
                        </div>
                        <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                            {appointments.filter(a => a.Status === 'Approved').length}
                        </div>
                        <div className="text-sm text-gray-600">Approved</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">
                            {appointments.filter(a => a.Status === 'Completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-red-600">
                            {appointments.filter(a => a.Status === 'Cancelled').length}
                        </div>
                        <div className="text-sm text-gray-600">Cancelled</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-red-600">
                            {appointments.filter(a => a.Status === 'Rejected').length}
                        </div>
                        <div className="text-sm text-gray-600">Rejected</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-orange-600">
                            {appointments.filter(a => a.Status === 'NoShow').length}
                        </div>
                        <div className="text-sm text-gray-600">No Show</div>
                    </div>
                </div>
            </div>

            {/* Appointment Details Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
                                <button
                                    onClick={() => setSelectedAppointment(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Status */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700">Status</span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.Status)}`}>
                                        {getStatusIcon(selectedAppointment.Status)}
                                        <span className="ml-2">{selectedAppointment.Status}</span>
                                    </span>
                                </div>

                                {/* Appointment Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date</label>
                                        <p className="text-black">{formatDate(selectedAppointment.AppointmentDate)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Time</label>
                                        <p className="text-black">
                                            {formatTime(selectedAppointment.StartTime)} - {formatTime(selectedAppointment.EndTime)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Consultation Fee</label>
                                        <p className="text-black">${selectedAppointment.ConsultationFee}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Specialty</label>
                                        <p className="text-black">{selectedAppointment.Doctor.Specialty.Name}</p>
                                    </div>
                                </div>

                                {/* Patient Info */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Information</h3>
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <p className="text-black">{selectedAppointment.Patient.Name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <p className="text-black">{selectedAppointment.Patient.Email}</p>
                                        </div>
                                        {selectedAppointment.Patient.Phone && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                                <p className="text-black">{selectedAppointment.Patient.Phone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Doctor Info */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Doctor Information</h3>
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <p className="text-black">Dr. {selectedAppointment.Doctor.User.Name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <p className="text-black">{selectedAppointment.Doctor.User.Email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">License</label>
                                            <p className="text-black">{selectedAppointment.Doctor.LicenseNumber}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Experience</label>
                                            <p className="text-black">{selectedAppointment.Doctor.Experience} years</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Details */}
                                {selectedAppointment.ReasonForVisit && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                                        <p className="text-black bg-gray-50 p-3 rounded-lg">{selectedAppointment.ReasonForVisit}</p>
                                    </div>
                                )}

                                {selectedAppointment.Notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                        <p className="text-black bg-gray-50 p-3 rounded-lg">{selectedAppointment.Notes}</p>
                                    </div>
                                )}

                                {selectedAppointment.CancellationReason && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Reason</label>
                                        <p className="text-red-600 bg-red-50 p-3 rounded-lg">{selectedAppointment.CancellationReason}</p>
                                    </div>
                                )}

                                {/* Timestamps */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Created:</span>
                                            <span className="text-black">{formatDate(selectedAppointment.CreatedAt)}</span>
                                        </div>
                                        {selectedAppointment.ApprovedAt && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Approved:</span>
                                                <span className="text-black">{formatDate(selectedAppointment.ApprovedAt)}</span>
                                            </div>
                                        )}
                                        {selectedAppointment.CancelledAt && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Cancelled:</span>
                                                <span className="text-black">{formatDate(selectedAppointment.CancelledAt)}</span>
                                            </div>
                                        )}
                                        {selectedAppointment.ApprovedBy && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Approved By:</span>
                                                <span className="text-black">{selectedAppointment.ApprovedBy}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
