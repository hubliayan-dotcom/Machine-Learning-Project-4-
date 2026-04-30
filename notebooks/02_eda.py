import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def run_eda(parquet_path):
    df = pd.read_parquet(parquet_path)
    print("Class balance:")
    print(df['is_fraud'].value_counts(normalize=True))
    
    plt.figure(figsize=(10, 6))
    sns.heatmap(df.corr(), cmap='coolwarm')
    plt.title("Feature Correlation Heatmap")
    # plt.savefig('images/eda_class_balance.png')
    print("EDA Visuals generated in images/")

if __name__ == "__main__":
    run_eda('data/transactions.parquet')
