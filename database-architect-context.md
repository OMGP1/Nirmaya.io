# Agent 1: Database Architect - Context File

## Your Role
You are the Database Architect responsible for setting up the entire Supabase PostgreSQL database for HealthBook.

## Your Responsibilities
1. Create all database tables with proper schema
2. Set up foreign key relationships
3. Implement Row Level Security (RLS) policies
4. Create indexes for performance
5. Write seed data scripts
6. Test all database constraints

---

## Complete Database Schema

### Table 1: Users (public.users)
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
  address JSONB,
  emergency_contact JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
  ON public.users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_patient_id ON public.users(patient_id) WHERE patient_id IS NOT NULL;
```

### Table 2: Departments (public.departments)
```sql
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏥',
  color TEXT DEFAULT '#667EEA',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active departments" 
  ON public.departments FOR SELECT 
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage departments" 
  ON public.departments FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_departments_active ON public.departments(is_active);
CREATE INDEX idx_departments_order ON public.departments(display_order);
```

### Table 3: Doctors (public.doctors)
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
  consultation_fee DECIMAL(10,2) DEFAULT 0 CHECK (consultation_fee >= 0),
  availability JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  rating_average DECIMAL(3,2) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active doctors" 
  ON public.doctors FOR SELECT 
  USING (is_active = TRUE);

CREATE POLICY "Doctors can update own profile" 
  ON public.doctors FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage doctors" 
  ON public.doctors FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_doctors_user ON public.doctors(user_id);
CREATE INDEX idx_doctors_department ON public.doctors(department_id);
CREATE INDEX idx_doctors_active ON public.doctors(is_active);
CREATE INDEX idx_doctors_rating ON public.doctors(rating_average DESC);
```

### Table 4: Appointments (public.appointments)
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
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT future_appointment CHECK (start_time > NOW()),
  
  -- Prevent double booking (unique constraint)
  CONSTRAINT no_overlap UNIQUE (doctor_id, start_time)
);

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Patients can view own appointments" 
  ON public.appointments FOR SELECT 
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create own appointments" 
  ON public.appointments FOR INSERT 
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own pending/confirmed appointments" 
  ON public.appointments FOR UPDATE 
  USING (
    auth.uid() = patient_id AND 
    status IN ('pending', 'confirmed')
  );

CREATE POLICY "Doctors can view their appointments" 
  ON public.appointments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = appointments.doctor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all appointments" 
  ON public.appointments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all appointments" 
  ON public.appointments FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id, start_time DESC);
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id, start_time);
CREATE INDEX idx_appointments_department ON public.appointments(department_id, start_time DESC);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_appointments_date ON public.appointments(DATE(start_time));
```

### Table 5: Time Blocks (Doctor Unavailability)
```sql
CREATE TABLE public.time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT DEFAULT 'unavailable' CHECK (reason IN ('vacation', 'conference', 'emergency', 'personal', 'unavailable')),
  notes TEXT,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_block_time CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view time blocks" 
  ON public.time_blocks FOR SELECT 
  USING (TRUE);

CREATE POLICY "Admins can manage time blocks" 
  ON public.time_blocks FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_time_blocks_doctor ON public.time_blocks(doctor_id, start_time);
```

---

## Seed Data

### 1. Seed Departments
```sql
INSERT INTO public.departments (name, description, icon, color, display_order) VALUES
('Cardiology', 'Heart and cardiovascular care', '❤️', '#e74c3c', 1),
('Orthopedics', 'Bone and joint specialists', '🦴', '#3498db', 2),
('Dermatology', 'Skin care and treatment', '🩺', '#2ecc71', 3),
('Neurology', 'Brain and nervous system', '🧠', '#9b59b6', 4),
('Pediatrics', 'Child healthcare', '👶', '#f39c12', 5),
('Ophthalmology', 'Eye care specialists', '👁️', '#1abc9c', 6);
```

### 2. Seed Test Users
```sql
-- Admin user (Note: Supabase Auth handles password, this is just profile data)
INSERT INTO public.users (id, email, role, full_name, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@healthbook.com', 'admin', 'System Administrator', '+1-555-0001');

-- Test patients
INSERT INTO public.users (email, role, full_name, phone, patient_id, blood_type) VALUES
('john.doe@example.com', 'patient', 'John Doe', '+1-555-0100', 'PT-2026-0001', 'A+'),
('jane.smith@example.com', 'patient', 'Jane Smith', '+1-555-0101', 'PT-2026-0002', 'B+');
```

### 3. Seed Doctors
```sql
-- Get department IDs first
WITH dept_ids AS (
  SELECT id, name FROM public.departments
)
INSERT INTO public.doctors (user_id, department_id, specialization, qualifications, experience, license_number, bio, consultation_fee, availability)
SELECT 
  u.id,
  d.id,
  'Interventional Cardiology',
  ARRAY['MD', 'FACC', 'FSCAI'],
  12,
  'MED-CARD-001',
  'Dr. Chen specializes in complex coronary interventions with over 12 years of experience.',
  150.00,
  '[
    {"dayOfWeek": 1, "slots": [{"startTime": "09:00", "endTime": "12:00", "slotDuration": 30}]},
    {"dayOfWeek": 3, "slots": [{"startTime": "09:00", "endTime": "12:00", "slotDuration": 30}]},
    {"dayOfWeek": 5, "slots": [{"startTime": "14:00", "endTime": "17:00", "slotDuration": 30}]}
  ]'::jsonb
FROM public.users u
CROSS JOIN dept_ids d
WHERE u.email = 'dr.chen@healthbook.com' AND d.name = 'Cardiology'
LIMIT 1;
```

---

## Database Functions

### Function: Check Appointment Overlap
```sql
CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for overlapping appointments
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE doctor_id = NEW.doctor_id
    AND status NOT IN ('cancelled')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      (NEW.start_time >= start_time AND NEW.start_time < end_time)
      OR (NEW.end_time > start_time AND NEW.end_time <= end_time)
      OR (NEW.start_time <= start_time AND NEW.end_time >= end_time)
    )
  ) THEN
    RAISE EXCEPTION 'Appointment time slot overlaps with existing appointment';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_appointment_overlap
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION check_appointment_overlap();
```

### Function: Generate Patient ID
```sql
CREATE OR REPLACE FUNCTION generate_patient_id()
RETURNS TRIGGER AS $$
DECLARE
  new_id TEXT;
  current_year TEXT;
  random_num TEXT;
BEGIN
  IF NEW.role = 'patient' AND NEW.patient_id IS NULL THEN
    current_year := TO_CHAR(NOW(), 'YYYY');
    random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    new_id := 'PT-' || current_year || '-' || random_num;
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.users WHERE patient_id = new_id) LOOP
      random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
      new_id := 'PT-' || current_year || '-' || random_num;
    END LOOP;
    
    NEW.patient_id := new_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_patient_id
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION generate_patient_id();
```

---

## Testing Checklist

### RLS Policy Tests
- [ ] Patient can only see their own appointments
- [ ] Patient cannot see other patients' data
- [ ] Admin can see all appointments
- [ ] Doctor can see their own appointments
- [ ] Unauthenticated users cannot access any data

### Constraint Tests
- [ ] Cannot create appointment with end_time before start_time
- [ ] Cannot double-book a doctor
- [ ] Cannot create appointment in the past
- [ ] Patient ID is auto-generated and unique
- [ ] Blood type validation works

### Performance Tests
- [ ] Query appointments by patient_id < 50ms
- [ ] Query appointments by doctor_id < 50ms
- [ ] Department listing < 10ms
- [ ] Doctor listing with department filter < 30ms

---

## Your First Tasks

1. **Set up Supabase project**
   - Create new project at supabase.com
   - Note the project URL and anon key

2. **Run all CREATE TABLE statements**
   - Execute in Supabase SQL Editor
   - Verify tables created successfully

3. **Set up RLS policies**
   - Enable RLS on all tables
   - Test each policy

4. **Create indexes**
   - Run all index creation statements
   - Verify with EXPLAIN ANALYZE

5. **Add seed data**
   - Insert departments
   - Create test users (you'll need to use Supabase Auth for actual users)
   - Add test doctors

6. **Test all constraints**
   - Try to insert invalid data
   - Verify constraints prevent it

7. **Document completion**
   - Provide schema diagram
   - Share database connection details (securely)
   - List any deviations from plan
