'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Users,
    Search,
    Filter,
    UserCheck,
    UserX,
    Trash2,
    Mail,
    Phone
} from 'lucide-react';
import { apiService, User as UserType } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserType[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('All');
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
        loadUsers();
    }, [router]);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, selectedRole]);

    const loadUsers = async () => {
        try {
            const userData = await apiService.getUsers();
            setUsers(userData);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Filter by role
        if (selectedRole !== 'All') {
            filtered = filtered.filter(user => user.Role === selectedRole);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.Phone && user.Phone.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredUsers(filtered);
    };

    const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await apiService.updateUser(userId, { IsActive: !currentStatus });
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            loadUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error('Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            try {
                await apiService.deleteUser(userId);
                toast.success('User deleted successfully');
                loadUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-purple-100 text-purple-800';
            case 'Doctor':
                return 'bg-blue-100 text-blue-800';
            case 'Patient':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
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
                                    <Users className="h-6 w-6 text-blue-600 mr-2" />
                                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                Total Users: <span className="font-semibold text-black">{users.length}</span>
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
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                            >
                                <option value="All">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Doctor">Doctor</option>
                                <option value="Patient">Patient</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            Users ({filteredUsers.length})
                        </h2>
                    </div>

                    {filteredUsers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.Id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-blue-600">
                                                                {user.Name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-black">{user.Name}</div>
                                                        <div className="text-sm text-gray-500">{user.Email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.Role)}`}>
                                                    {user.Role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-black">
                                                    <div className="flex items-center mb-1">
                                                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                                        {user.Email}
                                                    </div>
                                                    {user.Phone && (
                                                        <div className="flex items-center">
                                                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                                            {user.Phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.IsActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                                {new Date(user.CreatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleToggleUserStatus(user.Id, user.IsActive)}
                                                        className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${user.IsActive
                                                                ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                                                : 'text-green-700 bg-green-100 hover:bg-green-200'
                                                            } transition-colors`}
                                                    >
                                                        {user.IsActive ? (
                                                            <>
                                                                <UserX className="h-3 w-3 mr-1" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck className="h-3 w-3 mr-1" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.Id, user.Name)}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-sm font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-sm text-gray-500">
                                {searchTerm || selectedRole !== 'All'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'No users have been registered yet.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">
                            {users.filter(u => u.Role === 'Admin').length}
                        </div>
                        <div className="text-sm text-gray-600">Admins</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                            {users.filter(u => u.Role === 'Doctor').length}
                        </div>
                        <div className="text-sm text-gray-600">Doctors</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">
                            {users.filter(u => u.Role === 'Patient').length}
                        </div>
                        <div className="text-sm text-gray-600">Patients</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-red-600">
                            {users.filter(u => !u.IsActive).length}
                        </div>
                        <div className="text-sm text-gray-600">Inactive</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
