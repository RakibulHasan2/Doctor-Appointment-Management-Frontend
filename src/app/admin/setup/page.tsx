'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

const DEFAULT_SPECIALTIES = [
    { Name: 'Cardiology', Description: 'Heart and cardiovascular system specialist' },
    { Name: 'Dermatology', Description: 'Skin, hair, and nail disorders' },
    { Name: 'General Medicine', Description: 'General medical care and family practice' },
    { Name: 'Neurology', Description: 'Nervous system and brain disorders' },
    { Name: 'Orthopedics', Description: 'Bone, joint, and muscle disorders' },
    { Name: 'Pediatrics', Description: 'Medical care for infants, children, and adolescents' },
    { Name: 'Psychiatry', Description: 'Mental health and behavioral disorders' },
    { Name: 'Surgery', Description: 'Surgical procedures and operations' },
];

export default function AdminSetupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [specialties, setSpecialties] = useState<any[]>([]);

    useEffect(() => {
        loadSpecialties();
    }, []);

    const loadSpecialties = async () => {
        try {
            const data = await apiService.getSpecialties();
            setSpecialties(data);
        } catch (error) {
            console.error('Error loading specialties:', error);
        }
    };

    const createDefaultSpecialties = async () => {
        setIsLoading(true);
        try {
            let createdCount = 0;

            for (const specialty of DEFAULT_SPECIALTIES) {
                try {
                    await apiService.createSpecialty(specialty);
                    createdCount++;
                } catch (error) {
                    console.error(`Error creating specialty ${specialty.Name}:`, error);
                }
            }

            toast.success(`Created ${createdCount} specialties successfully!`);
            loadSpecialties();
        } catch (error) {
            console.error('Error creating specialties:', error);
            toast.error('Failed to create specialties');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">System Setup</h1>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Medical Specialties</h2>
                            <p className="text-gray-600 mb-4">
                                Current specialties: {specialties.length}
                            </p>

                            {specialties.length === 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <h3 className="text-yellow-800 font-medium">No specialties found</h3>
                                    <p className="text-yellow-700 text-sm">
                                        The system needs medical specialties for doctors to register.
                                        Click the button below to create default specialties.
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={createDefaultSpecialties}
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </div>
                                ) : (
                                    'Create Default Specialties'
                                )}
                            </button>
                        </div>

                        {specialties.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Existing Specialties</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {specialties.map((specialty) => (
                                        <div key={specialty.Id} className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-900">{specialty.Name}</h4>
                                            <p className="text-sm text-gray-600">{specialty.Description}</p>
                                            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${specialty.IsActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {specialty.IsActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
