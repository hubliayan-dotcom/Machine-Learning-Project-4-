from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score, classification_report
import pandas as pd

def train_baselines(X_train, y_train, X_val, y_val):
    """
    Compares baseline models for fraud detection.
    Note: X_train and X_val must be split chronologically to prevent future leakage.
    """
    print("\n--- Training Logistic Regression Baseline ---")
    # Using class_weight='balanced' to handle initial imbalance
    lr = LogisticRegression(class_weight='balanced', max_iter=1000)
    lr.fit(X_train, y_train)
    p_lr = lr.predict_proba(X_val)[:, 1]
    ap_lr = average_precision_score(y_val, p_lr)
    
    print("\n--- Training Random Forest Baseline ---")
    # Random Forest usually performs better on tabular fraud data
    rf = RandomForestClassifier(n_estimators=100, class_weight='balanced', n_jobs=-1)
    rf.fit(X_train, y_train)
    p_rf = rf.predict_proba(X_val)[:, 1]
    ap_rf = average_precision_score(y_val, p_rf)
    
    print(f"\nResults Summary:")
    print(f"LogReg PR-AUC: {ap_lr:.4f}")
    print(f"RF PR-AUC:     {ap_rf:.4f}")
    
    return {"lr": lr, "rf": rf}

if __name__ == "__main__":
    # Mock data for structure
    # In practice, loaded from data/transactions.parquet
    print("Baseline script loaded. Run with valid data in pipeline.")
