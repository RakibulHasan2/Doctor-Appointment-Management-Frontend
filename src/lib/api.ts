import axios from 'axios';

// Utility function to convert time string to .NET Ticks
function timeStringToTicks(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    // .NET Ticks for time only (starting from midnight)
    // 1 tick = 100 nanoseconds, 1 second = 10,000,000 ticks
    const totalSeconds = hours * 3600 + minutes * 60;
    return totalSeconds * 10000000; // Convert to ticks
}

// User types based on backend API documentation
export interface User {
    Id: string;
    Name: string;
    Email: string;
    Role: 'Admin' | 'Doctor' | 'Patient';
    Phone?: string;
    IsActive: boolean;
    CreatedAt: string;
}

export interface LoginRequest {
    Email: string;
    Password: string;
}

export interface RegisterRequest {
    Name: string;
    Email: string;
    Password: string;
    ConfirmPassword: string;
    Role: 'Doctor' | 'Patient';
    Phone?: string;
}

export interface LoginResponse {
    User: User;
    Message: string;
}

export interface RegisterResponse {
    Id: string;
    Name: string;
    Email: string;
    Role: string;
    Phone?: string;
    IsActive: boolean;
    CreatedAt: string;
}

// Doctor types based on backend API
export interface Doctor {
    Id: string;
    UserId: string;
    User: User;
    SpecialtyId: string;
    Specialty: Specialty;
    LicenseNumber: string;
    Experience: number;
    Qualification: string;
    ConsultationFee: number;
    Availability: DoctorAvailability[];
    IsApproved: boolean;
    IsActive: boolean;
    CreatedAt: string;
}

export interface CreateDoctorRequest {
    UserId: string;
    SpecialtyId: string;
    LicenseNumber: string;
    Experience: number;
    Qualification: string;
    ConsultationFee: number;
    Availability: DoctorAvailability[];
}

export interface UpdateDoctorRequest {
    specialtyId?: string;
    licenseNumber?: string;
    experience?: number;
    qualification?: string;
    consultationFee?: number;
    availability?: DoctorAvailability[];
}

// Specialty types based on backend API
export interface Specialty {
    Id: string;
    Name: string;
    Description?: string;
    IsActive: boolean;
    CreatedAt: string;
}

export interface CreateSpecialtyRequest {
    Name: string;
    Description?: string;
}

export interface UpdateSpecialtyRequest {
    Name?: string;
    Description?: string;
    IsActive?: boolean;
}

// Doctor availability types
export interface DoctorAvailability {
    DayOfWeek: string;
    StartTime: string; // HH:MM:SS format
    EndTime: string;   // HH:MM:SS format
    IsAvailable: boolean;
}

export interface AvailableSlot {
    Date: string;
    StartTime: string;
    EndTime: string;
    IsAvailable: boolean;
}

// Appointment types based on backend API
export interface Appointment {
    Id: string;
    PatientId: string;
    Patient: User;
    DoctorId: string;
    Doctor: Doctor;
    AppointmentDate: string;
    StartTime: string;
    EndTime: string;
    Status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'NoShow';
    ReasonForVisit?: string;
    Notes?: string;
    ConsultationFee: number;
    CreatedAt: string;
    CancelledAt?: string;
    CancellationReason?: string;
    ApprovedAt?: string;
    ApprovedBy?: string;
}

export interface CreateAppointmentRequest {
    DoctorId: string;
    AppointmentDate: string;
    StartTime: string;
    EndTime: string;
    ReasonForVisit?: string;
}

export interface UpdateAppointmentRequest {
    AppointmentDate?: string;
    StartTime?: string;
    EndTime?: string;
    ReasonForVisit?: string;
    Notes?: string;
}

export interface UpdateAppointmentStatusRequest {
    Status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'NoShow';
    Notes?: string;
    CancellationReason?: string;
}

// API Response types
export interface ApiResponse<T> {
    Data: T;
    Message?: string;
}

export interface ApiError {
    Message: string;
    Errors?: Record<string, string[]>;
}

class ApiService {
    private api: ReturnType<typeof axios.create>;

    constructor() {
        this.api = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5289/api',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error: unknown) => {
                console.error('API Error:', error);
                return Promise.reject(error);
            }
        );
    }

    // Auth methods - Based on backend API (no JWT tokens)
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await this.api.post('/users/login', credentials);

        // Store user data in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.data.User));
        }

        return response.data;
    }

    async register(userData: RegisterRequest): Promise<RegisterResponse> {
        const response = await this.api.post('/users/register', userData);
        return response.data;
    } logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
        }
    }

    getCurrentUser(): User | null {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    }

    isAuthenticated(): boolean {
        return this.getCurrentUser() !== null;
    }

    // User methods
    async getUsers(): Promise<User[]> {
        const response = await this.api.get('/users');
        return response.data;
    }

    async getUserById(id: string): Promise<User> {
        const response = await this.api.get(`/users/${id}`);
        return response.data;
    }

    async getUsersByRole(role: string): Promise<User[]> {
        const response = await this.api.get(`/users/by-role/${role}`);
        return response.data;
    }

    async updateUser(id: string, userData: Partial<User>): Promise<User> {
        const response = await this.api.put(`/users/${id}`, userData);
        return response.data;
    }

    async deleteUser(id: string): Promise<void> {
        await this.api.delete(`/users/${id}`);
    }

    // Specialty methods
    async getSpecialties(): Promise<Specialty[]> {
        const response = await this.api.get('/specialties');
        return response.data;
    }

    async getActiveSpecialties(): Promise<Specialty[]> {
        const response = await this.api.get('/specialties/active');
        return response.data;
    }

    async getSpecialtyById(id: string): Promise<Specialty> {
        const response = await this.api.get(`/specialties/${id}`);
        return response.data;
    }

    async createSpecialty(specialtyData: CreateSpecialtyRequest): Promise<Specialty> {
        const response = await this.api.post('/specialties', specialtyData);
        return response.data;
    }

    async updateSpecialty(id: string, specialtyData: UpdateSpecialtyRequest): Promise<Specialty> {
        const response = await this.api.put(`/specialties/${id}`, specialtyData);
        return response.data;
    }

    async deleteSpecialty(id: string): Promise<void> {
        await this.api.delete(`/specialties/${id}`);
    }

    // Doctor methods
    async getDoctors(): Promise<Doctor[]> {
        const response = await this.api.get('/doctors');
        return response.data;
    }

    async getApprovedDoctors(): Promise<Doctor[]> {
        const response = await this.api.get('/doctors/approved');
        return response.data;
    }

    async getPendingApprovalDoctors(): Promise<Doctor[]> {
        const response = await this.api.get('/doctors/pending-approval');
        return response.data;
    }

    async getDoctorById(id: string): Promise<Doctor> {
        const response = await this.api.get(`/doctors/${id}`);
        return response.data;
    }

    async getDoctorByUserId(userId: string): Promise<Doctor> {
        const response = await this.api.get(`/doctors/user/${userId}`);
        return response.data;
    }

    async getDoctorsBySpecialty(specialtyId: string): Promise<Doctor[]> {
        const response = await this.api.get(`/doctors/specialty/${specialtyId}`);
        return response.data;
    }

    async getDoctorAvailableSlots(doctorId: string, date: string): Promise<AvailableSlot[]> {
        const response = await this.api.get(`/doctors/${doctorId}/available-slots?date=${date}`);
        return response.data;
    }

    async createDoctor(doctorData: CreateDoctorRequest): Promise<Doctor> {
        const response = await this.api.post('/doctors', doctorData);
        return response.data;
    }

    async updateDoctor(id: string, doctorData: UpdateDoctorRequest): Promise<Doctor> {
        const response = await this.api.put(`/doctors/${id}`, doctorData);
        return response.data;
    }

    async approveDoctor(id: string): Promise<void> {
        await this.api.patch(`/doctors/${id}/approve`);
    }

    async updateDoctorAvailability(id: string, availability: DoctorAvailability[]): Promise<void> {
        await this.api.patch(`/doctors/${id}/availability`, availability);
    }

    async deleteDoctor(id: string): Promise<void> {
        await this.api.delete(`/doctors/${id}`);
    }
    // Appointment methods
    async getAppointments(userId?: string, userRole?: string): Promise<Appointment[]> {
        let url = '/appointments';
        const params: string[] = [];
        if (userId) params.push(`userId=${userId}`);
        if (userRole) params.push(`userRole=${userRole}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const response = await this.api.get(url);
        return response.data;
    }

    async getAppointmentById(id: string): Promise<Appointment> {
        const response = await this.api.get(`/appointments/${id}`);
        return response.data;
    }

    async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
        const response = await this.api.get(`/appointments/patient/${patientId}`);
        return response.data;
    }

    async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
        const response = await this.api.get(`/appointments/doctor/${doctorId}`);
        return response.data;
    }

    async getPendingAppointments(): Promise<Appointment[]> {
        const response = await this.api.get('/appointments/pending');
        return response.data;
    }

    async getApprovedAppointments(): Promise<Appointment[]> {
        const response = await this.api.get('/appointments/approved');
        return response.data;
    }

    async searchAppointments(params: {
        patientId?: string;
        doctorId?: string;
        fromDate?: string;
        toDate?: string;
        status?: string;
        page?: number;
        pageSize?: number;
    }): Promise<Appointment[]> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value.toString());
            }
        });

        const response = await this.api.get(`/appointments/search?${queryParams.toString()}`);
        return response.data;
    }

    async createAppointment(patientId: string, appointmentData: CreateAppointmentRequest): Promise<Appointment> {
        const response = await this.api.post(`/appointments?patientId=${patientId}`, appointmentData);
        return response.data;
    }

    async updateAppointment(id: string, appointmentData: UpdateAppointmentRequest): Promise<Appointment> {
        const response = await this.api.put(`/appointments/${id}`, appointmentData);
        return response.data;
    }

    async updateAppointmentStatus(id: string, userId: string, statusData: UpdateAppointmentStatusRequest): Promise<Appointment> {
        const response = await this.api.patch(`/appointments/${id}/status?userId=${userId}`, statusData);
        return response.data;
    }

    async cancelAppointment(id: string, userId: string, reason: string): Promise<Appointment> {
        const response = await this.api.patch(`/appointments/${id}/cancel?userId=${userId}`, { reason });
        return response.data;
    }

    async deleteAppointment(id: string): Promise<void> {
        await this.api.delete(`/appointments/${id}`);
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
