# Test Scenarios for Doctor Appointment Management System

## Test Environment Setup

### Prerequisites
1. MongoDB running locally on port 27017
2. .NET 8.0 SDK installed
3. API running on https://localhost:7001
4. Postman or similar API testing tool
5. Sample data loaded as per Database_Setup.md

## 1. User Management Tests

### 1.1 User Registration Tests

#### Test Case 1.1.1: Successful Patient Registration
**Endpoint:** `POST /api/users/register`
**Input:**
```json
{
  "name": "Test Patient",
  "email": "test.patient@example.com",
  "password": "TestPassword123",
  "confirmPassword": "TestPassword123", 
  "role": "Patient",
  "phone": "+1234567896"
}
```
**Expected Result:** 
- Status: 201 Created
- Response contains user ID and details
- Password is hashed in database

#### Test Case 1.1.2: Duplicate Email Registration
**Endpoint:** `POST /api/users/register`
**Input:** Same email as existing user
**Expected Result:**
- Status: 400 Bad Request
- Error message: "User with this email already exists"

#### Test Case 1.1.3: Password Mismatch
**Endpoint:** `POST /api/users/register`
**Input:** `password` != `confirmPassword`
**Expected Result:**
- Status: 400 Bad Request
- Error message: "Passwords do not match"

#### Test Case 1.1.4: Invalid Email Format
**Endpoint:** `POST /api/users/register`
**Input:** Invalid email format
**Expected Result:**
- Status: 400 Bad Request
- Validation error for email field

### 1.2 User Login Tests

#### Test Case 1.2.1: Successful Login
**Endpoint:** `POST /api/users/login`
**Input:**
```json
{
  "email": "john.doe@example.com",
  "password": "patient123"
}
```
**Expected Result:**
- Status: 200 OK
- Response contains user details and success message

#### Test Case 1.2.2: Invalid Credentials
**Endpoint:** `POST /api/users/login`
**Input:** Wrong password
**Expected Result:**
- Status: 401 Unauthorized
- Error message: "Invalid email or password"

#### Test Case 1.2.3: Non-existent User
**Endpoint:** `POST /api/users/login`
**Input:** Email not in database
**Expected Result:**
- Status: 401 Unauthorized
- Error message: "Invalid email or password"

### 1.3 User Management Tests

#### Test Case 1.3.1: Get All Users
**Endpoint:** `GET /api/users`
**Expected Result:**
- Status: 200 OK
- Returns list of all active users

#### Test Case 1.3.2: Get User by ID
**Endpoint:** `GET /api/users/{validUserId}`
**Expected Result:**
- Status: 200 OK
- Returns specific user details

#### Test Case 1.3.3: Get Non-existent User
**Endpoint:** `GET /api/users/{invalidUserId}`
**Expected Result:**
- Status: 404 Not Found
- Error message: "User not found"

## 2. Specialty Management Tests

### 2.1 Specialty CRUD Tests

#### Test Case 2.1.1: Create Specialty
**Endpoint:** `POST /api/specialties`
**Input:**
```json
{
  "name": "Psychiatry",
  "description": "Mental health and disorders"
}
```
**Expected Result:**
- Status: 201 Created
- Returns created specialty with ID

#### Test Case 2.1.2: Duplicate Specialty Name
**Endpoint:** `POST /api/specialties`
**Input:** Existing specialty name
**Expected Result:**
- Status: 400 Bad Request
- Error message: "Specialty with this name already exists"

#### Test Case 2.1.3: Get All Specialties
**Endpoint:** `GET /api/specialties`
**Expected Result:**
- Status: 200 OK
- Returns list of active specialties

#### Test Case 2.1.4: Update Specialty
**Endpoint:** `PUT /api/specialties/{specialtyId}`
**Input:**
```json
{
  "name": "Updated Specialty Name",
  "description": "Updated description"
}
```
**Expected Result:**
- Status: 200 OK
- Returns updated specialty

## 3. Doctor Management Tests

### 3.1 Doctor Profile Tests

#### Test Case 3.1.1: Create Doctor Profile
**Endpoint:** `POST /api/doctors`
**Prerequisites:** Valid user with Doctor role exists
**Input:**
```json
{
  "userId": "{doctorUserId}",
  "specialtyId": "{specialtyId}",
  "licenseNumber": "MD789012",
  "experience": 5,
  "qualification": "MBBS",
  "consultationFee": 100.00,
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
**Expected Result:**
- Status: 201 Created
- Doctor profile created with isApproved: false

#### Test Case 3.1.2: Duplicate Doctor Profile
**Endpoint:** `POST /api/doctors`
**Input:** Same userId as existing doctor
**Expected Result:**
- Status: 400 Bad Request
- Error message: "Doctor profile already exists for this user"

#### Test Case 3.1.3: Non-existent User ID
**Endpoint:** `POST /api/doctors`
**Input:** Invalid userId
**Expected Result:**
- Status: 400 Bad Request
- Error message: "User not found or not a doctor"

#### Test Case 3.1.4: Get Doctors by Specialty
**Endpoint:** `GET /api/doctors/specialty/{specialtyId}`
**Expected Result:**
- Status: 200 OK
- Returns only approved doctors in that specialty

#### Test Case 3.1.5: Doctor Approval
**Endpoint:** `PATCH /api/doctors/{doctorId}/approve`
**Expected Result:**
- Status: 200 OK
- Doctor's isApproved status changes to true

#### Test Case 3.1.6: Get Available Slots
**Endpoint:** `GET /api/doctors/{doctorId}/available-slots?date=2025-09-10`
**Expected Result:**
- Status: 200 OK
- Returns available time slots for the specified date

### 3.2 Doctor Availability Tests

#### Test Case 3.2.1: Update Availability
**Endpoint:** `PATCH /api/doctors/{doctorId}/availability`
**Input:**
```json
[
  {
    "dayOfWeek": "Monday",
    "startTime": "08:00:00",
    "endTime": "16:00:00",
    "isAvailable": true
  }
]
```
**Expected Result:**
- Status: 200 OK
- Availability updated successfully

## 4. Appointment Management Tests

### 4.1 Appointment Booking Tests

#### Test Case 4.1.1: Successful Appointment Booking
**Endpoint:** `POST /api/appointments?patientId={patientId}`
**Prerequisites:** 
- Approved doctor exists
- Patient user exists
- Requested time slot is available
**Input:**
```json
{
  "doctorId": "{approvedDoctorId}",
  "appointmentDate": "2025-09-15T00:00:00Z",
  "startTime": "10:00:00",
  "endTime": "10:30:00",
  "reasonForVisit": "Regular checkup"
}
```
**Expected Result:**
- Status: 201 Created
- Appointment created with status: Pending

#### Test Case 4.1.2: Booking with Unapproved Doctor
**Endpoint:** `POST /api/appointments?patientId={patientId}`
**Input:** doctorId of unapproved doctor
**Expected Result:**
- Status: 400 Bad Request
- Error message about doctor not being approved

#### Test Case 4.1.3: Time Slot Conflict
**Endpoint:** `POST /api/appointments?patientId={patientId}`
**Input:** Same time slot as existing appointment
**Expected Result:**
- Status: 400 Bad Request
- Error message about time slot conflict

#### Test Case 4.1.4: Past Date Booking
**Endpoint:** `POST /api/appointments?patientId={patientId}`
**Input:** appointmentDate in the past
**Expected Result:**
- Status: 400 Bad Request
- Error message about invalid date

### 4.2 Appointment Status Management Tests

#### Test Case 4.2.1: Approve Appointment
**Endpoint:** `PATCH /api/appointments/{appointmentId}/status`
**Input:**
```json
{
  "status": "Approved",
  "notes": "Confirmed by doctor"
}
```
**Expected Result:**
- Status: 200 OK
- Appointment status changed to Approved
- approvedAt timestamp set

#### Test Case 4.2.2: Reject Appointment
**Endpoint:** `PATCH /api/appointments/{appointmentId}/status`
**Input:**
```json
{
  "status": "Rejected",
  "notes": "Doctor not available"
}
```
**Expected Result:**
- Status: 200 OK
- Appointment status changed to Rejected

#### Test Case 4.2.3: Cancel Appointment
**Endpoint:** `PATCH /api/appointments/{appointmentId}/cancel?userId={userId}`
**Input:**
```json
{
  "reason": "Patient emergency"
}
```
**Expected Result:**
- Status: 200 OK
- Appointment status changed to Cancelled
- cancelledAt timestamp and reason set

### 4.3 Appointment Retrieval Tests

#### Test Case 4.3.1: Get Patient Appointments
**Endpoint:** `GET /api/appointments/patient/{patientId}`
**Expected Result:**
- Status: 200 OK
- Returns all appointments for the patient

#### Test Case 4.3.2: Get Doctor Appointments
**Endpoint:** `GET /api/appointments/doctor/{doctorId}`
**Expected Result:**
- Status: 200 OK
- Returns all appointments for the doctor

#### Test Case 4.3.3: Search Appointments with Filters
**Endpoint:** `GET /api/appointments/search?status=Pending&fromDate=2025-09-01&toDate=2025-09-30`
**Expected Result:**
- Status: 200 OK
- Returns filtered appointments

#### Test Case 4.3.4: Get Pending Appointments
**Endpoint:** `GET /api/appointments/pending`
**Expected Result:**
- Status: 200 OK
- Returns all pending appointments

## 5. Integration Test Scenarios

### 5.1 Complete Patient Journey

#### Scenario 5.1.1: Patient Registration to Appointment Completion
1. **Register as Patient** → `POST /api/users/register`
2. **Login** → `POST /api/users/login` 
3. **View Specialties** → `GET /api/specialties`
4. **Find Doctors by Specialty** → `GET /api/doctors/specialty/{specialtyId}`
5. **Check Doctor Availability** → `GET /api/doctors/{doctorId}/available-slots`
6. **Book Appointment** → `POST /api/appointments`
7. **View My Appointments** → `GET /api/appointments/patient/{patientId}`
8. **Update Appointment** → `PUT /api/appointments/{appointmentId}`
9. **Cancel Appointment** → `PATCH /api/appointments/{appointmentId}/cancel`

### 5.2 Complete Doctor Journey

#### Scenario 5.2.1: Doctor Registration to Managing Appointments
1. **Register as Doctor User** → `POST /api/users/register`
2. **Create Doctor Profile** → `POST /api/doctors`
3. **Admin Approves Doctor** → `PATCH /api/doctors/{doctorId}/approve`
4. **Update Availability** → `PATCH /api/doctors/{doctorId}/availability`
5. **View My Appointments** → `GET /api/appointments/doctor/{doctorId}`
6. **Approve Patient Appointment** → `PATCH /api/appointments/{appointmentId}/status`
7. **Complete Appointment** → `PATCH /api/appointments/{appointmentId}/status`

### 5.3 Admin Management Journey

#### Scenario 5.3.1: Admin Managing the System
1. **View All Users** → `GET /api/users`
2. **View Pending Doctor Approvals** → `GET /api/doctors/pending-approval`
3. **Approve Doctors** → `PATCH /api/doctors/{doctorId}/approve`
4. **Manage Specialties** → `POST /api/specialties`
5. **View All Appointments** → `GET /api/appointments`
6. **Manage Appointment Conflicts** → `PATCH /api/appointments/{appointmentId}/status`

## 6. Load Testing Scenarios

### 6.1 Performance Tests

#### Test Case 6.1.1: Concurrent User Registration
- **Objective:** Test system under multiple simultaneous registrations
- **Method:** Send 50 concurrent registration requests
- **Expected:** All requests should be processed successfully

#### Test Case 6.1.2: Concurrent Appointment Booking
- **Objective:** Test race conditions in appointment booking
- **Method:** Multiple users try to book same time slot simultaneously
- **Expected:** Only one booking should succeed, others should fail gracefully

#### Test Case 6.1.3: Database Query Performance
- **Objective:** Test query performance with large datasets
- **Method:** Insert 10,000+ records and test search operations
- **Expected:** Queries should complete within acceptable time limits

## 7. Security Tests

### 7.1 Input Validation Tests

#### Test Case 7.1.1: SQL Injection Prevention
- **Input:** SQL injection patterns in all input fields
- **Expected:** Requests should be rejected or sanitized

#### Test Case 7.1.2: XSS Prevention
- **Input:** JavaScript code in text fields
- **Expected:** Scripts should be encoded/sanitized

#### Test Case 7.1.3: Large Payload Handling
- **Input:** Extremely large JSON payloads
- **Expected:** Requests should be rejected with appropriate error

## 8. Error Handling Tests

### 8.1 Database Connection Tests

#### Test Case 8.1.1: Database Unavailable
- **Method:** Stop MongoDB service during API operation
- **Expected:** Graceful error handling with appropriate HTTP status

#### Test Case 8.1.2: Network Timeout
- **Method:** Simulate network latency/timeout
- **Expected:** Timeout handling with proper error messages

## 9. Data Validation Tests

### 9.1 Business Rule Validation

#### Test Case 9.1.1: Appointment Time Validation
- **Input:** Appointment outside doctor's availability
- **Expected:** Validation error

#### Test Case 9.1.2: Date Range Validation
- **Input:** End time before start time
- **Expected:** Validation error

#### Test Case 9.1.3: Role-based Access Validation
- **Input:** Patient trying to approve appointments
- **Expected:** Authorization error (if role-based security is implemented)

## Test Data Management

### Setup Data for Testing
```javascript
// Create test specialties
db.Specialties.insertOne({
  name: "Test Specialty",
  description: "For testing purposes",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Create test users
db.Users.insertMany([
  {
    name: "Test Patient",
    email: "test.patient@test.com",
    passwordHash: "$2a$11$test.hash",
    role: "Patient",
    phone: "+1111111111",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Test Doctor", 
    email: "test.doctor@test.com",
    passwordHash: "$2a$11$test.hash",
    role: "Doctor",
    phone: "+2222222222",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

### Cleanup After Testing
```javascript
// Remove test data
db.Users.deleteMany({email: /test\.com$/})
db.Doctors.deleteMany({licenseNumber: /TEST/})
db.Appointments.deleteMany({reasonForVisit: /test/i})
db.Specialties.deleteOne({name: "Test Specialty"})
```

## Automated Testing with Postman

### Collection Runner
1. Import the provided Postman collection
2. Set up environment variables (baseUrl, test user IDs)
3. Run the entire collection to validate all endpoints
4. Use Newman for CI/CD pipeline integration

### Newman Command Line
```bash
npm install -g newman
newman run Postman_Collection.json -e environment.json --reporters html,cli
```
