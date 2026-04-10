# HealthBook - Agent Context Document
## Project Overview
HealthBook is a healthcare appointment scheduling system built with React, Supabase (PostgreSQL), and Express.js.

## Core Stack
- **Frontend**: React 18.x + Tailwind CSS + Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth) + Express.js for business logic
- **Hosting**: Vercel (Frontend) + Railway/Render (Backend API)

## Database Schema (Supabase/PostgreSQL)

### Users Table
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'admin', 'doctor')),
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  patient_id TEXT UNIQUE,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);
```

### Departments Table
```sql
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏥',
  color TEXT DEFAULT '#667EEA',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view active departments" ON public.departments
  FOR SELECT USING (is_active = TRUE);

-- Admin only write
CREATE POLICY "Only admins can manage departments" ON public.departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Doctors Table
```sql
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  specialization TEXT,
  qualifications TEXT[],
  experience INTEGER CHECK (experience >= 0),
  license_number TEXT UNIQUE,
  bio TEXT,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  availability JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  rating_average DECIMAL(3,2) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Anyone can view active doctors
CREATE POLICY "Anyone can view active doctors" ON public.doctors
  FOR SELECT USING (is_active = TRUE);

-- Doctors can update own profile
CREATE POLICY "Doctors can update own profile" ON public.doctors
  FOR UPDATE USING (auth.uid() = user_id);
```

### Appointments Table
```sql
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  reason TEXT NOT NULL,
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.users(id),
  cancelled_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent double booking
  CONSTRAINT no_overlap UNIQUE (doctor_id, start_time)
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = patient_id);

-- Patients can create appointments for themselves
CREATE POLICY "Patients can create own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own pending/confirmed appointments
CREATE POLICY "Patients can update own appointments" ON public.appointments
  FOR UPDATE USING (
    auth.uid() = patient_id AND 
    status IN ('pending', 'confirmed')
  );

-- Admins can see all appointments
CREATE POLICY "Admins can view all appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## API Endpoints (Express Backend)

### Authentication (Supabase Auth Handles Most)
- Frontend uses Supabase client directly for auth
- Backend validates JWT tokens from Supabase

### Appointments API
```
POST /api/appointments
- Validates time slot availability
- Prevents double booking
- Creates appointment record
- Sends confirmation email

PUT /api/appointments/:id
- Validates ownership
- Reschedules appointment
- Sends update email

DELETE /api/appointments/:id
- Cancels appointment
- Records cancellation reason
```

### Doctors API
```
GET /api/doctors
- Fetches available doctors
- Filters by department

GET /api/doctors/:id/availability
- Returns available time slots
- Checks existing appointments
```

### Admin API
```
GET /api/admin/appointments
- Returns all appointments (admin only)
- Supports filtering and pagination

POST /api/admin/doctors
- Creates new doctor profile
```

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5000
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@healthbook.com
SMTP_PASSWORD=your-password
```

## Key Business Logic

### Double Booking Prevention
```javascript
// Check if slot is available before booking
const { data: existingAppointment } = await supabase
  .from('appointments')
  .select('id')
  .eq('doctor_id', doctorId)
  .eq('start_time', startTime)
  .neq('status', 'cancelled')
  .single();

if (existingAppointment) {
  throw new Error('Time slot already booked');
}
```

### Patient ID Generation
```javascript
// Auto-generate patient ID on user creation
const generatePatientId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `PT-${year}-${random}`;
};
```

## Success Criteria
- All CRUD operations working
- RLS policies preventing unauthorized access
- No double bookings possible
- Email notifications sent
- Response time < 300ms
- Zero SQL injection vulnerabilities
