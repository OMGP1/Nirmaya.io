/**
 * Seed Patient Documents v2 — Unique clinical histories per real patient
 * 
 * Creates rich, differentiated medical histories:
 *   Om Parab         → Stable athlete, routine wellness (Low Risk)
 *   Havish Kanojia   → Cardiac / respiratory concerns (Moderate Risk)
 *   Omprakash Jat    → Multi-organ critical history (High Risk / SOS tier)
 *   Test Patient     → General check-up (Baseline)
 *   Others           → Basic wellness records
 */

const SUPABASE_URL = 'https://ibzeknzhdemrxrwnrvdy.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemVrbnpoZGVtcnhyd25ydmR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc5OTMwNSwiZXhwIjoyMDkxMzc1MzA1fQ.rv6eFip2Gin9O4Ihp1tyLInG7NueXe-MSGDs1auvDQE';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
};

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

// ─── Step 1: Fetch patients from public.users ───
async function getPatients() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/users?role=eq.patient&select=id,full_name,email`,
    { headers }
  );
  return await res.json();
}

// ─── Step 2: Clear existing seeded documents ───
async function clearDocuments() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/patient_documents?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'DELETE',
    headers: { ...headers, 'Prefer': 'return=minimal' },
  });
  console.log(`🗑️  Cleared existing documents (status: ${res.status})`);
}

// ─── Step 3: Unique document templates per patient ───
function getDocumentsForPatient(patient) {
  const name = (patient.full_name || '').toLowerCase();
  const email = (patient.email || '').toLowerCase();
  const pid = patient.id;

  // ════════════════════════════════════════════════════════════════
  // Om Parab — Healthy Athlete, Routine Wellness (LOW RISK)
  // ════════════════════════════════════════════════════════════════
  if (name.includes('om parab')) {
    return [
      {
        patient_id: pid,
        file_name: 'Sports_Medical_Clearance_2026.pdf',
        file_path: `${pid}/sports_clearance_2026.pdf`,
        file_type: 'application/pdf',
        file_size: 285000,
        description: 'Annual sports medical — VO2max 52 mL/kg/min (excellent). Resting HR 58 bpm. ECG normal. Cleared for competitive sport.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(20),
      },
      {
        patient_id: pid,
        file_name: 'Complete_Blood_Count_Mar2026.pdf',
        file_path: `${pid}/cbc_mar2026.pdf`,
        file_type: 'application/pdf',
        file_size: 124000,
        description: 'CBC: WBC 5.8, Hgb 15.1, Plt 267. Iron panel: Ferritin 85 ng/mL. All optimal for athlete.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(18),
      },
      {
        patient_id: pid,
        file_name: 'Vitamin_D_B12_Panel.pdf',
        file_path: `${pid}/vitamin_panel_2026.pdf`,
        file_type: 'application/pdf',
        file_size: 98000,
        description: 'Vitamin D: 42 ng/mL (sufficient). B12: 680 pg/mL (normal). Folate: 14 ng/mL.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(18),
      },
      {
        patient_id: pid,
        file_name: 'Rx_Whey_Protein_Supplement.pdf',
        file_path: `${pid}/rx_protein_supplement.pdf`,
        file_type: 'application/pdf',
        file_size: 56000,
        description: 'Whey protein isolate 30g post-workout + Omega-3 fish oil 1000mg daily. Nutritionist recommendation.',
        document_type: 'prescription',
        uploaded_at: daysAgo(19),
      },
      {
        patient_id: pid,
        file_name: 'Shoulder_Ultrasound_Jan2026.pdf',
        file_path: `${pid}/shoulder_us_jan2026.pdf`,
        file_type: 'application/pdf',
        file_size: 1560000,
        description: 'Right shoulder ultrasound — mild supraspinatus tendinosis, no tear, no bursitis. Rotator cuff intact.',
        document_type: 'imaging',
        uploaded_at: daysAgo(65),
      },
      {
        patient_id: pid,
        file_name: 'Vaccination_Record_Updated.pdf',
        file_path: `${pid}/vaccination_record.pdf`,
        file_type: 'application/pdf',
        file_size: 132000,
        description: 'COVID-19 booster (Mar 2026), Flu (Oct 2025), Tdap (2024), Hepatitis B complete series. All current.',
        document_type: 'other',
        uploaded_at: daysAgo(15),
      },
      {
        patient_id: pid,
        file_name: 'DEXA_Scan_Body_Composition.pdf',
        file_path: `${pid}/dexa_scan_2026.pdf`,
        file_type: 'application/pdf',
        file_size: 245000,
        description: 'DEXA scan: Body fat 14.2%, lean mass 68.4 kg, bone density T-score +1.2 (above average). Excellent baseline.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(22),
      },
    ];
  }

  // ════════════════════════════════════════════════════════════════
  // Havish Kanojia — Cardiac + Respiratory Concerns (MODERATE RISK)
  // ════════════════════════════════════════════════════════════════
  if (name.includes('havish')) {
    return [
      {
        patient_id: pid,
        file_name: 'ECG_12Lead_Feb2026.pdf',
        file_path: `${pid}/ecg_12lead_feb2026.pdf`,
        file_type: 'application/pdf',
        file_size: 198000,
        description: '12-lead ECG — sinus tachycardia HR 102, left axis deviation. P-wave notching in lead II. No ST changes.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(35),
      },
      {
        patient_id: pid,
        file_name: 'Echocardiogram_Report.pdf',
        file_path: `${pid}/echo_feb2026.pdf`,
        file_type: 'application/pdf',
        file_size: 420000,
        description: 'Transthoracic echo — LVEF 52% (borderline low), mild mitral regurgitation, mild LV hypertrophy. No pericardial effusion.',
        document_type: 'imaging',
        uploaded_at: daysAgo(34),
      },
      {
        patient_id: pid,
        file_name: 'Lipid_Panel_Inflammatory_Markers.pdf',
        file_path: `${pid}/lipid_crp_feb2026.pdf`,
        file_type: 'application/pdf',
        file_size: 156000,
        description: 'LDL 172 mg/dL (HIGH), HDL 38 (LOW), TG 248 (HIGH). hs-CRP 3.8 mg/L (elevated cardiac risk).',
        document_type: 'lab_report',
        uploaded_at: daysAgo(33),
      },
      {
        patient_id: pid,
        file_name: 'Chest_CT_Mar2026.pdf',
        file_path: `${pid}/chest_ct_mar2026.pdf`,
        file_type: 'application/pdf',
        file_size: 3200000,
        description: 'HRCT chest — bilateral ground-glass opacities in lower lobes, mild bronchial wall thickening. R/O early ILD vs reactive airways.',
        document_type: 'imaging',
        uploaded_at: daysAgo(20),
      },
      {
        patient_id: pid,
        file_name: 'Pulmonary_Function_Test.pdf',
        file_path: `${pid}/pft_mar2026.pdf`,
        file_type: 'application/pdf',
        file_size: 210000,
        description: 'Spirometry: FEV1 72% predicted (mild obstruction), FVC 84%, FEV1/FVC 0.68. Positive bronchodilator response.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(19),
      },
      {
        patient_id: pid,
        file_name: 'Rx_Cardiac_Respiratory.pdf',
        file_path: `${pid}/rx_cardiac_resp.pdf`,
        file_type: 'application/pdf',
        file_size: 88000,
        description: 'Rosuvastatin 10mg daily, Metoprolol 25mg BD, Montelukast 10mg HS, Salbutamol MDI 2 puffs PRN.',
        document_type: 'prescription',
        uploaded_at: daysAgo(32),
      },
      {
        patient_id: pid,
        file_name: 'Holter_Monitor_48Hr.pdf',
        file_path: `${pid}/holter_48hr_jan2026.pdf`,
        file_type: 'application/pdf',
        file_size: 340000,
        description: '48-hour Holter — avg HR 94 bpm, max 138 bpm (during activity). 12 PACs, 3 short SVT runs (4-6 beats). No VT.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(55),
      },
      {
        patient_id: pid,
        file_name: 'Sleep_Study_Report.pdf',
        file_path: `${pid}/sleep_study_dec2025.pdf`,
        file_type: 'application/pdf',
        file_size: 275000,
        description: 'Polysomnography — AHI 18.3 events/hr (moderate OSA), SpO2 nadir 84%, REM-predominant apneas. CPAP recommended.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(100),
      },
    ];
  }

  // ════════════════════════════════════════════════════════════════
  // Omprakash Jat — Multi-organ Critical History (HIGH RISK / SOS)
  // ════════════════════════════════════════════════════════════════
  if (name.includes('omprakash')) {
    return [
      {
        patient_id: pid,
        file_name: 'ICU_Discharge_Summary_Jan2026.pdf',
        file_path: `${pid}/icu_discharge_jan2026.pdf`,
        file_type: 'application/pdf',
        file_size: 480000,
        description: 'ICU stay 5 days — acute decompensated heart failure with pulmonary edema. Intubated 48hr. IV Furosemide drip. Discharged on oral diuretics.',
        document_type: 'discharge_summary',
        uploaded_at: daysAgo(85),
      },
      {
        patient_id: pid,
        file_name: 'Cardiac_Catheterization_Report.pdf',
        file_path: `${pid}/cath_report_dec2025.pdf`,
        file_type: 'application/pdf',
        file_size: 560000,
        description: 'Left heart cath — 80% LAD stenosis, 60% RCA stenosis, LVEF 30%. Referred for CABG evaluation.',
        document_type: 'imaging',
        uploaded_at: daysAgo(110),
      },
      {
        patient_id: pid,
        file_name: 'Coronary_Angiogram_Images.jpg',
        file_path: `${pid}/angiogram_dec2025.jpg`,
        file_type: 'image/jpeg',
        file_size: 6400000,
        description: 'Coronary angiogram — significant triple vessel disease. LAD 80%, LCx 50%, RCA 60%. Potential CABG candidate.',
        document_type: 'imaging',
        uploaded_at: daysAgo(110),
      },
      {
        patient_id: pid,
        file_name: 'Renal_Function_BNP_Panel.pdf',
        file_path: `${pid}/renal_bnp_feb2026.pdf`,
        file_type: 'application/pdf',
        file_size: 175000,
        description: 'Creatinine 1.8 mg/dL (HIGH), eGFR 42 (Stage 3b CKD). BNP 890 pg/mL (markedly elevated — heart failure). K+ 5.3 mEq/L.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(40),
      },
      {
        patient_id: pid,
        file_name: 'Rx_Heart_Failure_Regimen.pdf',
        file_path: `${pid}/rx_hf_regimen.pdf`,
        file_type: 'application/pdf',
        file_size: 112000,
        description: 'Sacubitril/Valsartan 24/26mg BD, Carvedilol 6.25mg BD, Spironolactone 25mg daily, Furosemide 40mg daily, Dapagliflozin 10mg daily.',
        document_type: 'prescription',
        uploaded_at: daysAgo(84),
      },
      {
        patient_id: pid,
        file_name: 'Chest_Xray_Cardiomegaly.jpg',
        file_path: `${pid}/cxr_cardiomegaly_feb2026.jpg`,
        file_type: 'image/jpeg',
        file_size: 2100000,
        description: 'PA Chest X-ray — significant cardiomegaly (CTR 0.62), bilateral pleural effusions, pulmonary vascular congestion.',
        document_type: 'imaging',
        uploaded_at: daysAgo(38),
      },
      {
        patient_id: pid,
        file_name: 'Diabetes_HbA1c_Panel.pdf',
        file_path: `${pid}/hba1c_diabetes_mar2026.pdf`,
        file_type: 'application/pdf',
        file_size: 135000,
        description: 'HbA1c: 8.4% (poorly controlled DM2). Fasting glucose 182 mg/dL. C-peptide 1.2 ng/mL. Microalbumin/Cr ratio 145 (elevated).',
        document_type: 'lab_report',
        uploaded_at: daysAgo(25),
      },
      {
        patient_id: pid,
        file_name: 'Rx_Diabetes_Insulin.pdf',
        file_path: `${pid}/rx_insulin_mar2026.pdf`,
        file_type: 'application/pdf',
        file_size: 92000,
        description: 'Insulin Glargine 18 units bedtime + Lispro sliding scale before meals. Metformin 500mg BD (renal-dose adjusted).',
        document_type: 'prescription',
        uploaded_at: daysAgo(24),
      },
      {
        patient_id: pid,
        file_name: 'ER_Visit_Hypotension_Mar2026.pdf',
        file_path: `${pid}/er_hypotension_mar2026.pdf`,
        file_type: 'application/pdf',
        file_size: 395000,
        description: 'ER visit — presented with syncope, BP 78/50, HR 132. IV NS 2L bolus. Troponin 0.08 (borderline). Admission for observation.',
        document_type: 'discharge_summary',
        uploaded_at: daysAgo(12),
      },
      {
        patient_id: pid,
        file_name: 'ICD_Implant_Evaluation.pdf',
        file_path: `${pid}/icd_eval_feb2026.pdf`,
        file_type: 'application/pdf',
        file_size: 310000,
        description: 'EP study — LVEF 30%, NSVT on Holter, primary prevention ICD recommended. Pre-implant assessment complete.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(50),
      },
    ];
  }

  // ════════════════════════════════════════════════════════════════
  // Test Patient — General Health Baseline (DEFAULT)
  // ════════════════════════════════════════════════════════════════
  if (email.includes('patient@healthbook')) {
    return [
      {
        patient_id: pid,
        file_name: 'Annual_Physical_2026.pdf',
        file_path: `${pid}/annual_physical_2026.pdf`,
        file_type: 'application/pdf',
        file_size: 320000,
        description: 'Annual physical — BMI 24.5, BP 122/78, all vitals normal. No acute concerns. Cleared for routine activity.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(15),
      },
      {
        patient_id: pid,
        file_name: 'CBC_Metabolic_Panel.pdf',
        file_path: `${pid}/cbc_cmp_2026.pdf`,
        file_type: 'application/pdf',
        file_size: 198000,
        description: 'CBC: WBC 6.8, Hgb 14.2, Plt 245. CMP: Glucose 95, Creatinine 0.9, eGFR >90. All within normal limits.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(14),
      },
      {
        patient_id: pid,
        file_name: 'Rx_Vitamin_D_Supplement.pdf',
        file_path: `${pid}/rx_vitamin_d.pdf`,
        file_type: 'application/pdf',
        file_size: 64000,
        description: 'Vitamin D3 60000 IU weekly x 8 weeks, then 1000 IU daily. Level was 18 ng/mL (deficient).',
        document_type: 'prescription',
        uploaded_at: daysAgo(14),
      },
      {
        patient_id: pid,
        file_name: 'Allergy_Panel_Results.pdf',
        file_path: `${pid}/allergy_panel_2026.pdf`,
        file_type: 'application/pdf',
        file_size: 178000,
        description: 'IgE panel: Dust mites (moderate), Cat dander (mild), Pollen mix (strong positive). Total IgE 285 IU/mL.',
        document_type: 'lab_report',
        uploaded_at: daysAgo(30),
      },
      {
        patient_id: pid,
        file_name: 'Vaccination_Record.pdf',
        file_path: `${pid}/vaccination_record.pdf`,
        file_type: 'application/pdf',
        file_size: 145000,
        description: 'COVID-19 booster (Mar 2026), Flu (Oct 2025), Tdap (2023). Hepatitis A/B complete. All immunizations current.',
        document_type: 'other',
        uploaded_at: daysAgo(12),
      },
      {
        patient_id: pid,
        file_name: 'Dental_Clearance.pdf',
        file_path: `${pid}/dental_clearance_2026.pdf`,
        file_type: 'application/pdf',
        file_size: 87000,
        description: 'Dental exam — no caries, mild gingivitis treated with scaling. OPG normal. Cleared for medical procedures.',
        document_type: 'other',
        uploaded_at: daysAgo(40),
      },
    ];
  }

  // ════════════════════════════════════════════════════════════════
  // Any other patient — minimal wellness docs
  // ════════════════════════════════════════════════════════════════
  return [
    {
      patient_id: pid,
      file_name: 'Routine_Blood_Work_2026.pdf',
      file_path: `${pid}/routine_blood_2026.pdf`,
      file_type: 'application/pdf',
      file_size: 165000,
      description: `Routine blood work for ${patient.full_name}. CBC, CMP, lipid panel — all within normal limits.`,
      document_type: 'lab_report',
      uploaded_at: daysAgo(10),
    },
    {
      patient_id: pid,
      file_name: 'Immunization_History.pdf',
      file_path: `${pid}/immunization_history.pdf`,
      file_type: 'application/pdf',
      file_size: 98000,
      description: 'Complete immunization history. All mandatory vaccines up to date.',
      document_type: 'other',
      uploaded_at: daysAgo(30),
    },
    {
      patient_id: pid,
      file_name: 'General_Rx_Supplement.pdf',
      file_path: `${pid}/rx_supplement.pdf`,
      file_type: 'application/pdf',
      file_size: 52000,
      description: 'Multivitamin complex daily, Calcium + Vitamin D3. General wellness prescription.',
      document_type: 'prescription',
      uploaded_at: daysAgo(8),
    },
  ];
}


// ─── Insert documents via REST API ───
async function insertDocuments(docs) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/patient_documents`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify(docs),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Insert failed: ${res.status} — ${err}`);
  }
  return await res.json();
}


// ─── Main ───
async function main() {
  console.log('📋 Seeding unique patient document histories...\n');

  // Clean slate
  await clearDocuments();
  console.log('');

  // Get patients (excluding non-auth orphans)
  const patients = await getPatients();
  
  // Filter to only patients that actually exist in auth
  // (Skip orphaned seed data like 22222222-... UUIDs)
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, { headers });
  const authData = await authRes.json();
  const authIds = new Set(authData.users?.map(u => u.id) || []);

  const validPatients = patients.filter(p => authIds.has(p.id));
  console.log(`Found ${validPatients.length} valid patient(s) (out of ${patients.length} total)\n`);

  let totalDocs = 0;

  for (const patient of validPatients) {
    const docs = getDocumentsForPatient(patient);
    console.log(`📌 ${patient.full_name} (${patient.email})`);
    console.log(`   → ${docs.length} documents`);

    try {
      const inserted = await insertDocuments(docs);
      console.log(`   ✅ Inserted ${inserted.length} documents`);
      totalDocs += inserted.length;

      // Show type breakdown
      const types = {};
      docs.forEach(d => { types[d.document_type] = (types[d.document_type] || 0) + 1; });
      const summary = Object.entries(types).map(([k,v]) => `${v} ${k.replace('_',' ')}`).join(', ');
      console.log(`   📊 ${summary}`);

      // Show risk category
      const name = patient.full_name.toLowerCase();
      if (name.includes('om parab')) console.log('   🟢 Risk Profile: LOW (healthy athlete)');
      else if (name.includes('havish')) console.log('   🟡 Risk Profile: MODERATE (cardiac + respiratory)');
      else if (name.includes('omprakash')) console.log('   🔴 Risk Profile: HIGH / CRITICAL (multi-organ HF + DM2 + CKD)');
      else console.log('   ⚪ Risk Profile: BASELINE');
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Seeded ${totalDocs} documents across ${validPatients.length} patients`);
  console.log('');
  console.log('🏥 Clinical Summary for Command Centre:');
  console.log('   🟢 Om Parab      — 7 docs: Sports clearance, DEXA, CBC, shoulder US, vaccines');
  console.log('   🟡 Havish K.     — 8 docs: ECG, Echo, HRCT chest, PFT, Holter, sleep study, lipids');
  console.log('   🔴 Omprakash     — 10 docs: ICU discharge, cath report, angiogram, CKD labs, insulin Rx, ER visit');
  console.log('   ⚪ Test Patient  — 6 docs: Annual physical, CBC/CMP, allergy panel, vaccines, dental');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
