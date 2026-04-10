<#
  build-hackathon-zips.ps1
  ========================
  Packages the healthcare_appointment project into 4 layered ZIPs
  for staged hackathon assembly. Each ZIP overlays the previous.

  Usage:  .\build-hackathon-zips.ps1
  Output: hackathon-zips\healthbook-foundation.zip
          hackathon-zips\healthbook-core.zip
          hackathon-zips\healthbook-advanced.zip
          hackathon-zips\healthbook-polish.zip
#>

$ErrorActionPreference = "Stop"

$ROOT    = $PSScriptRoot
$OUT_DIR = Join-Path $ROOT "hackathon-zips"
$STAGING = Join-Path $ROOT ".hackathon-staging"

# Clean previous
if (Test-Path $OUT_DIR)  { Remove-Item $OUT_DIR  -Recurse -Force }
if (Test-Path $STAGING)  { Remove-Item $STAGING  -Recurse -Force }
New-Item -ItemType Directory -Path $OUT_DIR | Out-Null

# ---------------------------------------------------------------------------
# Helper: Copy a list of files/dirs from project root into a staging folder
# ---------------------------------------------------------------------------
function Copy-ToStage {
    param(
        [string]$StageDir,
        [string[]]$Paths
    )
    foreach ($p in $Paths) {
        $src = Join-Path $ROOT $p
        if (-not (Test-Path $src)) {
            Write-Warning "  SKIP (not found): $p"
            continue
        }
        $dest = Join-Path $StageDir $p
        $destParent = Split-Path $dest -Parent
        if (-not (Test-Path $destParent)) {
            New-Item -ItemType Directory -Path $destParent -Force | Out-Null
        }
        if ((Get-Item $src).PSIsContainer) {
            Copy-Item $src $dest -Recurse -Force
        } else {
            Copy-Item $src $dest -Force
        }
    }
}

# ---------------------------------------------------------------------------
# Helper: Write a synthetic file into a staging folder
# ---------------------------------------------------------------------------
function Write-Synthetic {
    param(
        [string]$StageDir,
        [string]$RelPath,
        [string]$Content
    )
    $dest = Join-Path $StageDir $RelPath
    $destParent = Split-Path $dest -Parent
    if (-not (Test-Path $destParent)) {
        New-Item -ItemType Directory -Path $destParent -Force | Out-Null
    }
    Set-Content -Path $dest -Value $Content -Encoding UTF8
}

# ---------------------------------------------------------------------------
# Helper: Create ZIP from staging dir
# ---------------------------------------------------------------------------
function Build-Zip {
    param(
        [string]$StageDir,
        [string]$ZipName
    )
    $zipPath = Join-Path $OUT_DIR $ZipName
    Write-Host "  -> Compressing to $ZipName ..." -ForegroundColor Cyan
    Compress-Archive -Path "$StageDir\*" -DestinationPath $zipPath -Force
    $size = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    $count = (Get-ChildItem $StageDir -Recurse -File).Count
    Write-Host "     $count files, ${size} MB" -ForegroundColor Green
}


# ===========================================================================
#  ZIP 1 — Foundation Layer
# ===========================================================================
Write-Host "`n========== ZIP 1: Foundation Layer ==========" -ForegroundColor Yellow

$stage1 = Join-Path $STAGING "zip1"
New-Item -ItemType Directory -Path $stage1 | Out-Null

Copy-ToStage $stage1 @(
    # Root configs
    ".gitignore"
    "package.json"

    # Client configs
    "client\package.json"
    "client\package-lock.json"
    "client\vite.config.js"
    "client\tailwind.config.js"
    "client\postcss.config.js"
    "client\index.html"

    # React skeleton
    "client\src\main.jsx"
    "client\src\index.css"

    # Supabase client
    "client\src\lib\supabase.js"
    "client\src\lib\utils.js"

    # Supabase config + initial migration
    "supabase\migrations\001_initial_schema.sql"
)

# Synthetic App.jsx — skeleton
$appV1 = @'
/**
 * App Entry Point — Foundation
 */
import { BrowserRouter } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-100 flex flex-col items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl">🏥</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
                        HealthBook V2
                    </h1>
                    <p className="text-gray-500 text-lg">Initializing application...</p>
                    <div className="w-48 h-1 mx-auto bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
'@

Write-Synthetic $stage1 "client\src\App.jsx" $appV1

# Synthetic README
$readmeV1 = @'
# HealthBook V2

> AI-Powered Healthcare Appointment Management System

## Quick Start

```bash
cd client && npm install && npm run dev
```

## Tech Stack
- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **AI/ML:** FastAPI + scikit-learn + Groq LLM
'@

Write-Synthetic $stage1 "README.md" $readmeV1

Build-Zip $stage1 "healthbook-foundation.zip"


# ===========================================================================
#  ZIP 2 — Core Features
# ===========================================================================
Write-Host "`n========== ZIP 2: Core Features ==========" -ForegroundColor Yellow

$stage2 = Join-Path $STAGING "zip2"
New-Item -ItemType Directory -Path $stage2 | Out-Null

Copy-ToStage $stage2 @(
    # Auth context + hook
    "client\src\contexts\AuthContext.jsx"
    "client\src\hooks\useAuth.js"

    # Auth components
    "client\src\components\auth\LoginForm.jsx"
    "client\src\components\auth\RegisterForm.jsx"
    "client\src\components\auth\ForgotPasswordForm.jsx"
    "client\src\components\auth\ProtectedRoute.jsx"

    # Layout components (all)
    "client\src\components\layout"

    # UI component library (all)
    "client\src\components\ui\Alert.jsx"
    "client\src\components\ui\Animations.jsx"
    "client\src\components\ui\Avatar.jsx"
    "client\src\components\ui\Badge.jsx"
    "client\src\components\ui\Button.jsx"
    "client\src\components\ui\Calendar.jsx"
    "client\src\components\ui\Card.jsx"
    "client\src\components\ui\Dialog.jsx"
    "client\src\components\ui\Input.jsx"
    "client\src\components\ui\Label.jsx"
    "client\src\components\ui\Modal.jsx"
    "client\src\components\ui\ResponsiveTable.jsx"
    "client\src\components\ui\Select.jsx"
    "client\src\components\ui\Separator.jsx"
    "client\src\components\ui\Skeleton.jsx"
    "client\src\components\ui\Spinner.jsx"
    "client\src\components\ui\Table.jsx"
    "client\src\components\ui\Tabs.jsx"
    "client\src\components\ui\Toast.jsx"
    "client\src\components\ui\ToastProvider.jsx"
    "client\src\components\ui\Tooltip.jsx"
    "client\src\components\ui\index.js"

    # ErrorBoundary
    "client\src\components\ErrorBoundary.jsx"

    # Pages — public + basic protected
    "client\src\pages\Landing.jsx"
    "client\src\pages\Departments.jsx"
    "client\src\pages\Doctors.jsx"
    "client\src\pages\About.jsx"
    "client\src\pages\NotFound.jsx"
    "client\src\pages\Dashboard.jsx"
    "client\src\pages\Settings.jsx"

    # Services needed by these pages
    "client\src\services\departments.js"
    "client\src\services\doctors.js"
    "client\src\services\index.js"

    # Utils
    "client\src\utils\formatDoctorName.js"

    # DB migrations — RLS, indexes, seed data
    "supabase\migrations\002_rls_policies.sql"
    "supabase\migrations\003_indexes.sql"
    "supabase\migrations\005_seed_data.sql"
)

# Synthetic App.jsx — auth + public pages
$appV2 = @'
/**
 * App Entry Point — Core Features
 *
 * Auth, public pages, dashboard.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Pages
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import Doctors from '@/pages/Doctors';
import Departments from '@/pages/Departments';
import About from '@/pages/About';
import Settings from '@/pages/Settings';

// Auth pages
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

// Error Boundary
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <ToastProvider>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/register" element={<RegisterForm />} />
                            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                            <Route path="/doctors" element={<Doctors />} />
                            <Route path="/departments" element={<Departments />} />
                            <Route path="/about" element={<About />} />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <Settings />
                                    </ProtectedRoute>
                                }
                            />

                            {/* 404 */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>

                        {/* React Hot Toast */}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#fff',
                                    color: '#363636',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
                                },
                                success: {
                                    duration: 3000,
                                    style: {
                                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                        color: '#fff',
                                    },
                                },
                                error: {
                                    duration: 5000,
                                    style: {
                                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                        color: '#fff',
                                    },
                                },
                            }}
                        />
                    </ToastProvider>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
'@

Write-Synthetic $stage2 "client\src\App.jsx" $appV2

Build-Zip $stage2 "healthbook-core.zip"


# ===========================================================================
#  ZIP 3 — Advanced Features
# ===========================================================================
Write-Host "`n========== ZIP 3: Advanced Features ==========" -ForegroundColor Yellow

$stage3 = Join-Path $STAGING "zip3"
New-Item -ItemType Directory -Path $stage3 | Out-Null

Copy-ToStage $stage3 @(
    # Booking context
    "client\src\contexts\BookingContext.jsx"

    # Booking wizard components
    "client\src\components\booking"

    # Appointment management components
    "client\src\components\appointments"

    # Chatbot components
    "client\src\components\chatbot"

    # Patient booking/appointment pages
    "client\src\pages\BookAppointment.jsx"
    "client\src\pages\Appointments.jsx"

    # Admin portal
    "client\src\pages\admin"

    # Doctor portal
    "client\src\pages\doctor"

    # Services needed for booking/chat
    "client\src\services\appointments.js"
    "client\src\services\chatbot.js"
    "client\src\services\timeSlotUtils.js"

    # ML Service (no venv, no __pycache__, no models/)
    "ml-service\app.py"
    "ml-service\train.py"
    "ml-service\requirements.txt"

    # DB migration — functions & triggers
    "supabase\migrations\004_functions_triggers.sql"
)

# Synthetic App.jsx — full app minus ML dashboard pages
$appV3 = @'
/**
 * App Entry Point — Advanced Features
 *
 * Full app with booking, doctor/admin portals, chatbot.
 * ML health pages will be added in the final polish phase.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AdminLayout, DoctorLayout } from '@/components/layout';

// Pages
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import BookAppointment from '@/pages/BookAppointment';
import Appointments from '@/pages/Appointments';
import Doctors from '@/pages/Doctors';
import Departments from '@/pages/Departments';
import About from '@/pages/About';
import Settings from '@/pages/Settings';

// Auth pages
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

// Admin pages
import {
    AdminDashboard,
    AdminAppointments,
    AdminDoctors,
    AdminDepartments,
    AdminPatients,
} from '@/pages/admin';

// Doctor pages
import {
    DoctorDashboard,
    DoctorSchedule,
    DoctorAppointments,
    DoctorAvailability,
    AppointmentDetail,
    DoctorSettings,
} from '@/pages/doctor';

// Chatbot
import PatientChatBubble from '@/components/chatbot/PatientChatBubble';

// Error Boundary
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <ToastProvider>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/register" element={<RegisterForm />} />
                            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                            <Route path="/doctors" element={<Doctors />} />
                            <Route path="/departments" element={<Departments />} />
                            <Route path="/about" element={<About />} />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/book"
                                element={
                                    <ProtectedRoute>
                                        <BookAppointment />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/appointments"
                                element={
                                    <ProtectedRoute>
                                        <Appointments />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <Settings />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Doctor Portal Routes */}
                            <Route path="/doctor" element={<DoctorLayout />}>
                                <Route index element={<DoctorDashboard />} />
                                <Route path="schedule" element={<DoctorSchedule />} />
                                <Route path="appointments" element={<DoctorAppointments />} />
                                <Route path="appointments/:id" element={<AppointmentDetail />} />
                                <Route path="availability" element={<DoctorAvailability />} />
                                <Route path="settings" element={<DoctorSettings />} />
                            </Route>

                            {/* Admin Routes */}
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<AdminDashboard />} />
                                <Route path="appointments" element={<AdminAppointments />} />
                                <Route path="doctors" element={<AdminDoctors />} />
                                <Route path="departments" element={<AdminDepartments />} />
                                <Route path="patients" element={<AdminPatients />} />
                            </Route>

                            {/* 404 */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>

                        {/* AI Chatbot */}
                        <PatientChatBubble />

                        {/* React Hot Toast */}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#fff',
                                    color: '#363636',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
                                },
                                success: {
                                    duration: 3000,
                                    style: {
                                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                        color: '#fff',
                                    },
                                },
                                error: {
                                    duration: 5000,
                                    style: {
                                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                        color: '#fff',
                                    },
                                },
                            }}
                        />
                    </ToastProvider>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
'@

Write-Synthetic $stage3 "client\src\App.jsx" $appV3

# .env.example for ml-service
$envExample = @'
# HealthBook ML Service — Environment Variables
# Copy this file to .env and fill in your keys

# Groq API Key (get yours at https://console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here
'@

Write-Synthetic $stage3 "ml-service\.env.example" $envExample

Build-Zip $stage3 "healthbook-advanced.zip"


# ===========================================================================
#  ZIP 4 — Polish & Integration
# ===========================================================================
Write-Host "`n========== ZIP 4: Polish & Integration ==========" -ForegroundColor Yellow

$stage4 = Join-Path $STAGING "zip4"
New-Item -ItemType Directory -Path $stage4 | Out-Null

Copy-ToStage $stage4 @(
    # ML Dashboard pages
    "client\src\pages\HealthRiskAssessment.jsx"
    "client\src\pages\PatientVitals.jsx"

    # Email service
    "client\src\services\emailService.js"

    # Supabase Edge Functions
    "supabase\functions\send-booking-email"
    "supabase\functions\send-preventive-nudge"

    # Remaining DB migrations
    "supabase\migrations\006_fix_rls_policies.sql"
    "supabase\migrations\007_fix_user_select_rls.sql"
    "supabase\migrations\008_email_via_pg_net.sql"
    "supabase\migrations\009_update_email_domain.sql"

    # Demo helper
    "supabase\DISABLE_RLS_FOR_DEMO.sql"

    # Deployment configs
    "render.yaml"
    "vercel.json"
    "client\vercel.json"
)

# Final App.jsx — the real production version
Copy-ToStage $stage4 @("client\src\App.jsx")

# Full README
Copy-ToStage $stage4 @("README.md")

Build-Zip $stage4 "healthbook-polish.zip"


# ===========================================================================
#  Cleanup
# ===========================================================================
Write-Host "`n========== Cleanup ==========" -ForegroundColor Yellow
Remove-Item $STAGING -Recurse -Force
Write-Host "  Staging directory removed." -ForegroundColor Green

# ===========================================================================
#  Summary
# ===========================================================================
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  HACKATHON ZIPS READY!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Get-ChildItem $OUT_DIR | ForEach-Object {
    $s = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  $($_.Name) - $s MB" -ForegroundColor White
}
Write-Host ''
Write-Host "  Output: $OUT_DIR" -ForegroundColor Green
Write-Host ''
Write-Host '  Assembly Order:' -ForegroundColor Yellow
Write-Host '    1. healthbook-foundation.zip  (30 min)' -ForegroundColor White
Write-Host '    2. healthbook-core.zip        (45 min)' -ForegroundColor White
Write-Host '    3. healthbook-advanced.zip    (60 min)' -ForegroundColor White
Write-Host '    4. healthbook-polish.zip      (45 min)' -ForegroundColor White
Write-Host ""
