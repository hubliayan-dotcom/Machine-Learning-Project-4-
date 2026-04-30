import joblib

def save_model(model, threshold, path):
    bundle = {'model': model, 'threshold': threshold}
    joblib.dump(bundle, path)
    print(f"Model saved to {path}")
