# HealthBook - PlantUML Diagrams for PPT

## 1. System Architecture Diagram

```plantuml
@startuml HealthBook_Architecture
!define RECTANGLE class

skinparam packageStyle rectangle
skinparam backgroundColor #FEFEFE
skinparam componentStyle uml2
skinparam defaultFontName Arial
skinparam rectangleBorderColor #667EEA
skinparam rectangleBackgroundColor #F8F9FA

title HealthBook - System Architecture

package "Frontend (React 18)" #E8F4FD {
    [Patient Portal] as PP #89CFF0
    [Admin Dashboard] as AD #89CFF0
    [Auth Components] as AC #89CFF0
    [Booking Components] as BC #89CFF0
}

package "Backend (Node.js/Express)" #FFF3CD {
    [API Server] as API #FFD93D
    [Auth Middleware] as AM #FFD93D
    [Validation Layer] as VL #FFD93D
    [Email Service] as ES #FFD93D
}

package "Database (Supabase/PostgreSQL)" #D4EDDA {
    [Users Table] as UT #90EE90
    [Doctors Table] as DT #90EE90
    [Appointments Table] as AT #90EE90
    [Departments Table] as DPT #90EE90
    [Time Blocks Table] as TB #90EE90
}

cloud "External Services" #F5F5F5 {
    [SMTP Server] as SMTP
    [Supabase Auth] as SA
}

PP --> API : REST API
AD --> API : REST API
AC --> SA : JWT Auth
BC --> API : Booking Requests

API --> AM : Auth Check
API --> VL : Input Validation
API --> ES : Notifications

AM --> SA : Token Validation
ES --> SMTP : Send Emails

API --> UT
API --> DT
API --> AT
API --> DPT
API --> TB

@enduml
```

---

## 2. Database Entity Relationship Diagram (ERD)

```plantuml
@startuml HealthBook_ERD
!define TABLE(name) entity name << (T,#FFAAAA) >>

skinparam backgroundColor #FFFFFF
skinparam entityBackgroundColor #F8F9FA
skinparam entityBorderColor #667EEA
skinparam linetype ortho

title HealthBook - Database Schema (ERD)

TABLE(users) {
    * id : UUID <<PK>>
    --
    * email : TEXT <<UNIQUE>>
    * role : TEXT <<patient|admin|doctor>>
    * full_name : TEXT
    phone : TEXT
    date_of_birth : DATE
    patient_id : TEXT <<UNIQUE>>
    blood_type : TEXT
    address : JSONB
    emergency_contact : JSONB
    is_active : BOOLEAN
    created_at : TIMESTAMPTZ
    updated_at : TIMESTAMPTZ
}

TABLE(departments) {
    * id : UUID <<PK>>
    --
    * name : TEXT <<UNIQUE>>
    description : TEXT
    icon : TEXT
    color : TEXT
    display_order : INTEGER
    is_active : BOOLEAN
    created_at : TIMESTAMPTZ
    updated_at : TIMESTAMPTZ
}

TABLE(doctors) {
    * id : UUID <<PK>>
    --
    user_id : UUID <<FK>>
    department_id : UUID <<FK>>
    specialization : TEXT
    qualifications : TEXT[]
    experience : INTEGER
    license_number : TEXT <<UNIQUE>>
    bio : TEXT
    consultation_fee : DECIMAL
    availability : JSONB
    is_active : BOOLEAN
    rating_average : DECIMAL
    rating_count : INTEGER
    created_at : TIMESTAMPTZ
    updated_at : TIMESTAMPTZ
}

TABLE(appointments) {
    * id : UUID <<PK>>
    --
    * patient_id : UUID <<FK>>
    * doctor_id : UUID <<FK>>
    * department_id : UUID <<FK>>
    * start_time : TIMESTAMPTZ
    * end_time : TIMESTAMPTZ
    * status : TEXT <<pending|confirmed|cancelled|completed|no_show>>
    * reason : TEXT
    notes : TEXT
    cancellation_reason : TEXT
    cancelled_by : UUID <<FK>>
    cancelled_at : TIMESTAMPTZ
    confirmed_at : TIMESTAMPTZ
    completed_at : TIMESTAMPTZ
    reminder_sent : BOOLEAN
    created_at : TIMESTAMPTZ
    updated_at : TIMESTAMPTZ
}

TABLE(time_blocks) {
    * id : UUID <<PK>>
    --
    * doctor_id : UUID <<FK>>
    * start_time : TIMESTAMPTZ
    * end_time : TIMESTAMPTZ
    reason : TEXT
    notes : TEXT
    * created_by : UUID <<FK>>
    created_at : TIMESTAMPTZ
}

users ||--o{ doctors : "has profile"
users ||--o{ appointments : "books"
departments ||--o{ doctors : "belongs to"
departments ||--o{ appointments : "in"
doctors ||--o{ appointments : "attends"
doctors ||--o{ time_blocks : "blocks"
users ||--o{ time_blocks : "creates"

@enduml
```

---

## 3. User Flow - Appointment Booking Sequence Diagram

```plantuml
@startuml Appointment_Booking_Flow
skinparam backgroundColor #FFFFFF
skinparam sequenceArrowColor #667EEA
skinparam sequenceParticipantBorderColor #667EEA
skinparam sequenceParticipantBackgroundColor #F8F9FA
skinparam sequenceLifeLineBorderColor #667EEA

title Appointment Booking Flow

actor Patient as P #89CFF0
participant "React Frontend" as FE #E8F4FD
participant "Express API" as API #FFF3CD
database "Supabase DB" as DB #D4EDDA
participant "Email Service" as ES #FFE4E1

P -> FE : Open Booking Page
FE -> API : GET /api/departments
API -> DB : Fetch departments
DB --> API : Department list
API --> FE : Return departments
FE --> P : Display departments

P -> FE : Select Department
FE -> API : GET /api/doctors?department={id}
API -> DB : Fetch available doctors
DB --> API : Doctor list
API --> FE : Return doctors
FE --> P : Display doctors

P -> FE : Select Doctor & Date
FE -> API : GET /api/appointments/availability
API -> DB : Check existing appointments
API -> DB : Check time blocks
DB --> API : Occupied slots
API --> FE : Available time slots
FE --> P : Display available slots

P -> FE : Select Time Slot
P -> FE : Enter Reason & Submit
FE -> API : POST /api/appointments
API -> API : Validate booking
API -> DB : Check double booking
alt Slot Available
    API -> DB : Create appointment
    DB --> API : Appointment created
    API -> ES : Send confirmation email
    ES --> P : Email notification
    API --> FE : Success response
    FE --> P : Show confirmation
else Slot Taken
    API --> FE : Error: Slot unavailable
    FE --> P : Show error message
end

@enduml
```

---

## 4. Use Case Diagram

```plantuml
@startuml HealthBook_UseCases
skinparam backgroundColor #FFFFFF
skinparam actorBorderColor #667EEA
skinparam usecaseBorderColor #667EEA
skinparam usecaseBackgroundColor #F8F9FA
skinparam packageBorderColor #667EEA

title HealthBook - Use Case Diagram

left to right direction

actor "Patient" as patient #89CFF0
actor "Admin" as admin #FFD93D
actor "Doctor" as doctor #90EE90

rectangle "HealthBook System" {
    
    package "Authentication" {
        usecase "Register Account" as UC1
        usecase "Login" as UC2
        usecase "Reset Password" as UC3
        usecase "Manage Profile" as UC4
    }
    
    package "Patient Features" {
        usecase "View Departments" as UC5
        usecase "Browse Doctors" as UC6
        usecase "Book Appointment" as UC7
        usecase "View Appointments" as UC8
        usecase "Reschedule Appointment" as UC9
        usecase "Cancel Appointment" as UC10
        usecase "Receive Notifications" as UC11
    }
    
    package "Admin Features" {
        usecase "View All Appointments" as UC12
        usecase "Manage Doctors" as UC13
        usecase "Manage Departments" as UC14
        usecase "View Patient List" as UC15
        usecase "Block Time Slots" as UC16
        usecase "View Analytics" as UC17
    }
    
    package "Doctor Features" {
        usecase "View Schedule" as UC18
        usecase "Update Availability" as UC19
        usecase "Mark Appointment Complete" as UC20
    }
}

patient --> UC1
patient --> UC2
patient --> UC3
patient --> UC4
patient --> UC5
patient --> UC6
patient --> UC7
patient --> UC8
patient --> UC9
patient --> UC10
patient --> UC11

admin --> UC2
admin --> UC12
admin --> UC13
admin --> UC14
admin --> UC15
admin --> UC16
admin --> UC17

doctor --> UC2
doctor --> UC18
doctor --> UC19
doctor --> UC20

@enduml
```

---

## 5. Component Diagram

```plantuml
@startuml HealthBook_Components
skinparam backgroundColor #FFFFFF
skinparam componentStyle uml2
skinparam componentBorderColor #667EEA
skinparam packageBorderColor #667EEA

title HealthBook - Component Diagram

package "Client Application (React)" #E8F4FD {
    
    package "Pages" {
        [Home Page] as HP
        [Login Page] as LP
        [Register Page] as RP
        [Dashboard] as DP
        [Booking Page] as BP
        [Appointments Page] as AP
        [Admin Panel] as AdminP
    }
    
    package "Components" {
        [AuthForm] as AF
        [DepartmentSelector] as DS
        [DoctorCard] as DC
        [DatePicker] as DPicker
        [TimeSlots] as TS
        [AppointmentCard] as APC
        [Header] as H
        [Footer] as F
    }
    
    package "Contexts" {
        [AuthContext] as AuthCtx
        [BookingContext] as BookCtx
    }
    
    package "Services" {
        [AuthService] as AuthSvc
        [AppointmentService] as ApptSvc
        [DoctorService] as DocSvc
        [DepartmentService] as DeptSvc
    }
}

package "Server Application (Express)" #FFF3CD {
    
    package "Routes" {
        [Auth Routes] as AR
        [Appointment Routes] as AppR
        [Doctor Routes] as DR
        [Admin Routes] as AdmR
    }
    
    package "Controllers" {
        [Auth Controller] as AC
        [Appointment Controller] as APC2
        [Doctor Controller] as DC2
        [Admin Controller] as AdmC
    }
    
    package "Middleware" {
        [Auth Middleware] as AM
        [Validation Middleware] as VM
        [Error Handler] as EH
    }
}

package "Database Layer" #D4EDDA {
    [Supabase Client] as SC
    [Migration Scripts] as MS
    [RLS Policies] as RLS
}

HP --> AuthCtx
LP --> AF
RP --> AF
BP --> DS
BP --> DC
BP --> DPicker
BP --> TS
AP --> APC
DP --> APC

AF --> AuthSvc
DS --> DeptSvc
DC --> DocSvc
APC --> ApptSvc

AuthSvc --> AR
ApptSvc --> AppR
DocSvc --> DR
DeptSvc --> DR

AR --> AC
AppR --> APC2
DR --> DC2
AdmR --> AdmC

AC --> AM
APC2 --> AM
APC2 --> VM
DC2 --> AM

AC --> SC
APC2 --> SC
DC2 --> SC
AdmC --> SC

@enduml
```

---

## 6. Deployment Diagram

```plantuml
@startuml HealthBook_Deployment
skinparam backgroundColor #FFFFFF
skinparam nodeBorderColor #667EEA
skinparam componentBorderColor #667EEA

title HealthBook - Deployment Architecture

node "User Devices" {
    component "Web Browser" as WB #89CFF0
    component "Mobile Browser" as MB #89CFF0
}

cloud "Vercel (Frontend Hosting)" #E8F4FD {
    component "React SPA" as SPA
    component "Static Assets" as SA
}

cloud "Railway/Render (Backend Hosting)" #FFF3CD {
    component "Express.js Server" as ES
    component "API Endpoints" as AE
    component "Email Worker" as EW
}

cloud "Supabase Cloud" #D4EDDA {
    database "PostgreSQL" as PG
    component "Auth Service" as AUTH
    component "RLS Engine" as RLS
    component "Real-time Engine" as RT
}

node "SMTP Provider" #FFE4E1 {
    component "Email Server" as SMTP
}

WB --> SPA : HTTPS
MB --> SPA : HTTPS
SPA --> AE : REST API (HTTPS)
SPA --> AUTH : JWT Auth

ES --> AE
EW --> SMTP : Send Emails

AE --> PG : Supabase Client
AUTH --> PG : User Data
RLS --> PG : Access Control

@enduml
```

---

## 7. State Diagram - Appointment Lifecycle

```plantuml
@startuml Appointment_States
skinparam backgroundColor #FFFFFF
skinparam stateBorderColor #667EEA
skinparam stateBackgroundColor #F8F9FA

title Appointment Status Lifecycle

[*] --> Pending : Create Appointment

state Pending #FFFACD {
    Pending : Awaiting confirmation
    Pending : Email sent to patient
}

state Confirmed #90EE90 {
    Confirmed : Appointment accepted
    Confirmed : Reminder scheduled
}

state Completed #87CEEB {
    Completed : Visit completed
    Completed : Records updated
}

state Cancelled #FFB6C1 {
    Cancelled : By patient or admin
    Cancelled : Reason recorded
}

state NoShow #DDA0DD {
    NoShow : Patient didn't attend
    NoShow : Marked by admin
}

Pending --> Confirmed : Admin/Auto Confirm
Pending --> Cancelled : Patient/Admin Cancel

Confirmed --> Completed : Mark Complete
Confirmed --> Cancelled : Cancel Before Visit
Confirmed --> NoShow : Patient Absent

Completed --> [*]
Cancelled --> [*]
NoShow --> [*]

@enduml
```

---

## 8. Activity Diagram - Admin Workflow

```plantuml
@startuml Admin_Workflow
skinparam backgroundColor #FFFFFF
skinparam activityBorderColor #667EEA
skinparam activityBackgroundColor #F8F9FA

title Admin Workflow - Managing Appointments

start

:Admin Logs In;

:Open Admin Dashboard;

fork
    :View Calendar;
    :Filter by Date/Doctor/Department;
fork again
    :View Patient List;
    :Search Patients;
end fork

:Select Action;

switch (Action?)
case ( View Appointments )
    :Display Appointment List;
    :View Appointment Details;
    
case ( Manage Doctors )
    :Open Doctor Management;
    if (Add/Edit/Delete?) then (Add)
        :Fill Doctor Form;
        :Assign Department;
        :Set Availability;
        :Save Doctor;
    else (Edit)
        :Select Doctor;
        :Update Information;
        :Save Changes;
    endif
    
case ( Block Time Slot )
    :Select Doctor;
    :Choose Date Range;
    :Enter Reason;
    :Create Time Block;
    
case ( Confirm Appointment )
    :Select Pending Appointment;
    :Review Details;
    :Mark as Confirmed;
    :Send Confirmation Email;
    
case ( Cancel Appointment )
    :Select Appointment;
    :Enter Cancellation Reason;
    :Confirm Cancellation;
    :Notify Patient;
    
endswitch

:Return to Dashboard;

stop

@enduml
```

---

## 9. Class Diagram - Core Models

```plantuml
@startuml HealthBook_Classes
skinparam backgroundColor #FFFFFF
skinparam classBorderColor #667EEA
skinparam classBackgroundColor #F8F9FA

title HealthBook - Core Domain Models

class User {
    +id: UUID
    +email: String
    +role: UserRole
    +fullName: String
    +phone: String
    +dateOfBirth: Date
    +patientId: String
    +bloodType: BloodType
    +address: Address
    +emergencyContact: Contact
    +isActive: Boolean
    +createdAt: DateTime
    +updatedAt: DateTime
    --
    +register()
    +login()
    +updateProfile()
    +resetPassword()
}

class Department {
    +id: UUID
    +name: String
    +description: String
    +icon: String
    +color: String
    +displayOrder: Integer
    +isActive: Boolean
    --
    +getDoctors()
    +getActiveAppointments()
}

class Doctor {
    +id: UUID
    +userId: UUID
    +departmentId: UUID
    +specialization: String
    +qualifications: String[]
    +experience: Integer
    +licenseNumber: String
    +bio: String
    +consultationFee: Decimal
    +availability: JSON
    +ratingAverage: Decimal
    +ratingCount: Integer
    --
    +getAvailableSlots(date)
    +blockTimeSlot()
    +getAppointments()
}

class Appointment {
    +id: UUID
    +patientId: UUID
    +doctorId: UUID
    +departmentId: UUID
    +startTime: DateTime
    +endTime: DateTime
    +status: AppointmentStatus
    +reason: String
    +notes: String
    +cancellationReason: String
    --
    +book()
    +confirm()
    +cancel()
    +reschedule()
    +complete()
}

class TimeBlock {
    +id: UUID
    +doctorId: UUID
    +startTime: DateTime
    +endTime: DateTime
    +reason: BlockReason
    +notes: String
    +createdBy: UUID
    --
    +create()
    +delete()
}

enum UserRole {
    PATIENT
    ADMIN
    DOCTOR
}

enum AppointmentStatus {
    PENDING
    CONFIRMED
    CANCELLED
    COMPLETED
    NO_SHOW
}

enum BlockReason {
    VACATION
    CONFERENCE
    EMERGENCY
    PERSONAL
    UNAVAILABLE
}

User "1" -- "0..1" Doctor : has profile
User "1" -- "*" Appointment : books
Department "1" -- "*" Doctor : contains
Department "1" -- "*" Appointment : hosts
Doctor "1" -- "*" Appointment : attends
Doctor "1" -- "*" TimeBlock : has

@enduml
```

---

## 10. API Flow Diagram

```plantuml
@startuml API_Flow
skinparam backgroundColor #FFFFFF
skinparam packageBorderColor #667EEA

title HealthBook - API Request Flow

package "Client Request" #E8F4FD {
    component "HTTP Request" as REQ
}

package "Express Server" #FFF3CD {
    component "Rate Limiter" as RL
    component "CORS Handler" as CORS
    component "Auth Middleware" as AUTH
    component "Validation Middleware" as VAL
    component "Route Handler" as RH
    component "Controller" as CTRL
    component "Error Handler" as ERR
}

package "Data Layer" #D4EDDA {
    component "Supabase Client" as SC
    database "PostgreSQL" as DB
}

package "Response" #FFE4E1 {
    component "JSON Response" as RES
}

REQ --> RL
RL --> CORS
CORS --> AUTH
AUTH --> VAL : If Protected Route
VAL --> RH
RH --> CTRL
CTRL --> SC
SC --> DB
DB --> SC
SC --> CTRL
CTRL --> RES

AUTH --> ERR : Unauthorized
VAL --> ERR : Validation Error
CTRL --> ERR : Business Error
ERR --> RES : Error Response

@enduml
```

---

## How to Use These Diagrams

1. **Copy the PlantUML code** between the \`\`\`plantuml tags
2. **Generate images** using:
   - [PlantUML Online Server](https://www.plantuml.com/plantuml/uml/)
   - [PlantText](https://www.planttext.com/)
   - VS Code PlantUML Extension
   - IntelliJ IDEA PlantUML Plugin
3. **Export as PNG/SVG** for your PowerPoint presentation

## Recommended Diagrams for PPT

| Slide Purpose | Recommended Diagram |
|---------------|---------------------|
| System Overview | #1 System Architecture |
| Database Design | #2 ERD Diagram |
| User Journey | #3 Sequence Diagram |
| Features Overview | #4 Use Case Diagram |
| Technical Stack | #5 Component Diagram |
| Deployment Plan | #6 Deployment Diagram |
| Business Logic | #7 State Diagram |
| Admin Features | #8 Activity Diagram |
