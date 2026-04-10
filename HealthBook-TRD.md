# HealthBook - Technical Requirements Document (TRD)

**Version:** 1.1 - Supabase Migration  
**Date:** January 2026  
**Status:** In Development  
**Document Type:** Technical Specification

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Design](#4-database-design)
5. [API Specifications](#5-api-specifications)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Backend Architecture](#8-backend-architecture)
9. [Security Requirements](#9-security-requirements)

---

## 1. Introduction

### 1.1 Purpose
This Technical Requirements Document (TRD) provides comprehensive technical specifications for the HealthBook appointment scheduling system, utilizing **Supabase** as the backend-as-a-service (BaaS) provider for Database and Auth.

### 1.2 Scope
This document covers the technical implementation details for the MVP release, focusing on the migration from MongoDB to PostgreSQL via Supabase.

---

## 2. System Architecture

### 2.1 Architecture Pattern
**Pattern:** Hybrid Three-tier architecture
```text
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│       (React SPA - Client Side)         │
│  - Supabase Auth Client                 │
└─────────────────────────────────────────┘
          │                 │
    HTTPS │                 │ Supabase Client (Reads)
          ▼                 ▼
┌──────────────────┐    ┌──────────────────┐
│ Application Layer│    │    Data Layer    │
│ (Node/Express)   │───>│    (Supabase)    │
│ - Business Logic │    │ - PostgreSQL DB  │
│ - Complex Writes │    │ - Auth Service   │
│ - Email Triggers │    │ - RLS Policies   │
└──────────────────┘    └──────────────────┘
```

### 2.2 Communication Flow
- **Auth:** Client talks directly to Supabase Auth.
- **Reads:** Client can query Supabase directly (protected by RLS) for high performance.
- **Writes:** Critical writes (Booking) go through Node.js Middleware to ensure transactional integrity and business logic checks.

---

## 3. Technology Stack

### 3.1 Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2+ | UI framework |
| @supabase/supabase-js | 2.x | Supabase Client SDK |
| Tailwind CSS | 3.x | Styling framework |
| React Query | 4.x | Server state management |

### 3.2 Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18.x LTS | Runtime environment |
| Express.js | 4.18+ | Web framework |
| @supabase/supabase-js | 2.x | Admin Client for Logic |
| nodemailer | 6.9+ | Email service |

### 3.3 Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| Supabase | Cloud | Managed PostgreSQL |
| PostgreSQL | 15+ | Relational Database |

---

## 4. Database Design (PostgreSQL)

### 4.1 Database Choice Justification
Supabase (PostgreSQL) selected for:
- **Relational Integrity:** Foreign keys ensure data consistency (vital for appointments).
- **Row Level Security (RLS):** Fine-grained access control at the database level.
- **Realtime:** Built-in subscriptions for updating the UI instantly.
- **Auth Integration:** Seamless linkage between Users and Data.

### 4.2 Schema Definitions

#### 4.2.1 Users Table (public.profiles)
Linked to auth.users via triggers.
```sql
create type user_role as enum ('patient', 'admin', 'doctor');

create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  role user_role default 'patient',
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Users can read/update their own profile
```

#### 4.2.2 Departments Table
```sql
create table public.departments (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  description text,
  icon text,
  color text,
  is_active boolean default true
);
```

#### 4.2.3 Doctors Table
```sql
create table public.doctors (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) not null,
  department_id uuid references public.departments(id) not null,
  specialization text,
  consultation_fee numeric,
  availability jsonb, -- structured: { "monday": ["09:00", "10:00"] }
  is_active boolean default true,
  created_at timestamptz default now()
);
```

#### 4.2.4 Appointments Table
```sql
create type appointment_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) not null,
  doctor_id uuid references public.doctors(id) not null,
  department_id uuid references public.departments(id) not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status appointment_status default 'pending',
  reason text,
  created_at timestamptz default now()
);

-- Index for preventing double booking
create unique index no_double_booking on public.appointments (doctor_id, start_time) where status != 'cancelled';
```

---

## 5. API Specifications

### 5.1 Base URL
- **Development:** `http://localhost:5000/api/v1`

### 5.2 Supabase Interactions (Backend)
The Express backend uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS when necessary (e.g., booking validation), while the frontend uses the `SUPABASE_ANON_KEY`.

### 5.3 Key Endpoints (Express Middleware)

#### POST /api/v1/appointments/book
**Description:** Handles the complex logic of checking availability and locking the slot.

**Request:**
```json
{
  "doctor_id": "uuid",
  "start_time": "ISO-8601",
  "reason": "Checkup"
}
```

**Logic:**
1. Verify JWT token from header (using Supabase Auth).
2. Query appointments table for overlap.
3. If clear, insert new row.
4. Trigger confirmation email.

**Response (201):**
```json
{
  "success": true,
  "data": { "appointment_id": "uuid", "status": "confirmed" }
}
```

---

## 6. Authentication & Authorization

### 6.1 Supabase Auth
We will use Supabase Auth for user management.

**Code Example (Frontend Login):**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const handleLogin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
}
```

### 6.2 Backend Verification
The Express server verifies the Access Token sent by the frontend.
```javascript
// middleware/auth.js
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
   
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
   
  req.user = user;
  next();
};
```

---

## 7. Frontend Architecture

### 7.1 State Management
- **Auth Context:** Stores the Supabase Session.
- **React Query:** Fetches data from Supabase.

### 7.2 Service Layer
```javascript
// services/appointmentService.js
export const fetchAppointments = async (userId) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, doctors(profile_id, specializations)')
    .eq('patient_id', userId)
   
  if (error) throw error;
  return data;
}
```

---

## 8. Backend Architecture

### 8.1 Setup (server.js)
```javascript
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Routes...
```

### 8.2 Controller Logic
```javascript
exports.createAppointment = async (req, res) => {
  const { doctor_id, start_time, reason } = req.body;
  const user_id = req.user.id; // From Auth Middleware

  // 1. Check double booking
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctor_id)
    .eq('start_time', start_time)
    .neq('status', 'cancelled')
    .single();

  if (existing) return res.status(409).json({ error: 'Slot taken' });

  // 2. Insert
  const { data, error } = await supabase
    .from('appointments')
    .insert([{ patient_id: user_id, doctor_id, start_time, reason }])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ success: true, data });
};
```

---

## 9. Security Requirements

### 9.1 Row Level Security (RLS) Policies
These are SQL policies enforced by Supabase.
- **Profiles:** Users can view own profile.
- **Appointments:** Users can view rows where `patient_id = auth.uid()`.
- **Doctors:** Public read access.

### 9.2 Environment Variables
- `SUPABASE_URL`: Public API URL.
- `SUPABASE_ANON_KEY`: Public key for Frontend.
- `SUPABASE_SERVICE_KEY`: Secret key for Backend (Admin rights).
- `JWT_SECRET`: Used to verify tokens on the backend.