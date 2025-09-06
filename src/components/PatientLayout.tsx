'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Calendar,
    Plus,
    User,
    Clock,
    LogOut,
    Menu,
    X,
    Bell
} from 'lucide-react';
import { apiService, User as UserType } from '@/lib/api';

interface PatientLayoutProps {
    children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserType | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
    }, [router]);

    const handleLogout = () => {
        apiService.logout();
        router.push('/');
    };

    const navigation = [
        {
            name: 'Dashboard',
            href: '/patient/dashboard',
            icon: Calendar,
            current: pathname === '/patient/dashboard'
        },
        {
            name: 'Book Appointment',
            href: '/patient/book-appointment',
            icon: Plus,
            current: pathname === '/patient/book-appointment'
        },
        {
            name: 'My Appointments',
            href: '/patient/appointments',
            icon: Clock,
            current: pathname.startsWith('/patient/appointments')
        },
        {
            name: 'Profile',
            href: '/patient/profile',
            icon: User,
            current: pathname === '/patient/profile'
        }
    ];

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                    </div>
                    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                        <div className="flex-shrink-0 flex items-center px-4">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Patient Portal</span>
                        </div>
                        <nav className="mt-5 px-2 space-y-1">
                            {navigation.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        router.push(item.href);
                                        setSidebarOpen(false);
                                    }}
                                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full text-left ${
                                        item.current
                                            ? 'bg-blue-100 text-blue-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <item.icon
                                        className={`mr-4 flex-shrink-0 h-6 w-6 ${
                                            item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                    />
                                    {item.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700">{user.Name}</p>
                                <p className="text-xs font-medium text-gray-500">Patient</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Patient Portal</span>
                        </div>
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            {navigation.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => router.push(item.href)}
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                                        item.current
                                            ? 'bg-blue-100 text-blue-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <item.icon
                                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                                            item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                    />
                                    {item.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <div className="flex items-center w-full">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-700">{user.Name}</p>
                                <p className="text-xs font-medium text-gray-500">Patient</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="ml-2 p-1 text-gray-400 hover:text-red-600"
                                title="Logout"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64 flex flex-col flex-1">
                {/* Top bar for mobile */}
                <div className="md:hidden bg-white shadow-sm">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="flex items-center space-x-4">
                                <button className="p-2 text-gray-400 hover:text-gray-500">
                                    <Bell className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-600"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
