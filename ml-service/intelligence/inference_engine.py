import os
import torch
import xgboost as xgb
import numpy as np
from transformers import pipeline

class NiramayaBrain:
    def __init__(self, base_path="./intelligence"):
        """Initializes both AI models from the specified folder."""
        # Define internal paths
        triage_path = os.path.join(base_path, "triage/niramaya_triage_model")
        risk_path = os.path.join(base_path, "risk/risk_vector_model.json")
        
        print("🧠 Loading Niramaya Intelligence Layer...")
        
        # 1. Load BERT Triage Pipeline
        self.triage_pipe = pipeline(
            "text-classification", 
            model=triage_path, 
            tokenizer=triage_path
        )
        self.label_mapping = self.triage_pipe.model.config.id2label

        # 2. Load XGBoost Risk Model
        self.risk_model = xgb.Booster()
        self.risk_model.load_model(risk_path)
        
        print("✅ All systems online.")

    def get_triage(self, symptom_text):
        """Predicts the medical specialty based on text."""
        result = self.triage_pipe(symptom_text)[0]
        # Handle the LABEL_X mapping automatically
        label_idx = result['label']
        if 'LABEL' in label_idx:
            label_idx = int(label_idx.split('_')[-1])
            specialty = self.label_mapping[label_idx]
        else:
            specialty = label_idx
            
        return {
            "specialty": specialty,
            "confidence": round(result['score'], 4)
        }

    def get_risk(self, hr, spo2, rr):
        """Calculates 0-100 risk score based on vitals."""
        # Prep data for XGBoost
        vitals = np.array([[hr, spo2, rr]])
        dmat = xgb.DMatrix(vitals, feature_names=['hr', 'spo2', 'rr'])
        
        score = float(self.risk_model.predict(dmat)[0])
        
        # Clinical logic for status
        status = "STABLE"
        if score > 75: status = "CRITICAL"
        elif score > 40: status = "URGENT"
        
        return {
            "risk_score": round(score, 2),
            "status": status
        }

# --- TEST BLOCK (Only runs if you execute this file directly) ---
if __name__ == "__main__":
    # Test instance
    brain = NiramayaBrain(base_path="./") # Use ./ if running inside the folder
    
    print("\n--- Testing Triage ---")
    print(brain.get_triage("I have sharp chest pain and sweating."))
    
    print("\n--- Testing Risk ---")
    print(brain.get_risk(145, 85, 30)) # High distress vitals