'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    User,
    Mail,
    Phone,
    ArrowLeft,
    Save,
    Lock,
    Eye,
    EyeOff,
    CheckCircle
} from 'lucide-react';
import { apiService, User as UserType } from '@/lib/api';
import toast from 'react-hot-toast';

// Validation schemas
const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function PatientProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
    });

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
        
        // Pre-fill the form with current user data
        profileForm.reset({
            name: currentUser.Name,
            email: currentUser.Email,
            phone: currentUser.Phone || '',
        });
        
        setLoading(false);
    }, [router, profileForm]);

    const onSubmitProfile = async (data: ProfileFormData) => {
        if (!user) return;

        setSaving(true);
        try {
            const updatedUser = await apiService.updateUser(user.Id, {
                Name: data.name,
                Email: data.email,
                Phone: data.phone || undefined,
            });

            // Update localStorage with new user data
            const currentUser = apiService.getCurrentUser();
            if (currentUser) {
                const newUserData = { ...currentUser, ...updatedUser };
                localStorage.setItem('user', JSON.stringify(newUserData));
                setUser(newUserData);
            }

            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const onSubmitPassword = async (data: PasswordFormData) => {
        if (!user) return;

        setChangingPassword(true);
        try {
            // Note: Backend API expects different format, adjust as needed
            await apiService.changePassword(user.Id, {
                userId: user.Id,
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmNewPassword: data.confirmNewPassword,
            });

            toast.success('Password changed successfully');
            passwordForm.reset();
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
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
                            <User className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Profile Settings</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">{user?.Name}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Summary */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <User className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user?.Name}</h1>
                            <p className="text-gray-600">{user?.Email}</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Patient Account
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                    activeTab === 'profile'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <User className="h-4 w-4 inline mr-2" />
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                    activeTab === 'password'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Lock className="h-4 w-4 inline mr-2" />
                                Change Password
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Profile Information Tab */}
                        {activeTab === 'profile' && (
                            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name *
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input
                                                    {...profileForm.register('name')}
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            {profileForm.formState.errors.name && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {profileForm.formState.errors.name.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input
                                                    {...profileForm.register('email')}
                                                    type="email"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            {profileForm.formState.errors.email && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {profileForm.formState.errors.email.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number (Optional)
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input
                                                    {...profileForm.register('phone')}
                                                    type="tel"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>
                                            {profileForm.formState.errors.phone && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {profileForm.formState.errors.phone.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md font-medium flex items-center"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Change Password Tab */}
                        {activeTab === 'password' && (
                            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                                    <div className="space-y-4">
                                        {/* Current Password */}
                                        <div>
                                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password *
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input
                                                    {...passwordForm.register('currentPassword')}
                                                    type={showPasswords.current ? 'text' : 'password'}
                                                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('current')}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {passwordForm.formState.errors.currentPassword && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {passwordForm.formState.errors.currentPassword.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password *
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input
                                                    {...passwordForm.register('newPassword')}
                                                    type={showPasswords.new ? 'text' : 'password'}
                                                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {passwordForm.formState.errors.newPassword && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {passwordForm.formState.errors.newPassword.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Confirm New Password */}
                                        <div>
                                            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm New Password *
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input
                                                    {...passwordForm.register('confirmNewPassword')}
                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {passwordForm.formState.errors.confirmNewPassword && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {passwordForm.formState.errors.confirmNewPassword.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <h4 className="text-sm font-medium text-yellow-800 mb-2">Password Requirements:</h4>
                                        <ul className="text-xs text-yellow-700 space-y-1">
                                            <li>• At least 6 characters long</li>
                                            <li>• Must not be the same as your current password</li>
                                            <li>• Should contain a mix of letters, numbers, and symbols for better security</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={changingPassword}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md font-medium flex items-center"
                                    >
                                        <Lock className="h-4 w-4 mr-2" />
                                        {changingPassword ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
