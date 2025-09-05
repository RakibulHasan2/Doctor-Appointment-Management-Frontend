'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { apiService, RegisterRequest } from '@/lib/api';
import toast from 'react-hot-toast';

const registerSchema = z.object({
    Name: z.string().min(2, 'Name must be at least 2 characters'),
    Email: z.string().email('Please enter a valid email address'),
    Password: z.string().min(6, 'Password must be at least 6 characters'),
    ConfirmPassword: z.string().min(6, 'Please confirm your password'),
    Role: z.enum(['Patient', 'Doctor']),
    Phone: z.string().optional(),
}).refine((data) => data.Password === data.ConfirmPassword, {
    message: 'Passwords do not match',
    path: ['ConfirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            await apiService.register(data as RegisterRequest);

            if (data.Role === 'Doctor') {
                toast.success('Registration successful! Please complete your doctor profile.');
                router.push('/login?redirect=doctor-setup');
            } else {
                toast.success('Registration successful! Please log in.');
                router.push('/login');
            }
        } catch (error: unknown) {
            console.error('Registration error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <UserPlus className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join our healthcare platform</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="Name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            {...register('Name')}
                            type="text"
                            id="Name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-black"
                            placeholder="Enter your full name"
                        />
                        {errors.Name && (
                            <p className="mt-1 text-sm text-red-600">{errors.Name.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="Email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            {...register('Email')}
                            type="email"
                            id="Email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-black"
                            placeholder="Enter your email"
                        />
                        {errors.Email && (
                            <p className="mt-1 text-sm text-red-600">{errors.Email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="Phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number (Optional)
                        </label>
                        <input
                            {...register('Phone')}
                            type="tel"
                            id="Phone"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-black"
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div>
                        <label htmlFor="Role" className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            {...register('Role')}
                            id="Role"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-black"
                        >
                            <option value="">Select your role</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Patient">Patient</option>
                        </select>
                        {errors.Role && (
                            <p className="mt-1 text-sm text-red-600">{errors.Role.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="Password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                {...register('Password')}
                                type={showPassword ? 'text' : 'password'}
                                id="Password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 pr-12 text-black"
                                placeholder="Create a password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                        {errors.Password && (
                            <p className="mt-1 text-sm text-red-600">{errors.Password.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="ConfirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                {...register('ConfirmPassword')}
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="ConfirmPassword"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 pr-12 text-black"
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                        {errors.ConfirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.ConfirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
