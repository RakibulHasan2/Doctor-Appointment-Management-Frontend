# Doctor Appointment Management System - Frontend

A modern, responsive frontend application for managing doctor appointments built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

### For Patients
- **User Registration & Login**: Secure account creation and authentication
- **Appointment Booking**: Browse doctors by specialty, check availability, and book appointments
- **Appointment Management**: View, update, and cancel appointments
- **Dashboard**: Overview of upcoming and past appointments
- **Profile Management**: Update personal information

### For Doctors
- **Professional Dashboard**: View all appointments and patient information
- **Appointment Management**: Approve, reject, or update appointment status
- **Availability Management**: Set and update availability schedules
- **Profile Management**: Update professional details and qualifications

### For Administrators
- **System Overview**: Comprehensive dashboard with statistics
- **User Management**: Manage all users (patients and doctors)
- **Doctor Approval**: Review and approve doctor registrations
- **Appointment Oversight**: Monitor all system appointments
- **Specialty Management**: Add and manage medical specialties

## Technology Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── patient/
│   │   ├── dashboard/       # Patient dashboard
│   │   └── book-appointment/ # Appointment booking
│   ├── doctor/
│   │   └── dashboard/       # Doctor dashboard
│   ├── admin/
│   │   └── dashboard/       # Admin dashboard
│   ├── globals.css          # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
└── lib/
    └── api.ts              # API service layer
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:5289`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd doctor-appointment-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5289/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## API Integration

The frontend integrates with a .NET backend API with the following key endpoints:

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/approved` - Get approved doctors
- `GET /api/doctors/specialty/{specialtyId}` - Get doctors by specialty
- `GET /api/doctors/{id}/available-slots` - Get doctor's available time slots
- `POST /api/doctors` - Create doctor profile
- `PATCH /api/doctors/{id}/approve` - Approve doctor

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/{id}/status` - Update appointment status
- `PATCH /api/appointments/{id}/cancel` - Cancel appointment

### Specialties
- `GET /api/specialties` - Get all specialties
- `GET /api/specialties/active` - Get active specialties
- `POST /api/specialties` - Create specialty

## User Roles & Access

### Patient
- Register and login
- Browse doctors by specialty
- Book appointments with available doctors
- View and manage their appointments
- Update profile information

### Doctor
- Register and wait for admin approval
- View and manage appointments
- Update appointment status (approve/reject)
- Manage availability schedule
- Update professional profile

### Administrator
- Approve/reject doctor registrations
- View system statistics and reports
- Manage all users and appointments
- Add and manage medical specialties
- System-wide oversight and management

## Key Features

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive layouts for all screen sizes
- Modern UI with consistent design patterns

### Form Validation
- Client-side validation using Zod schemas
- Real-time form validation feedback
- Comprehensive error handling

### State Management
- Local state with React hooks
- Optimistic UI updates
- Error boundaries for graceful error handling

### User Experience
- Loading states and skeleton screens
- Toast notifications for user feedback
- Intuitive navigation and routing
- Accessibility considerations

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5289/api` |

## Backend Requirements

This frontend requires the Doctor Appointment Management System backend API to be running. The backend should be built with:

- .NET 8.0 Web API
- MongoDB database
- CORS enabled for frontend domain
- All endpoints documented in the API documentation

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security Considerations

- All API calls are made through the centralized API service
- User authentication state is managed securely
- Input validation on both client and server side
- XSS protection through React's built-in mechanisms
- CSRF protection considerations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimizations

- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Lazy loading of components
- Bundle analysis and optimization
- Server-side rendering for better SEO

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Verify backend is running on correct port
   - Check CORS configuration
   - Validate environment variables

2. **Build Errors**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check Node.js version compatibility

3. **Authentication Issues**
   - Clear browser local storage
   - Check API endpoints in browser network tab
   - Verify user roles and permissions

## License

This project is licensed under the MIT License - see the LICENSE file for details.
