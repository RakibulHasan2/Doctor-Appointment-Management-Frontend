'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    UserCheck,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    AlertCircle,
    Mail,
    Phone,
    DollarSign,
    Calendar,
    Eye
} from 'lucide-react';
import { apiService, Doctor, User as UserType } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminDoctorsPage() {
    const router = useRouter();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('All');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
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
        loadDoctors();
    }, [router]);

    useEffect(() => {
        filterDoctors();
    }, [doctors, searchTerm, selectedStatus]);

    const loadDoctors = async () => {
        try {
            const doctorData = await apiService.getDoctors();
            setDoctors(doctorData);
        } catch (error) {
            console.error('Error loading doctors:', error);
            toast.error('Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const filterDoctors = () => {
        let filtered = doctors;

        // Filter by status
        if (selectedStatus !== 'All') {
            if (selectedStatus === 'Approved') {
                filtered = filtered.filter(doctor => doctor.IsApproved);
            } else if (selectedStatus === 'Pending') {
                filtered = filtered.filter(doctor => !doctor.IsApproved);
            }
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(doctor =>
                doctor.User.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.User.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.LicenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.Specialty.Name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDoctors(filtered);
    };

    const handleDoctorApproval = async (doctorId: string, approve: boolean) => {
        try {
            if (approve) {
                await apiService.approveDoctor(doctorId);
                toast.success('Doctor approved successfully');
            } else {
                await apiService.rejectDoctor(doctorId);
                toast.success('Doctor rejected successfully');
            }
            loadDoctors();
        } catch (error) {
            console.error('Error updating doctor approval:', error);
            toast.error('Failed to update doctor approval');
        }
    };

    const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
        if (window.confirm(`Are you sure you want to delete Dr. ${doctorName}? This action cannot be undone.`)) {
            try {
                await apiService.deleteDoctor(doctorId);
                toast.success('Doctor deleted successfully');
                loadDoctors();
            } catch (error) {
                console.error('Error deleting doctor:', error);
                toast.error('Failed to delete doctor');
            }
        }
    };

    const getStatusColor = (isApproved: boolean) => {
        return isApproved
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800';
    };

    const getStatusIcon = (isApproved: boolean) => {
        return isApproved
            ? <CheckCircle className="h-4 w-4" />
            : <AlertCircle className="h-4 w-4" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading doctors...</p>
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
                                    <UserCheck className="h-6 w-6 text-blue-600 mr-2" />
                                    <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                Total Doctors: <span className="font-semibold text-black">{doctors.length}</span>
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
                                placeholder="Search by name, email, license, or specialty..."
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
                                <option value="Approved">Approved</option>
                                <option value="Pending">Pending Approval</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Doctors Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doctor) => (
                            <div key={doctor.Id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    {/* Doctor Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-lg font-medium text-blue-600">
                                                    {doctor.User.Name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-lg font-medium text-black">Dr. {doctor.User.Name}</h3>
                                                <p className="text-sm text-gray-600">{doctor.Specialty.Name}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doctor.IsApproved)}`}>
                                            {getStatusIcon(doctor.IsApproved)}
                                            <span className="ml-1">{doctor.IsApproved ? 'Approved' : 'Pending'}</span>
                                        </span>
                                    </div>

                                    {/* Doctor Details */}
                                    <div className="space-y-3 mb-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center">
                                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-black">{doctor.User.Email}</span>
                                            </div>
                                            {doctor.User.Phone && (
                                                <div className="flex items-center">
                                                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-black">{doctor.User.Phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center">
                                                <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-black">License: {doctor.LicenseNumber}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-black">{doctor.Experience} years exp.</span>
                                            </div>
                                            <div className="flex items-center">
                                                <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-black">${doctor.ConsultationFee}</span>
                                            </div>
                                        </div>

                                        {/* Qualifications */}
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Qualifications:</span>
                                            <p className="text-sm text-black mt-1 line-clamp-2">{doctor.Qualification}</p>
                                        </div>

                                        {/* Availability */}
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Availability:</span>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {doctor.Availability.filter(slot => slot.IsAvailable).map((slot, index) => (
                                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        {slot.DayOfWeek} {slot.StartTime.substring(0, 5)}-{slot.EndTime.substring(0, 5)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => setSelectedDoctor(doctor)}
                                            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View Details
                                        </button>

                                        {!doctor.IsApproved ? (
                                            <>
                                                <button
                                                    onClick={() => handleDoctorApproval(doctor.Id, true)}
                                                    className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleDoctorApproval(doctor.Id, false)}
                                                    className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleDeleteDoctor(doctor.UserId, doctor.User.Name)}
                                                className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-sm font-medium text-gray-900 mb-2">No doctors found</h3>
                                <p className="text-sm text-gray-500">
                                    {searchTerm || selectedStatus !== 'All'
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'No doctors have been registered yet.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                            {doctors.filter(d => d.IsApproved).length}
                        </div>
                        <div className="text-sm text-gray-600">Approved Doctors</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-yellow-600">
                            {doctors.filter(d => !d.IsApproved).length}
                        </div>
                        <div className="text-sm text-gray-600">Pending Approval</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">
                            {doctors.filter(d => d.IsActive).length}
                        </div>
                        <div className="text-sm text-gray-600">Active Doctors</div>
                    </div>
                </div>
            </div>

            {/* Doctor Details Modal */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Doctor Details</h2>
                                <button
                                    onClick={() => setSelectedDoctor(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <p className="text-black">Dr. {selectedDoctor.User.Name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Specialty</label>
                                        <p className="text-black">{selectedDoctor.Specialty.Name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="text-black">{selectedDoctor.User.Email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <p className="text-black">{selectedDoctor.User.Phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">License Number</label>
                                        <p className="text-black">{selectedDoctor.LicenseNumber}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Experience</label>
                                        <p className="text-black">{selectedDoctor.Experience} years</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Consultation Fee</label>
                                        <p className="text-black">${selectedDoctor.ConsultationFee}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedDoctor.IsApproved)}`}>
                                            {getStatusIcon(selectedDoctor.IsApproved)}
                                            <span className="ml-1">{selectedDoctor.IsApproved ? 'Approved' : 'Pending'}</span>
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
                                    <p className="text-black bg-gray-50 p-3 rounded-lg">{selectedDoctor.Qualification}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability Schedule</label>
                                    <div className="space-y-2">
                                        {selectedDoctor.Availability.map((slot, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-black font-medium">{slot.DayOfWeek}</span>
                                                <span className="text-black">
                                                    {slot.StartTime.substring(0, 5)} - {slot.EndTime.substring(0, 5)}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${slot.IsAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {slot.IsAvailable ? 'Available' : 'Not Available'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex space-x-2 pt-4">
                                    {!selectedDoctor.IsApproved && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    handleDoctorApproval(selectedDoctor.Id, true);
                                                    setSelectedDoctor(null);
                                                }}
                                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve Doctor
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleDoctorApproval(selectedDoctor.Id, false);
                                                    setSelectedDoctor(null);
                                                }}
                                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject Doctor
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
