# Doctor Appointment Management System API Documentation

## Overview
The Doctor Appointment Management System API provides a comprehensive RESTful service for managing appointments between patients and doctors. This system is built with ASP.NET Core Web API and uses MongoDB as the database.

## Base URL
```
Development: http://localhost:5289/
Production: [Your Production URL]
```

## Authentication
**Note**: This API does not use JWT authentication. All endpoints are currently accessible without authentication headers.

## HTTP Status Codes
- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required (if implemented)
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## User Roles
- **Admin**: Can manage all users, doctors, specialties, and appointments
- **Doctor**: Can manage their profile, availability, and view their appointments
- **Patient**: Can book, update, and cancel their appointments

---

## API Endpoints

### 1. Users Management

#### 1.1 Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123",
  "role": "Patient",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "id": "64abc123def456789",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "Patient",
  "phone": "+1234567890",
  "isActive": true,
  "createdAt": "2025-09-04T10:30:00Z"
}
```

#### 1.2 User Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "64abc123def456789",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "Patient",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2025-09-04T10:30:00Z"
  },
  "message": "Login successful"
}
```

#### 1.3 Get All Users
```http
GET /api/users
```

#### 1.4 Get User by ID
```http
GET /api/users/{id}
```

#### 1.5 Update User
```http
PUT /api/users/{id}
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1234567891",
  "isActive": true
}
```

#### 1.6 Change Password
```http
POST /api/users/{id}/change-password
Content-Type: application/json

{
  "userId": "64abc123def456789",
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456",
  "confirmNewPassword": "NewPassword456"
}
```

#### 1.7 Delete User (Soft Delete)
```http
DELETE /api/users/{id}
```

#### 1.8 Get Users by Role
```http
GET /api/users/by-role/{role}
```

---

### 2. Specialties Management

#### 2.1 Get All Specialties
```http
GET /api/specialties
```

**Response:**
```json
[
  {
    "id": "64spec123def456789",
    "name": "Cardiology",
    "description": "Heart and cardiovascular system",
    "isActive": true,
    "createdAt": "2025-09-04T09:00:00Z"
  }
]
```

#### 2.2 Get Specialty by ID
```http
GET /api/specialties/{id}
```

#### 2.3 Create Specialty
```http
POST /api/specialties
Content-Type: application/json

{
  "name": "Cardiology",
  "description": "Heart and cardiovascular system"
}
```

#### 2.4 Update Specialty
```http
PUT /api/specialties/{id}
Content-Type: application/json

{
  "name": "Cardiology Updated",
  "description": "Heart and cardiovascular system - updated",
  "isActive": true
}
```

#### 2.5 Delete Specialty
```http
DELETE /api/specialties/{id}
```

#### 2.6 Get Active Specialties
```http
GET /api/specialties/active
```

---

### 3. Doctors Management

#### 3.1 Get All Doctors
```http
GET /api/doctors
```

**Response:**
```json
[
  {
    "id": "64doc123def456789",
    "userId": "64user123def456789",
    "specialtyId": "64spec123def456789",
    "licenseNumber": "MD123456",
    "experience": 10,
    "qualification": "MBBS, MD",
    "consultationFee": 150.00,
    "availability": [
      {
        "dayOfWeek": "Monday",
        "startTime": "09:00:00",
        "endTime": "17:00:00",
        "isAvailable": true
      }
    ],
    "isApproved": true,
    "isActive": true,
    "createdAt": "2025-09-04T08:00:00Z",
    "user": {
      "id": "64user123def456789",
      "name": "Dr. Jane Smith",
      "email": "dr.jane@example.com",
      "role": "Doctor",
      "phone": "+1234567890",
      "isActive": true,
      "createdAt": "2025-09-04T08:00:00Z"
    },
    "specialty": {
      "id": "64spec123def456789",
      "name": "Cardiology",
      "description": "Heart and cardiovascular system",
      "isActive": true,
      "createdAt": "2025-09-04T07:00:00Z"
    }
  }
]
```

#### 3.2 Get Doctor by ID
```http
GET /api/doctors/{id}
```

#### 3.3 Get Doctors by Specialty
```http
GET /api/doctors/specialty/{specialtyId}
```

#### 3.4 Get Doctor's Available Slots
```http
GET /api/doctors/{id}/available-slots?date=2025-09-04
```

**Response:**
```json
[
  {
    "date": "2025-09-04T00:00:00Z",
    "startTime": "09:00:00",
    "endTime": "09:30:00",
    "isAvailable": true
  },
  {
    "date": "2025-09-04T00:00:00Z",
    "startTime": "09:30:00",
    "endTime": "10:00:00",
    "isAvailable": false
  }
]
```

#### 3.5 Create Doctor Profile
```http
POST /api/doctors
Content-Type: application/json

{
  "userId": "64user123def456789",
  "specialtyId": "64spec123def456789",
  "licenseNumber": "MD123456",
  "experience": 10,
  "qualification": "MBBS, MD",
  "consultationFee": 150.00,
  "availability": [
    {
      "dayOfWeek": "Monday",
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "isAvailable": true
    }
  ]
}
```

#### 3.6 Update Doctor Profile
```http
PUT /api/doctors/{id}
Content-Type: application/json

{
  "specialtyId": "64spec123def456789",
  "licenseNumber": "MD123456",
  "experience": 12,
  "qualification": "MBBS, MD, PhD",
  "consultationFee": 200.00,
  "availability": [
    {
      "dayOfWeek": "Monday",
      "startTime": "08:00:00",
      "endTime": "16:00:00",
      "isAvailable": true
    }
  ]
}
```

#### 3.7 Approve Doctor
```http
PATCH /api/doctors/{id}/approve
```

#### 3.8 Update Doctor Availability
```http
PATCH /api/doctors/{id}/availability
Content-Type: application/json

[
  {
    "dayOfWeek": "Monday",
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "isAvailable": true
  },
  {
    "dayOfWeek": "Tuesday",
    "startTime": "10:00:00",
    "endTime": "18:00:00",
    "isAvailable": true
  }
]
```

#### 3.9 Get Doctor by User ID
```http
GET /api/doctors/user/{userId}
```

#### 3.10 Get Approved Doctors
```http
GET /api/doctors/approved
```

#### 3.11 Get Pending Approval Doctors
```http
GET /api/doctors/pending-approval
```

#### 3.12 Delete Doctor
```http
DELETE /api/doctors/{id}
```

---

### 4. Appointments Management

#### 4.1 Get Appointments
```http
GET /api/appointments?userId={userId}&userRole={userRole}
```

**Query Parameters:**
- `userId` (optional): Filter by specific user
- `userRole` (optional): Filter by user role (Patient, Doctor, Admin)

#### 4.2 Get Appointment by ID
```http
GET /api/appointments/{id}
```

**Response:**
```json
{
  "id": "64appt123def456789",
  "patientId": "64patient123def456789",
  "doctorId": "64doctor123def456789",
  "appointmentDate": "2025-09-05T00:00:00Z",
  "startTime": "09:00:00",
  "endTime": "09:30:00",
  "status": "Pending",
  "reasonForVisit": "Regular checkup",
  "notes": null,
  "consultationFee": 150.00,
  "createdAt": "2025-09-04T14:30:00Z",
  "cancelledAt": null,
  "cancellationReason": null,
  "approvedAt": null,
  "approvedBy": null,
  "patient": {
    "id": "64patient123def456789",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "Patient",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2025-09-04T10:30:00Z"
  },
  "doctor": {
    "id": "64doctor123def456789",
    "userId": "64user123def456789",
    "specialtyId": "64spec123def456789",
    "licenseNumber": "MD123456",
    "experience": 10,
    "qualification": "MBBS, MD",
    "consultationFee": 150.00,
    "availability": [],
    "isApproved": true,
    "isActive": true,
    "createdAt": "2025-09-04T08:00:00Z",
    "user": {
      "id": "64user123def456789",
      "name": "Dr. Jane Smith",
      "email": "dr.jane@example.com",
      "role": "Doctor",
      "phone": "+1234567890",
      "isActive": true,
      "createdAt": "2025-09-04T08:00:00Z"
    },
    "specialty": {
      "id": "64spec123def456789",
      "name": "Cardiology",
      "description": "Heart and cardiovascular system",
      "isActive": true,
      "createdAt": "2025-09-04T07:00:00Z"
    }
  }
}
```

#### 4.3 Create Appointment
```http
POST /api/appointments?patientId={patientId}
Content-Type: application/json

{
  "doctorId": "64doctor123def456789",
  "appointmentDate": "2025-09-05T00:00:00Z",
  "startTime": "09:00:00",
  "endTime": "09:30:00",
  "reasonForVisit": "Regular checkup"
}
```

#### 4.4 Update Appointment
```http
PUT /api/appointments/{id}
Content-Type: application/json

{
  "appointmentDate": "2025-09-06T00:00:00Z",
  "startTime": "10:00:00",
  "endTime": "10:30:00",
  "reasonForVisit": "Follow-up consultation",
  "notes": "Patient requested time change"
}
```

#### 4.5 Update Appointment Status
```http
PATCH /api/appointments/{id}/status?userId={userId}
Content-Type: application/json

{
  "status": "Approved",
  "notes": "Appointment confirmed by doctor",
  "cancellationReason": null
}
```

**Appointment Status Values:**
- `Pending`
- `Approved`
- `Rejected`
- `Cancelled`
- `Completed`
- `NoShow`

#### 4.6 Cancel Appointment
```http
PATCH /api/appointments/{id}/cancel?userId={userId}
Content-Type: application/json

{
  "reason": "Patient emergency - need to reschedule"
}
```

#### 4.7 Search Appointments
```http
GET /api/appointments/search?patientId={patientId}&doctorId={doctorId}&fromDate={fromDate}&toDate={toDate}&status={status}&page={page}&pageSize={pageSize}
```

**Query Parameters:**
- `patientId` (optional): Filter by patient ID
- `doctorId` (optional): Filter by doctor ID
- `fromDate` (optional): Start date filter (YYYY-MM-DD)
- `toDate` (optional): End date filter (YYYY-MM-DD)
- `status` (optional): Appointment status
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)

#### 4.8 Get Patient Appointments
```http
GET /api/appointments/patient/{patientId}
```

#### 4.9 Get Doctor Appointments
```http
GET /api/appointments/doctor/{doctorId}
```

#### 4.10 Get Pending Appointments
```http
GET /api/appointments/pending
```

#### 4.11 Get Approved Appointments
```http
GET /api/appointments/approved
```

#### 4.12 Delete Appointment
```http
DELETE /api/appointments/{id}
```

---

## Data Models

### User Model
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "role": "Admin|Doctor|Patient",
  "phone": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "isActive": "boolean"
}
```

### Doctor Model
```json
{
  "id": "string",
  "userId": "string",
  "specialtyId": "string",
  "licenseNumber": "string",
  "experience": "number",
  "qualification": "string",
  "consultationFee": "decimal",
  "availability": [
    {
      "dayOfWeek": "Monday|Tuesday|...",
      "startTime": "timespan",
      "endTime": "timespan",
      "isAvailable": "boolean"
    }
  ],
  "isApproved": "boolean",
  "isActive": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Specialty Model
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "isActive": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Appointment Model
```json
{
  "id": "string",
  "patientId": "string",
  "doctorId": "string",
  "appointmentDate": "datetime",
  "startTime": "timespan",
  "endTime": "timespan",
  "status": "Pending|Approved|Rejected|Cancelled|Completed|NoShow",
  "reasonForVisit": "string",
  "notes": "string",
  "consultationFee": "decimal",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "cancelledAt": "datetime",
  "cancellationReason": "string",
  "approvedAt": "datetime",
  "approvedBy": "string"
}
```

---

## Error Handling

### Error Response Format
```json
{
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "timestamp": "2025-09-04T15:30:00Z"
}
```

### Common Error Codes
- `USER_NOT_FOUND` - User does not exist
- `DOCTOR_NOT_FOUND` - Doctor does not exist
- `APPOINTMENT_NOT_FOUND` - Appointment does not exist
- `SPECIALTY_NOT_FOUND` - Specialty does not exist
- `INVALID_CREDENTIALS` - Login credentials are incorrect
- `EMAIL_ALREADY_EXISTS` - Email is already registered
- `APPOINTMENT_CONFLICT` - Time slot is already booked
- `INVALID_TIME_SLOT` - Requested time is not available
- `DOCTOR_NOT_APPROVED` - Doctor is not approved to take appointments

---

## Business Rules

### User Registration
- Email must be unique across all users
- Password must meet minimum security requirements
- Phone number format validation

### Doctor Registration
- User must have "Doctor" role
- License number must be provided and unique
- Must be approved by Admin before taking appointments

### Appointment Booking
- Patients can only book with approved doctors
- Appointments must be in the future
- Time slots must not conflict with existing appointments
- Doctor must be available on the requested day and time

### Appointment Management
- Only Admins can approve/reject appointments
- Patients can update their own appointments (if not approved yet)
- Doctors can view and update status of their appointments
- Appointments can be cancelled by Patient, Doctor, or Admin

---

## Database Collections

### MongoDB Collections
1. **Users** - Stores all user information (Admin, Doctor, Patient)
2. **Doctors** - Stores doctor-specific information and links to Users
3. **Specialties** - Stores medical specialties
4. **Appointments** - Stores all appointment information

### Collection Relationships
- Doctor → User (userId reference)
- Doctor → Specialty (specialtyId reference)
- Appointment → User (patientId reference)
- Appointment → Doctor (doctorId reference)

---

## Testing

### Postman Collection
A complete Postman collection is available with all endpoints, example requests, and test cases.

### Test Scenarios
1. **User Management**: Registration, login, profile updates
2. **Doctor Management**: Profile creation, approval workflow
3. **Appointment Booking**: Complete booking flow from search to confirmation
4. **Status Updates**: Appointment approval/rejection workflow
5. **Error Handling**: Invalid requests and edge cases

---

## Deployment

### Requirements
- .NET 8.0 Runtime
- MongoDB Server
- IIS or Kestrel Web Server

### Configuration
Update `appsettings.json` with appropriate values:
- MongoDB connection string
- CORS allowed origins
- Logging levels

### Health Check
```http
GET /health
```

Returns system health status and timestamp.

---

## Future Enhancements

1. **Notifications**: SMS/Email notifications for appointments
2. **Real-time Updates**: SignalR for live appointment updates
3. **Payment Integration**: Online payment for consultations
4. **Video Consultation**: Integration with video calling services
5. **Analytics Dashboard**: Reporting and analytics for Admins
6. **Mobile API**: Optimized endpoints for mobile applications
7. **Calendar Integration**: Google Calendar/Outlook integration
8. **Review System**: Patient reviews and ratings for doctors
