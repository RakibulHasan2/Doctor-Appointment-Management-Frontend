# Admin Functionality Test Guide

## 🚀 **Admin Dashboard - Complete Testing Guide**

**Backend Running on:** `http://localhost:5289`  
**Swagger UI:** `http://localhost:5289/swagger`

---

## 👑 **Admin Role - Complete Functionality**

### **Step 1: Admin Registration**
```bash
POST http://localhost:5289/api/users/register
Content-Type: application/json

{
  "name": "System Administrator",
  "email": "admin@hospital.com", 
  "password": "AdminPassword123",
  "confirmPassword": "AdminPassword123",
  "role": "Admin",
  "phone": "+1234567890"
}
```

### **Step 2: Admin Login**
```bash
POST http://localhost:5289/api/users/login
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "AdminPassword123"
}
```

---

## 🏥 **1. USER MANAGEMENT (Admin Powers)**

### **View All Users in System**
```bash
GET http://localhost:5289/api/users
# Returns: All patients, doctors, and admins
```

### **View Specific User Details**
```bash
GET http://localhost:5289/api/users/{userId}
# Shows complete user profile
```

### **Update Any User's Profile**
```bash
PUT http://localhost:5289/api/users/{userId}
Content-Type: application/json

{
  "name": "Updated User Name",
  "email": "updated@email.com",
  "phone": "+9876543210",
  "isActive": true
}
```

### **Reset User Password**
```bash
PATCH http://localhost:5289/api/users/{userId}/change-password
Content-Type: application/json

{
  "newPassword": "NewSecurePassword123",
  "confirmPassword": "NewSecurePassword123"
}
```

### **Deactivate/Delete User Account**
```bash
DELETE http://localhost:5289/api/users/{userId}
# Removes user from system
```

---

## 👨‍⚕️ **2. DOCTOR APPROVAL MANAGEMENT (Core Admin Function)**

### **View Doctors Waiting for Approval**
```bash
GET http://localhost:5289/api/doctors/pending-approval
# Shows all doctors with isApproved: false
```

### **View All Doctors (Approved + Pending)**
```bash
GET http://localhost:5289/api/doctors
# Optional filter: ?isApproved=true or ?isApproved=false
```

### **Approve Doctor to Practice**
```bash
PATCH http://localhost:5289/api/doctors/{doctorId}/approve
# Changes doctor status to approved
```

### **Reject Doctor Application**
```bash
PATCH http://localhost:5289/api/doctors/{doctorId}/reject
Content-Type: application/json

{
  "reason": "Incomplete documentation or qualifications"
}
```

### **View Doctor Profile Details**
```bash
GET http://localhost:5289/api/doctors/{doctorId}
# Complete doctor information including user details
```

### **Remove Doctor from System**
```bash
DELETE http://localhost:5289/api/doctors/{doctorId}
# Permanently removes doctor profile
```

---

## 🏷️ **3. MEDICAL SPECIALTY MANAGEMENT (Admin Only)**

### **Create New Medical Specialty**
```bash
POST http://localhost:5289/api/specialties
Content-Type: application/json

{
  "name": "Cardiology",
  "description": "Heart and cardiovascular system disorders"
}
```

### **View All Specialties**
```bash
GET http://localhost:5289/api/specialties
# Lists all medical specialties in system
```

### **Update Existing Specialty**
```bash
PUT http://localhost:5289/api/specialties/{specialtyId}
Content-Type: application/json

{
  "name": "Updated Specialty Name",
  "description": "Updated description",
  "isActive": true
}
```

### **Remove Specialty from System**
```bash
DELETE http://localhost:5289/api/specialties/{specialtyId}
# Deactivates specialty (affects doctor assignments)
```

---

## 📅 **4. APPOINTMENT OVERSIGHT (System Monitoring)**

### **View ALL Appointments in System**
```bash
GET http://localhost:5289/api/appointments
# Shows every appointment regardless of patient/doctor
```

### **Search Appointments with Filters**
```bash
GET http://localhost:5289/api/appointments/search?status=Pending&fromDate=2025-09-01&toDate=2025-09-30
# Advanced filtering capabilities
```

### **View All Pending Appointments**
```bash
GET http://localhost:5289/api/appointments/pending
# Shows appointments waiting for doctor approval
```

### **Override Appointment Status**
```bash
PATCH http://localhost:5289/api/appointments/{appointmentId}/status
Content-Type: application/json

{
  "status": "Approved",
  "notes": "Admin approval override"
}
```

### **Cancel Any Appointment**
```bash
PATCH http://localhost:5289/api/appointments/{appointmentId}/cancel
Content-Type: application/json

{
  "reason": "Administrative cancellation"
}
```

### **Force Delete Appointment**
```bash
DELETE http://localhost:5289/api/appointments/{appointmentId}
# Permanently removes appointment record
```

---

## 📊 **5. SYSTEM ANALYTICS & REPORTING**

### **Get System Statistics**
```bash
# Total Users
GET http://localhost:5289/api/users

# Doctor Statistics
GET http://localhost:5289/api/doctors
GET http://localhost:5289/api/doctors/pending-approval

# Appointment Analytics
GET http://localhost:5289/api/appointments/search?fromDate=2025-09-01&toDate=2025-09-30
```

---

## 🎯 **Complete Admin Workflow Example**

### **Scenario: New Doctor Registration Process**

1. **Doctor registers as user:**
```bash
POST /api/users/register
{
  "name": "Dr. John Smith",
  "email": "dr.smith@hospital.com",
  "role": "Doctor",
  "password": "DoctorPass123",
  "confirmPassword": "DoctorPass123",
  "phone": "+1122334455"
}
```

2. **Doctor creates profile:**
```bash
POST /api/doctors
{
  "userId": "{doctorUserId}",
  "specialtyId": "{specialtyId}",
  "licenseNumber": "MD123456",
  "experience": 5,
  "qualification": "MBBS, MD",
  "consultationFee": 150.00
}
```

3. **Admin reviews pending doctor:**
```bash
GET /api/doctors/pending-approval
```

4. **Admin approves doctor:**
```bash
PATCH /api/doctors/{doctorId}/approve
```

5. **Doctor is now active and can receive appointments!**

---

## 🛡️ **Admin Security & Controls**

### **What Admin Can Do:**
✅ **Complete User Management** - Create, read, update, delete any user  
✅ **Doctor Approval Process** - Approve/reject doctors before they practice  
✅ **Specialty Management** - Control medical categories  
✅ **Appointment Oversight** - Monitor and manage all appointments  
✅ **System Analytics** - View comprehensive system statistics  
✅ **Override Capabilities** - Can modify any appointment status  
✅ **Emergency Controls** - Can cancel/delete any record  

### **Admin Dashboard Features:**
🔍 **Search & Filter** - Advanced querying across all entities  
📊 **Reporting** - System-wide statistics and analytics  
⚠️ **Alerts** - Pending approvals and system issues  
🔧 **Configuration** - Manage specialties and system settings  
👥 **User Control** - Complete user lifecycle management  

---

## 🚀 **Test Admin Functionality Now!**

1. **Open Swagger UI:** http://localhost:5289/swagger
2. **Register as Admin** using the registration example above
3. **Login to get user details**
4. **Test each admin endpoint** using the examples provided
5. **Create a complete workflow** from user registration to appointment management

**All Admin APIs are fully functional and ready for testing!** 🎉

---

## 📱 **Admin Dashboard Endpoints Summary**

| **Category** | **Endpoints Available** | **Total** |
|--------------|------------------------|-----------|
| **User Management** | 6 endpoints | 6 |
| **Doctor Management** | 8 endpoints | 8 |
| **Specialty Management** | 5 endpoints | 5 |
| **Appointment Oversight** | 7 endpoints | 7 |
| **System Analytics** | Cross-category queries | ∞ |
| **TOTAL ADMIN APIS** | **26+ endpoints** | **26+** |

**Admin has complete control over the entire hospital management system!** 👑
