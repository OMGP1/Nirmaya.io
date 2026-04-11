/**
 * NiramayaEngine — React-compatible Intelligence Engine
 * 
 * Port of the reference engine.js for use within the React ecosystem.
 * Handles: telemetry generation, NEWS2 risk scoring, symptom analysis,
 * and localStorage cross-tab synchronization.
 */

const NIRAMAYA_CONFIG = {
  isMock: true,
  anomalyThreshold: 45,
  sosThreshold: 75,
  tickRate: 3000,
  keys: {
    vitals: 'niramaya_vitals',
    risk: 'niramaya_risk_score',
    role: 'user_role',
    symptoms: 'niramaya_symptoms',
    triageResult: 'niramaya_triage_result',
  },
};

/* ===== Telemetry Generation ===== */
function generateMockVitals() {
  let profile = null;
  try {
    const cached = localStorage.getItem('niramaya_profile');
    if (cached) profile = JSON.parse(cached);
  } catch (e) {}

  const name = (profile?.full_name || '').toLowerCase();

  // 1. Low Risk - Om Parab (Stable)
  if (name.includes('om parab')) {
    return {
      hr: Math.floor(60 + Math.random() * 20), // 60-80
      spo2: Math.floor(96 + Math.random() * 4), // 96-100
      rr: Math.floor(12 + Math.random() * 4), // 12-16
      temp: (36.5 + Math.random() * 0.7).toFixed(1), // 36.5 - 37.2
      systolic: Math.floor(110 + Math.random() * 10), // 110-120
      diastolic: Math.floor(70 + Math.random() * 10), // 70-80
      timestamp: new Date().toISOString(),
    };
  }

  // 2. Moderate Risk - Havish Kanojia (Anomaly)
  if (name.includes('havish kanojia')) {
    return {
      hr: Math.floor(95 + Math.random() * 15), // 95-110
      spo2: Math.floor(93 + Math.random() * 2), // 93-95
      rr: Math.floor(20 + Math.random() * 2), // 20-22
      temp: (37.8 + Math.random() * 0.5).toFixed(1), // 37.8 - 38.3
      systolic: Math.floor(135 + Math.random() * 10), // 135-145
      diastolic: Math.floor(85 + Math.random() * 10), // 85-95
      timestamp: new Date().toISOString(),
    };
  }

  // 3. High Risk - Omprakash (Critical / SOS)
  if (name.includes('omprakash')) {
    return {
      hr: Math.floor(135 + Math.random() * 10), // >130 (3 pts)
      spo2: Math.floor(85 + Math.random() * 5), // <91 (3 pts)
      rr: Math.floor(26 + Math.random() * 4), // >25 (3 pts)
      temp: (39.5 + Math.random() * 0.5).toFixed(1), // >39.1 (3 pts)
      systolic: Math.floor(80 + Math.random() * 10), // <=90 (3 pts)
      diastolic: Math.floor(50 + Math.random() * 10), 
      timestamp: new Date().toISOString(),
    };
  }

  // 4. Default Mock (Randomized)
  return {
    hr: Math.floor(60 + Math.random() * 50),
    spo2: Math.floor(88 + Math.random() * 12),
    rr: Math.floor(12 + Math.random() * 16),
    temp: (36.5 + Math.random() * 2).toFixed(1),
    systolic: Math.floor(100 + Math.random() * 60),
    diastolic: Math.floor(60 + Math.random() * 40),
    timestamp: new Date().toISOString(),
  };
}

/* ===== NEWS2 Risk Calculation ===== */
function calculateNEWS2(vitals) {
  let score = 0;

  // Heart Rate scoring
  if (vitals.hr <= 40 || vitals.hr >= 131) score += 3;
  else if (vitals.hr >= 111) score += 2;
  else if (vitals.hr >= 91 || vitals.hr <= 50) score += 1;

  // SpO2 scoring
  if (vitals.spo2 <= 91) score += 3;
  else if (vitals.spo2 <= 93) score += 2;
  else if (vitals.spo2 <= 95) score += 1;

  // Respiratory Rate scoring
  if (vitals.rr <= 8 || vitals.rr >= 25) score += 3;
  else if (vitals.rr >= 21) score += 2;
  else if (vitals.rr >= 12 && vitals.rr <= 20) score += 0;
  else score += 1;

  // Temperature scoring
  const temp = parseFloat(vitals.temp);
  if (temp <= 35.0 || temp >= 39.1) score += 3;
  else if (temp >= 38.1) score += 2;
  else if (temp <= 36.0 || temp >= 38.0) score += 1;

  // Systolic BP scoring
  if (vitals.systolic <= 90 || vitals.systolic >= 220) score += 3;
  else if (vitals.systolic <= 100) score += 2;
  else if (vitals.systolic <= 110) score += 1;

  // Normalize to 0-100 scale (max NEWS2 raw = 18)
  return Math.min(Math.round((score / 18) * 100), 100);
}

/* ===== Risk State Determination ===== */
function getRiskState(riskScore) {
  if (riskScore >= NIRAMAYA_CONFIG.sosThreshold) return 'critical';
  if (riskScore >= NIRAMAYA_CONFIG.anomalyThreshold) return 'anomaly';
  return 'stable';
}

function getRiskLabel(state) {
  const labels = {
    stable: 'Stable — All Systems Nominal',
    anomaly: 'Anomaly Detected — Elevated Risk',
    critical: 'CRITICAL — Immediate Intervention Required',
  };
  return labels[state] || 'Unknown';
}

function getRiskColor(state) {
  const colors = {
    stable: 'var(--clinical-stable)',
    anomaly: 'var(--clinical-anomaly)',
    critical: 'var(--clinical-critical)',
  };
  return colors[state] || '#64748b';
}

function getRiskHex(state) {
  const colors = {
    stable: '#00d2c1',
    anomaly: '#ff9f1c',
    critical: '#e71d36',
  };
  return colors[state] || '#64748b';
}

/* ===== Symptom Analysis (Mock BioBERT) ===== */
function analyzeSymptoms(text) {
  const keywords = {
    cardiology: ['chest', 'heart', 'palpitation', 'angina', 'cardiac'],
    pulmonology: ['breath', 'lung', 'cough', 'wheezing', 'asthma'],
    neurology: ['headache', 'dizzy', 'numb', 'seizure', 'migraine'],
    gastroenterology: ['stomach', 'nausea', 'vomit', 'abdominal', 'digest'],
    orthopedics: ['bone', 'joint', 'fracture', 'pain', 'muscle'],
  };

  const lower = text.toLowerCase();
  let bestMatch = 'general';
  let bestScore = 0;

  for (const [dept, words] of Object.entries(keywords)) {
    const matches = words.filter((w) => lower.includes(w)).length;
    if (matches > bestScore) {
      bestScore = matches;
      bestMatch = dept;
    }
  }

  const result = {
    department: bestMatch,
    confidence: Math.min(0.65 + bestScore * 0.12, 0.98),
    severity: bestScore >= 2 ? 'high' : bestScore >= 1 ? 'moderate' : 'low',
    timestamp: new Date().toISOString(),
    inputText: text,
  };

  localStorage.setItem(NIRAMAYA_CONFIG.keys.symptoms, text);
  localStorage.setItem(NIRAMAYA_CONFIG.keys.triageResult, JSON.stringify(result));

  return result;
}

/* ===== SOS Utilities ===== */
function isSOSRequired(riskScore) {
  return riskScore >= NIRAMAYA_CONFIG.sosThreshold;
}

function getTriageTier(severity) {
  const tiers = {
    low: {
      label: 'Routine Care',
      color: '#22C55E',
      bgColor: '#22C55E10',
      borderColor: '#22C55E30',
      icon: '🟢',
      routing: 'symptom-based',
      description: 'Standard specialist matching based on symptoms',
    },
    moderate: {
      label: 'Specialist Consult',
      color: '#F59E0B',
      bgColor: '#F59E0B10',
      borderColor: '#F59E0B30',
      icon: '🟡',
      routing: 'symptom-based',
      description: 'Priority specialist matching with elevated attention',
    },
    high: {
      label: 'Immediate / SOS',
      color: '#EF4444',
      bgColor: '#EF444410',
      borderColor: '#EF444430',
      icon: '🔴',
      routing: 'proximity-based',
      description: 'GPS-based nearest doctor assignment for emergencies',
    },
  };
  return tiers[severity] || tiers.low;
}

/* ===== localStorage Sync ===== */
function broadcastVitals(vitals, riskScore) {
  localStorage.setItem(NIRAMAYA_CONFIG.keys.vitals, JSON.stringify(vitals));
  localStorage.setItem(NIRAMAYA_CONFIG.keys.risk, String(riskScore));
  window.dispatchEvent(new Event('niramaya_update'));
}

function getStoredVitals() {
  try {
    const raw = localStorage.getItem(NIRAMAYA_CONFIG.keys.vitals);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredRiskScore() {
  return parseInt(localStorage.getItem(NIRAMAYA_CONFIG.keys.risk) || '0', 10);
}

function getStoredTriageResult() {
  try {
    const raw = localStorage.getItem(NIRAMAYA_CONFIG.keys.triageResult);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ===== Engine Tick (for mock simulation) ===== */
let tickInterval = null;

function startEngine(onUpdate) {
  if (tickInterval) clearInterval(tickInterval);

  const tick = () => {
    const vitals = generateMockVitals();
    const riskScore = calculateNEWS2(vitals);
    broadcastVitals(vitals, riskScore);
    if (onUpdate) onUpdate(vitals, riskScore);
  };

  tick();
  tickInterval = setInterval(tick, NIRAMAYA_CONFIG.tickRate);
  return tickInterval;
}

function stopEngine() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

/* ===== Auth Convenience ===== */
function logout() {
  localStorage.removeItem(NIRAMAYA_CONFIG.keys.vitals);
  localStorage.removeItem(NIRAMAYA_CONFIG.keys.risk);
  localStorage.removeItem(NIRAMAYA_CONFIG.keys.role);
  localStorage.removeItem(NIRAMAYA_CONFIG.keys.symptoms);
  localStorage.removeItem(NIRAMAYA_CONFIG.keys.triageResult);
}

/* ===== React Hook Helper ===== */
function createStorageListener(callback) {
  const handler = (e) => {
    if (
      !e.key || 
      e.key === NIRAMAYA_CONFIG.keys.vitals ||
      e.key === NIRAMAYA_CONFIG.keys.risk
    ) {
      const vitals = getStoredVitals();
      const risk = getStoredRiskScore();
      if (vitals && risk !== null) callback(vitals, risk);
    }
  };
  window.addEventListener('storage', handler);
  window.addEventListener('niramaya_update', handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('niramaya_update', handler);
  };
}

/* ===== Export ===== */
const NiramayaEngine = {
  config: NIRAMAYA_CONFIG,
  generateMockVitals,
  calculateNEWS2,
  getRiskState,
  getRiskLabel,
  getRiskColor,
  getRiskHex,
  analyzeSymptoms,
  isSOSRequired,
  getTriageTier,
  broadcastVitals,
  getStoredVitals,
  getStoredRiskScore,
  getStoredTriageResult,
  startEngine,
  stopEngine,
  logout,
  createStorageListener,
};

export default NiramayaEngine;
export {
  NIRAMAYA_CONFIG,
  generateMockVitals,
  calculateNEWS2,
  getRiskState,
  getRiskLabel,
  getRiskColor,
  getRiskHex,
  analyzeSymptoms,
  isSOSRequired,
  getTriageTier,
  broadcastVitals,
  getStoredVitals,
  getStoredRiskScore,
  getStoredTriageResult,
  startEngine,
  stopEngine,
  createStorageListener,
};
