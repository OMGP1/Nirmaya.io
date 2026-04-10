import datetime
import uuid

class FHIRMapper:
    """Translates Niramaya AI outputs into HL7 FHIR R4 standard JSON."""

    @staticmethod
    def wrap_vitals(patient_id, hr, spo2, rr, risk_score):
        """Wraps IoT vitals and XGBoost Risk into a FHIR Observation."""
        return {
            "resourceType": "Observation",
            "id": str(uuid.uuid4()),
            "status": "final",
            "category": [{
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    "code": "vital-signs",
                    "display": "Vital Signs"
                }]
            }],
            "code": {
                "coding": [
                    {"system": "http://loinc.org", "code": "8867-4", "display": "Heart rate"},
                    {"system": "http://loinc.org", "code": "2708-6", "display": "Oxygen saturation"},
                    {"system": "http://loinc.org", "code": "9279-1", "display": "Respiratory rate"}
                ]
            },
            "subject": {"reference": f"Patient/{patient_id}"},
            # Updated to use modern timezone-aware datetime
            "effectiveDateTime": datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z'),
            "valueQuantity": {
                "value": hr,
                "unit": "beats/minute",
                "system": "http://unitsofmeasure.org",
                "code": "/min"
            },
            "interpretation": [{
                "text": f"Niramaya Risk Vector: {risk_score}%",
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                    "code": "A" if risk_score < 75 else "AA", 
                    "display": "Abnormal" if risk_score > 40 else "Normal"
                }]
            }]
        }

    @staticmethod
    def wrap_triage(patient_id, symptoms, specialty):
        """Wraps BERT Triage result into a FHIR Condition."""
        return {
            "resourceType": "Condition",
            "id": str(uuid.uuid4()),
            "clinicalStatus": {
                "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]
            },
            "verificationStatus": {
                "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-verstatus", "code": "provisional"}]
            },
            "category": [{
                "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-category", "code": "problem-list-item"}]
            }],
            "code": {"text": f"Symptom: {symptoms}"},
            "subject": {"reference": f"Patient/{patient_id}"},
            "note": [{"text": f"AI Suggested Specialty: {specialty}"}]
        }

# --- TEST BLOCK ---
if __name__ == "__main__":
    mapper = FHIRMapper()
    # Test a vital wrap
    test_obs = mapper.wrap_vitals("demo-user", 120, 94.5, 22, 82.5)
    print("FHIR Observation generated successfully:")
    print(test_obs["effectiveDateTime"])