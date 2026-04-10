/**
 * Seed Patient History for Om Parab
 * Creates realistic completed + upcoming appointments
 */

const SUPABASE_URL = 'https://ibzeknzhdemrxrwnrvdy.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemVrbnpoZGVtcnhyd25ydmR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc5OTMwNSwiZXhwIjoyMDkxMzc1MzA1fQ.rv6eFip2Gin9O4Ihp1tyLInG7NueXe-MSGDs1auvDQE';

// Om Parab's user ID
const OM_PATIENT_ID = 'fb399676-191b-4fe6-80b9-da5573d0af65';

// Doctor records
const DOCTORS = {
  cardiology:   { id: 'fa5be8c9-7e06-4ee9-9cd1-9dc4cbf62f9f', dept_id: '3d129756-b0d4-4677-a831-5518e2e2344a' },
  neurology:    { id: 'e3944887-8f5b-404e-9ebd-e3881c83cd35', dept_id: 'a83915e9-b342-4b10-84e0-0a552114bdad' },
  orthopedics:  { id: 'f67c0e41-cd2e-47e5-8758-afd5bb2db7f7', dept_id: '80c29e79-1d15-4156-898d-7ef72bd5e10f' },
  general:      { id: 'df0fb215-64f1-42e4-968d-f31970d9e84b', dept_id: '978258d9-261f-4d1a-8e4a-43cafc84698b' },
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(14, 0, 0, 0);
  return d;
}

function endTime(start) {
  return new Date(start.getTime() + 30 * 60 * 1000);
}

const APPOINTMENTS = [
  // --- 5 Completed (past) ---
  {
    patient_id: OM_PATIENT_ID,
    doctor_id: DOCTORS.cardiology.id,
    department_id: DOCTORS.cardiology.dept_id,
    start_time: daysAgo(45).toISOString(),
    end_time: endTime(daysAgo(45)).toISOString(),
    status: 'completed',
    reason: 'Routine cardiac check-up — mild chest discomfort during exercise',
    notes: 'Patient reports occasional chest tightness during jogging. ECG: Normal sinus rhythm. BP: 128/82. No ST-segment changes. Recommended treadmill stress test in 2 weeks. Cleared for moderate exercise.',
  },
  {
    patient_id: OM_PATIENT_ID,
    doctor_id: DOCTORS.neurology.id,
    department_id: DOCTORS.neurology.dept_id,
    start_time: daysAgo(30).toISOString(),
    end_time: endTime(daysAgo(30)).toISOString(),
    status: 'completed',
    reason: 'Recurring tension headaches — 2-3 times per week for 1 month',
    notes: 'Patient describes bilateral pressing headaches, worse end of day. Neurological exam unremarkable. No papilledema. Likely tension-type headache. Prescribed Amitriptyline 10mg at bedtime. Follow up in 4 weeks.',
  },
  {
    patient_id: OM_PATIENT_ID,
    doctor_id: DOCTORS.general.id,
    department_id: DOCTORS.general.dept_id,
    start_time: daysAgo(20).toISOString(),
    end_time: endTime(daysAgo(20)).toISOString(),
    status: 'completed',
    reason: 'Annual health screening — blood panel and general wellness',
    notes: 'Vitals normal: BP 120/78, HR 72, SpO2 98%. BMI 23.4. CBC within range. LDL slightly elevated at 135 mg/dL — dietary modification advised. HbA1c 5.2% (normal). Vitamin D: 22 ng/mL (low) — supplement 60K IU weekly x8. Flu vaccination administered.',
  },
  {
    patient_id: OM_PATIENT_ID,
    doctor_id: DOCTORS.orthopedics.id,
    department_id: DOCTORS.orthopedics.dept_id,
    start_time: daysAgo(14).toISOString(),
    end_time: endTime(daysAgo(14)).toISOString(),
    status: 'completed',
    reason: 'Lower back pain — worsening over 3 weeks, radiating to left leg',
    notes: 'SLR test positive on left at 40°. Motor/sensory intact. MRI recommended to rule out disc herniation. Prescribed Diclofenac 50mg BD x7 days + physiotherapy referral.',
  },
  {
    patient_id: OM_PATIENT_ID,
    doctor_id: DOCTORS.cardiology.id,
    department_id: DOCTORS.cardiology.dept_id,
    start_time: daysAgo(7).toISOString(),
    end_time: endTime(daysAgo(7)).toISOString(),
    status: 'completed',
    reason: 'Follow-up: Stress test results review',
    notes: 'TMT: Adequate stress achieved. No inducible ischemia. EF: 62%. Patient reassured. Continue regular exercise. Next follow-up in 6 months.',
  },

  // --- 2 Upcoming ---
  {
    patient_id: OM_PATIENT_ID,
    doctor_id: DOCTORS.neurology.id,
    department_id: DOCTORS.neurology.dept_id,
    start_time: daysFromNow(3).toISOString(),
    end_time: endTime(daysFromNow(3)).toISOString(),
    status: 'confirmed',
    reason: 'Follow-up: Headache management — Amitriptyline response',
    notes: 'Review medication effectiveness after 4-week trial.',
  },
  {
    patient_id: OM_PATIENT_ID,
    doctor_id: DOCTORS.general.id,
    department_id: DOCTORS.general.dept_id,
    start_time: daysFromNow(10).toISOString(),
    end_time: endTime(daysFromNow(10)).toISOString(),
    status: 'pending',
    reason: 'Vitamin D recheck — after 8-week supplementation',
    notes: 'Follow-up blood work to verify Vitamin D levels post-supplementation.',
  },
];

async function main() {
  console.log('🏥 Seeding appointment history for Om Parab...\n');

  for (const apt of APPOINTMENTS) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(apt),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`  ✅ ${apt.status.toUpperCase()} | ${apt.reason.substring(0, 60)}...`);
    } else {
      const err = await res.text();
      console.error(`  ❌ Failed: ${err}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Done! ${APPOINTMENTS.length} appointments seeded for Om Parab`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
