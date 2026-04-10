/**
 * useNiramaya — React hook for the NiramayaEngine
 * 
 * Provides live vitals, risk score, and state management
 * with automatic engine lifecycle management.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import NiramayaEngine from '@/utils/NiramayaEngine';

export function useNiramaya(autoStart = false) {
  const [vitals, setVitals] = useState(NiramayaEngine.getStoredVitals());
  const [riskScore, setRiskScore] = useState(NiramayaEngine.getStoredRiskScore());
  const engineRef = useRef(null);

  const riskState = NiramayaEngine.getRiskState(riskScore);
  const riskLabel = NiramayaEngine.getRiskLabel(riskState);
  const riskColor = NiramayaEngine.getRiskColor(riskState);
  const riskHex = NiramayaEngine.getRiskHex(riskState);

  const handleUpdate = useCallback((newVitals, newRisk) => {
    setVitals(newVitals);
    setRiskScore(newRisk);
  }, []);

  useEffect(() => {
    if (autoStart) {
      engineRef.current = NiramayaEngine.startEngine(handleUpdate);
    }

    const cleanup = NiramayaEngine.createStorageListener(handleUpdate);

    return () => {
      if (autoStart) NiramayaEngine.stopEngine();
      cleanup();
    };
  }, [autoStart, handleUpdate]);

  const start = useCallback(() => {
    engineRef.current = NiramayaEngine.startEngine(handleUpdate);
  }, [handleUpdate]);

  const stop = useCallback(() => {
    NiramayaEngine.stopEngine();
  }, []);

  const analyzeSymptoms = useCallback((text) => {
    return NiramayaEngine.analyzeSymptoms(text);
  }, []);

  return {
    vitals,
    riskScore,
    riskState,
    riskLabel,
    riskColor,
    riskHex,
    start,
    stop,
    analyzeSymptoms,
    isRunning: engineRef.current !== null,
  };
}

export default useNiramaya;
