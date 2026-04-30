import pandas as pd
import numpy as np

def create_features(df):
    df = df.copy()
    df['log_amount'] = np.log1p(df['Amount'])
    # In the Kaggle dataset, columns are PCA V1-V28
    # We add basic time-based transforms
    df['hour'] = (df['Time'] / 3600) % 24
    return df
