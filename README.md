# Niramaya.io : Intelligent Healthcare Appointment System

HealthBook V2 is a full-stack, AI-powered healthcare appointment management platform built with React, Supabase, and a FastAPI-based Machine Learning microservice. The system provides intelligent symptom analysis, robust appointment booking workflows, predictive health risk assessments, and dedicated portals for patients, doctors, and administrators.

## 🚀 Core Features & capabilities

### 1. Intelligent Symptom Checking & Booking Wizard
- **AI Chatbot Assistant**: Embedded AI chatbot that allows patients to type their symptoms (e.g., "I have a headache") and uses local natural language matching to recommend the appropriate medical department and doctors.
- **Dynamic Slot Generation**: The booking wizard intelligently computes doctor availability, filtering out already booked times and past slots to present only valid booking options.
- **5-Step Booking Flow**: Seamless transition from department selection -> doctor matching -> date/time selection -> confirmation -> success, with integrated context management.

### 2. Predictive Health Risk Engine (ML Microservice)
- **Standalone FastAPI Service**: A Python-based microservice simulating complex medical algorithms to generate a Health Risk Score based on patient vitals and health assessment forms.
- **Risk Assessment Dashboard**: Patients can log their habits (smoking, drinking, exercise) and existing conditions to receive an immediate graphical risk analysis.
- **Severity Alerts**: Based on the risk threshold, the engine categorizes risk into `Low`, `Moderate`, `High`, or `Critical`.
- **Database Integration**: Risk scores are securely persisted back to the Supabase Postgres database.

### 3. Dedicated Doctor Portal & AI Copilot
- **Live Doctor Dashboard**: Doctors have an isolated analytics dashboard showing upcoming schedules, total patients seen, and an interactive schedule grid.
- **AI Copilot Insights**: The doctor portal features a generative AI block that flags high-risk patients based on the ML Risk Engine outputs, bringing immediate attention to urgent cases.
- **Interactive Patient Timeline**: Comprehensive view of previous appointments, vitals progression, and submitted health assessments to construct a holistic patient picture prior to their visit.

### 4. Patient Engagement & Automated Nudges
- **Vitals Tracking**: Patients can independently log standard vitals (Blood Pressure, Heart Rate, Temperature, Weight) resulting in beautiful visualized health progression charts.
- **Intelligent Cron Jobs**: Postgres-level `pg_cron` jobs automatically review patient activity to find those who have not booked an appointment in a long time, triggering email reminders (NUDGES).
- **Postgres Trigger Notifications**: When appointments are scheduled, `on_appointment_created` SQL triggers format personalized confirmation emails correctly resolving UTC/Local datetimes directly communicating with the Resend API.

### 5. Advanced Security & Access Control
- **Supabase Authentication**: Secure login flows with role-based JWT claims identifying the user context (`patient`, `doctor`, or `admin`).
- **Row Level Security (RLS)**: Highly restrictive database policies ensuring patients only see their own clinical records, while doctors have appropriate read access tied to their assigned IDs.
- **Recursive Logic Mitigations**: Specialized `is_admin()` SQL definition functions exist to evaluate admin roles securely without recursive payload locking during RLS execution.

## 🛠 Tech Stack

**Frontend**
- React 18
- Tailwind CSS (Premium Modern Aesthetics)
- Lucide React (Icons)
- date-fns (Time Manipulation & UI Parsing Fixes)
- React Router DOM

**Backend (BaaS)**
- Supabase Postgres DB
- Storage Buckets (Avatars, Documents)
- Edge Functions (Deno / Resend API)
- pg_cron (Scheduled tasks)

**Microservices**
- FastAPI (Python 3.9+)
- Uvicorn
- Scikit-learn (Risk Engine ML Logic)

## 📅 Recent Fixes in V2.1
- **Timezone Drift Resolution**: Implemented `getLocalTimeFromUTC` logic to override the default JavaScript ISO parsing behavior, eliminating the 5.5 hour IST daylight discrepancies between the database backend and the React UI. A 9:30 AM booking remains 9:30 AM natively across all interfaces.
- **React Input Context Lock**: Resolved focus-loss issues within the HealthAssessment wizard caused by inner-component definitions.
- **Admin Layout Shifts**: Corrected CSS `fixed` vs `static` discrepancies within the overarching desktop layout wrapper structures.
- **RLS Infinite Recursion**: Re-engineered admin definitions avoiding nested table lookups.

---

*HealthBook — Advancing the standard for intuitive, secure clinical management.*
