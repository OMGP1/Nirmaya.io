"""
train.py — Cardiovascular Risk Model Trainer

Downloads (or reads a local copy of) the Cardiovascular Disease dataset,
engineers features, trains a Random Forest classifier, and serialises
it to `models/cardiovascular_model.pkl`.

Dataset: https://www.kaggle.com/datasets/sulianova/cardiovascular-disease-dataset
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib


def generate_synthetic_data(n_samples: int = 70000) -> pd.DataFrame:
    """Generate synthetic cardiovascular data when the Kaggle dataset
    is not available.  Distribution parameters mimic the real dataset."""
    rng = np.random.default_rng(42)

    age_days = rng.integers(10798, 23713, size=n_samples)  # ~29–65 yrs
    gender = rng.choice([1, 2], size=n_samples)
    height = rng.normal(164, 8, size=n_samples).astype(int)
    weight = rng.normal(74, 14, size=n_samples).astype(int)
    ap_hi = rng.normal(128, 20, size=n_samples).astype(int)   # systolic
    ap_lo = rng.normal(83, 12, size=n_samples).astype(int)     # diastolic
    cholesterol = rng.choice([1, 2, 3], size=n_samples, p=[0.52, 0.28, 0.20])
    gluc = rng.choice([1, 2, 3], size=n_samples, p=[0.58, 0.22, 0.20])
    smoke = rng.choice([0, 1], size=n_samples, p=[0.91, 0.09])
    alco = rng.choice([0, 1], size=n_samples, p=[0.95, 0.05])
    active = rng.choice([0, 1], size=n_samples, p=[0.20, 0.80])

    # ---- deterministic-ish target based on real risk factors ----
    age_years = age_days / 365
    bmi = weight / ((height / 100) ** 2)
    risk_score = (
        0.03 * age_years
        + 0.015 * (ap_hi - 120)
        + 0.01 * (ap_lo - 80)
        + 0.15 * (cholesterol - 1)
        + 0.10 * (gluc - 1)
        + 0.12 * smoke
        + 0.05 * alco
        - 0.10 * active
        + 0.03 * np.clip(bmi - 25, 0, None)
    )
    noise = rng.normal(0, 0.3, size=n_samples)
    cardio = (risk_score + noise > 1.5).astype(int)

    df = pd.DataFrame({
        "id": range(1, n_samples + 1),
        "age": age_days,
        "gender": gender,
        "height": height,
        "weight": weight,
        "ap_hi": ap_hi,
        "ap_lo": ap_lo,
        "cholesterol": cholesterol,
        "gluc": gluc,
        "smoke": smoke,
        "alco": alco,
        "active": active,
        "cardio": cardio,
    })
    return df


def main():
    csv_path = os.path.join(os.path.dirname(__file__), "cardio_train.csv")

    if os.path.isfile(csv_path):
        print(f"[+] Found dataset at {csv_path}")
        df = pd.read_csv(csv_path, sep=";")
    else:
        print("[!] Dataset not found — generating synthetic data (70 000 rows)…")
        df = generate_synthetic_data()

    # ---- feature engineering ----
    df["age_years"] = df["age"] / 365
    df["bmi"] = df["weight"] / ((df["height"] / 100) ** 2)

    # Clean outliers
    df = df[(df["ap_hi"] > 60) & (df["ap_hi"] < 250)]
    df = df[(df["ap_lo"] > 40) & (df["ap_lo"] < 160)]
    df = df[(df["bmi"] > 10) & (df["bmi"] < 60)]

    features = [
        "age_years", "gender", "height", "weight", "bmi",
        "ap_hi", "ap_lo", "cholesterol", "gluc",
        "smoke", "alco", "active",
    ]
    X = df[features]
    y = df["cardio"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42,
    )

    print("[*] Training Random Forest classifier (n_estimators=100)…")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)

    accuracy = accuracy_score(y_test, clf.predict(X_test))
    print(f"[✓] Model Accuracy: {accuracy:.2%}")
    print()
    print(classification_report(y_test, clf.predict(X_test)))

    # Save model
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "cardiovascular_model.pkl")
    joblib.dump(clf, model_path)
    print(f"[✓] Model saved → {model_path}")


if __name__ == "__main__":
    main()
