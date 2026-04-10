class ProtocolEngine:
    def __init__(self):
        # Established Medical Protocols (Simplified)
        self.protocols = {
            "Cardiology": {
                "high_risk": "🛑 EMERGENCY: Possible ACS. Administer 325mg Aspirin. Keep patient sitting. Prepare for EMS.",
                "low_risk": "⚠️ Follow-up: Schedule ECG within 24 hours. Monitor for chest pressure."
            },
            "Pulmonology": {
                "high_risk": "🛑 EMERGENCY: Respiratory Failure. Administer O2 if available. Check for airway obstruction.",
                "low_risk": "⚠️ Use rescue inhaler if prescribed. Monitor SpO2 levels every 4 hours."
            },
            "Dermatology": {
                "high_risk": "⚠️ Severe Reaction: Check for signs of Anaphylaxis (swelling). Seek urgent care.",
                "low_risk": "ℹ️ Apply cool compress. Avoid scratching. Take photos for specialist review."
            },
            "Infectious Disease": {
                "high_risk": "🛑 CRITICAL: Sepsis suspected. Immediate IV hydration and broad-spectrum antibiotics required.",
                "low_risk": "ℹ️ Monitor temperature. Increase fluid intake. Self-isolate until test results."
            }
        }

    def get_advice(self, specialty, risk_score):
        category = "high_risk" if risk_score > 70 else "low_risk"
        
        # Fallback if specialty not found
        specialty_data = self.protocols.get(specialty, {
            "high_risk": "🛑 Emergency: Please proceed to the nearest ER immediately.",
            "low_risk": "ℹ️ Advice: Monitor symptoms and consult a GP if pain persists."
        })
        
        return specialty_data[category]

# Example Test
engine = ProtocolEngine()
print(engine.get_advice("Cardiology", 85))