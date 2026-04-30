import pandas as pd
import numpy as np

def ingest_data(input_path='data/creditcard.csv'):
    """
    Ingests raw training data and performs initial schema enforcement.
    Schema Design:
    - Time: Number of seconds elapsed between this transaction and the first transaction in the dataset.
    - V1-V28: Principal components obtained with PCA (Anonymized features).
    - Amount: Transaction amount.
    - is_fraud (Class): Target variable (1 for fraud, 0 otherwise).
    """
    print("--- Phase 2: Data Ingestion & Schema Enforcement ---")
    try:
        df = pd.read_csv(input_path)
    except FileNotFoundError:
        print(f"File {input_path} not found. Using synthetic mock data.")
        # Mocking 10k rows for demonstration
        df = pd.DataFrame(np.random.randn(10000, 30), columns=[f'V{i}' for i in range(1, 29)] + ['Amount', 'Time'])
        df['Class'] = np.random.choice([0, 1], size=10000, p=[0.998, 0.002])

    df = df.rename(columns={'Class': 'is_fraud'})
    
    # Critical: Sort by Time for chronological split
    df = df.sort_values('Time').reset_index(drop=True)
    
    # Type Enforcement
    df['Amount'] = df['Amount'].astype('float64')
    df['Time'] = df['Time'].astype('int64')
    
    print(f"Ingested {len(df)} transactions.")
    print(f"Fraud Rate: {df.is_fraud.mean():.4%}")
    
    # Chronological 80/20 Split
    cut = int(len(df) * 0.8)
    train = df.iloc[:cut]
    valid = df.iloc[cut:]
    
    print(f"Training Samples: {len(train)} (older data)")
    print(f"Validation Samples: {len(valid)} (recent data)")
    
    return train, valid

if __name__ == "__main__":
    train, valid = ingest_data()
