# Database Setup Guide

## MongoDB Setup

### 1. Install MongoDB
Download and install MongoDB Community Server from [MongoDB Official Website](https://www.mongodb.com/try/download/community)

### 2. Start MongoDB Service
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 3. Connect to MongoDB
```bash
mongo
# or with MongoDB Compass GUI
```

### 4. Create Database and Collections
```javascript
// Switch to DoctorAppointmentDB
use DoctorAppointmentDB

// Create collections
db.createCollection("Users")
db.createCollection("Doctors") 
db.createCollection("Specialties")
db.createCollection("Appointments")
```

### 5. Create Indexes for Better Performance
```javascript
// Users collection indexes
db.Users.createIndex({ email: 1 }, { unique: true })
db.Users.createIndex({ role: 1 })
db.Users.createIndex({ isActive: 1 })

// Doctors collection indexes
db.Doctors.createIndex({ userId: 1 }, { unique: true })
db.Doctors.createIndex({ specialtyId: 1 })
db.Doctors.createIndex({ isApproved: 1 })
db.Doctors.createIndex({ isActive: 1 })

// Specialties collection indexes
db.Specialties.createIndex({ name: 1 }, { unique: true })
db.Specialties.createIndex({ isActive: 1 })

// Appointments collection indexes
db.Appointments.createIndex({ patientId: 1 })
db.Appointments.createIndex({ doctorId: 1 })
db.Appointments.createIndex({ appointmentDate: 1 })
db.Appointments.createIndex({ status: 1 })
db.Appointments.createIndex({ createdAt: 1 })
```

## Sample Data Insertion

### 1. Insert Sample Specialties
```javascript
db.Specialties.insertMany([
  {
    name: "Cardiology",
    description: "Heart and cardiovascular system",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Dermatology", 
    description: "Skin, hair, and nail disorders",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Neurology",
    description: "Nervous system disorders",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Orthopedics",
    description: "Bone and joint disorders",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Pediatrics",
    description: "Medical care for children",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

### 2. Insert Sample Admin User
```javascript
db.Users.insertOne({
  name: "System Administrator",
  email: "admin@doctorappt.com",
  passwordHash: "$2a$11$example.hash.for.password123", // BCrypt hash for "admin123"
  role: "Admin",
  phone: "+1234567890",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true
})
```

### 3. Insert Sample Doctor Users
```javascript
// Get specialty IDs first
var cardiologyId = db.Specialties.findOne({name: "Cardiology"})._id;
var dermatologyId = db.Specialties.findOne({name: "Dermatology"})._id;

// Insert doctor users
db.Users.insertMany([
  {
    name: "Dr. Jane Smith",
    email: "dr.jane@doctorappt.com",
    passwordHash: "$2a$11$example.hash.for.doctor123", // BCrypt hash for "doctor123"
    role: "Doctor",
    phone: "+1234567891",
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    name: "Dr. Michael Johnson",
    email: "dr.michael@doctorappt.com", 
    passwordHash: "$2a$11$example.hash.for.doctor123", // BCrypt hash for "doctor123"
    role: "Doctor",
    phone: "+1234567892",
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
])

// Get doctor user IDs
var janeUserId = db.Users.findOne({email: "dr.jane@doctorappt.com"})._id;
var michaelUserId = db.Users.findOne({email: "dr.michael@doctorappt.com"})._id;

// Insert doctor profiles
db.Doctors.insertMany([
  {
    userId: janeUserId,
    specialtyId: cardiologyId,
    licenseNumber: "MD001234",
    experience: 10,
    qualification: "MBBS, MD (Cardiology)",
    consultationFee: 200.00,
    availability: [
      {
        dayOfWeek: 1, // Monday
        startTime: "09:00:00",
        endTime: "17:00:00", 
        isAvailable: true
      },
      {
        dayOfWeek: 2, // Tuesday
        startTime: "09:00:00",
        endTime: "17:00:00",
        isAvailable: true
      },
      {
        dayOfWeek: 3, // Wednesday
        startTime: "09:00:00",
        endTime: "13:00:00",
        isAvailable: true
      }
    ],
    isApproved: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: michaelUserId,
    specialtyId: dermatologyId,
    licenseNumber: "MD005678",
    experience: 8,
    qualification: "MBBS, MD (Dermatology)",
    consultationFee: 150.00,
    availability: [
      {
        dayOfWeek: 1, // Monday
        startTime: "10:00:00",
        endTime: "18:00:00",
        isAvailable: true
      },
      {
        dayOfWeek: 3, // Wednesday
        startTime: "10:00:00", 
        endTime: "18:00:00",
        isAvailable: true
      },
      {
        dayOfWeek: 5, // Friday
        startTime: "10:00:00",
        endTime: "16:00:00",
        isAvailable: true
      }
    ],
    isApproved: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

### 4. Insert Sample Patient Users
```javascript
db.Users.insertMany([
  {
    name: "John Doe",
    email: "john.doe@example.com",
    passwordHash: "$2a$11$example.hash.for.patient123", // BCrypt hash for "patient123"
    role: "Patient",
    phone: "+1234567893",
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    passwordHash: "$2a$11$example.hash.for.patient123", // BCrypt hash for "patient123"
    role: "Patient", 
    phone: "+1234567894",
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    name: "Robert Brown",
    email: "robert.brown@example.com",
    passwordHash: "$2a$11$example.hash.for.patient123", // BCrypt hash for "patient123"
    role: "Patient",
    phone: "+1234567895",
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
])
```

### 5. Insert Sample Appointments
```javascript
// Get required IDs
var johnPatientId = db.Users.findOne({email: "john.doe@example.com"})._id;
var sarahPatientId = db.Users.findOne({email: "sarah.wilson@example.com"})._id;
var janeDoctorId = db.Doctors.findOne({userId: janeUserId})._id;
var michaelDoctorId = db.Doctors.findOne({userId: michaelUserId})._id;

// Insert sample appointments
db.Appointments.insertMany([
  {
    patientId: johnPatientId,
    doctorId: janeDoctorId,
    appointmentDate: new Date("2025-09-10T00:00:00Z"),
    startTime: "09:00:00",
    endTime: "09:30:00",
    status: "Approved",
    reasonForVisit: "Regular cardiac checkup",
    consultationFee: 200.00,
    createdAt: new Date(),
    updatedAt: new Date(),
    approvedAt: new Date(),
    approvedBy: db.Users.findOne({role: "Admin"})._id
  },
  {
    patientId: sarahPatientId,
    doctorId: michaelDoctorId, 
    appointmentDate: new Date("2025-09-11T00:00:00Z"),
    startTime: "10:00:00",
    endTime: "10:30:00",
    status: "Pending",
    reasonForVisit: "Skin rash consultation",
    consultationFee: 150.00,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    patientId: johnPatientId,
    doctorId: michaelDoctorId,
    appointmentDate: new Date("2025-09-12T00:00:00Z"),
    startTime: "14:00:00",
    endTime: "14:30:00",
    status: "Pending",
    reasonForVisit: "Follow-up appointment",
    consultationFee: 150.00,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

## Verification Queries

### Check Data Insertion
```javascript
// Count documents in each collection
db.Users.countDocuments()
db.Doctors.countDocuments()
db.Specialties.countDocuments()
db.Appointments.countDocuments()

// View sample data
db.Users.find().pretty()
db.Doctors.find().pretty()
db.Specialties.find().pretty()
db.Appointments.find().pretty()

// Check relationships
db.Appointments.aggregate([
  {
    $lookup: {
      from: "Users",
      localField: "patientId",
      foreignField: "_id",
      as: "patient"
    }
  },
  {
    $lookup: {
      from: "Doctors", 
      localField: "doctorId",
      foreignField: "_id",
      as: "doctor"
    }
  }
]).pretty()
```

## Connection String for Application
Update your `appsettings.json`:
```json
{
  "MongoDbSettings": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "DoctorAppointmentDB"
  }
}
```

## Security Considerations
1. **Production Environment**: Use proper authentication and authorization
2. **Password Hashing**: The examples above use placeholder hashes. Use BCrypt.Net to hash real passwords
3. **Network Security**: Configure MongoDB to accept connections only from your application server
4. **Backup Strategy**: Implement regular database backups
5. **Monitoring**: Set up MongoDB monitoring and alerting

## Performance Optimization
1. **Indexes**: Create appropriate indexes for frequently queried fields
2. **Connection Pooling**: Configure connection pooling in your application
3. **Query Optimization**: Use MongoDB profiler to identify slow queries
4. **Sharding**: Consider sharding for large datasets
