'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users, Heart, Shield } from 'lucide-react';
import { apiService } from '@/lib/api';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is already logged in and redirect accordingly
        const user = apiService.getCurrentUser();
        if (user) {
            switch (user.role) {
                case 'Admin':
                    router.push('/admin/dashboard');
                    break;
                case 'Doctor':
                    router.push('/doctor/dashboard');
                    break;
                case 'Patient':
                    router.push('/patient/dashboard');
                    break;
                default:
                    break;
            }
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">
                                Doctor Appointment System
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                        Your Health,{' '}
                        <span className="text-blue-600">Our Priority</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Book appointments with qualified doctors easily and manage your healthcare journey with our comprehensive appointment management system.
                    </p>
                    <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                        <div className="rounded-md shadow">
                            <Link
                                href="/register"
                                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="flex justify-center">
                                <Users className="h-12 w-12 text-blue-600" />
                            </div>
                            <h3 className="mt-4 text-xl font-medium text-gray-900">For Patients</h3>
                            <p className="mt-2 text-gray-500">
                                Book appointments with qualified doctors, manage your medical history, and stay on top of your health.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center">
                                <Heart className="h-12 w-12 text-blue-600" />
                            </div>
                            <h3 className="mt-4 text-xl font-medium text-gray-900">For Doctors</h3>
                            <p className="mt-2 text-gray-500">
                                Manage your practice, schedule appointments, and provide better care to your patients with our tools.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center">
                                <Shield className="h-12 w-12 text-blue-600" />
                            </div>
                            <h3 className="mt-4 text-xl font-medium text-gray-900">Secure & Reliable</h3>
                            <p className="mt-2 text-gray-500">
                                Your health data is protected with enterprise-grade security and reliable infrastructure.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                            <div className="flex flex-col items-center">
                                <div className="bg-blue-100 rounded-full p-4 mb-4">
                                    <span className="text-blue-600 text-xl font-bold">1</span>
                                </div>
                                <h3 className="text-lg font-medium mb-2">Register</h3>
                                <p className="text-gray-600 text-center">
                                    Create your account as a patient or doctor
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-blue-100 rounded-full p-4 mb-4">
                                    <span className="text-blue-600 text-xl font-bold">2</span>
                                </div>
                                <h3 className="text-lg font-medium mb-2">Book</h3>
                                <p className="text-gray-600 text-center">
                                    Find and book appointments with available doctors
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-blue-100 rounded-full p-4 mb-4">
                                    <span className="text-blue-600 text-xl font-bold">3</span>
                                </div>
                                <h3 className="text-lg font-medium mb-2">Manage</h3>
                                <p className="text-gray-600 text-center">
                                    Track and manage your appointments and health records
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-500">
                        <p>&copy; 2025 Doctor Appointment System. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
