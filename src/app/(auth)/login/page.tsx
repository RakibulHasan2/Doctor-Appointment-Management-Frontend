'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserCheck } from 'lucide-react';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

const loginSchema = z.object({
    Email: z.string().email('Please enter a valid email address'),
    Password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await apiService.login(data);
            toast.success('Login successful!');
            console.log(response.User.Role)

            // Check if this is a redirect from doctor registration
            const redirect = searchParams.get('redirect');

            // Redirect based on user role
            const { Role } = response.User;
            switch (Role) {
                case 'Admin':
                    router.push('/admin/dashboard');
                    break;
                case 'Doctor':
                    if (redirect === 'doctor-setup') {
                        router.push('/doctor/setup');
                    } else {
                        router.push('/doctor/dashboard');
                    }
                    break;
                case 'Patient':
                    router.push('/patient/dashboard');
                    break;
                default:
                    router.push('/');
            }
        } catch (error: unknown) {
            console.error('Login error:', error);
            toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <UserCheck className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-black mb-2">Welcome Back</h1>
                    <p className="text-black">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="Email" className="block text-sm font-medium text-black mb-2">
                            Email Address
                        </label>
                        <input
                            {...register('Email')}
                            type="email"
                            id="Email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-black"
                            placeholder="Enter your email"
                        />
                        {errors.Email && (
                            <p className="mt-1 text-sm text-red-600">{errors.Email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="Password" className="block text-sm font-medium text-black mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                {...register('Password')}
                                type={showPassword ? 'text' : 'password'}
                                id="Password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 pr-12 text-black"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-black" />
                                ) : (
                                    <Eye className="h-5 w-5 text-black" />
                                )}
                            </button>
                        </div>
                        {errors.Password && (
                            <p className="mt-1 text-sm text-red-600">{errors.Password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-black">
                        Don&apos;t have an account?{' '}
                        <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
