import numpy as np

def calculate_psi(expected, actual, buckets=10):
    """
    Calculates the Population Stability Index (PSI) between two distributions.
    Used for monitoring model drift in production.
    Interpretation:
    - PSI < 0.1: No significant change.
    - 0.1 < PSI < 0.2: Slight shift.
    - PSI > 0.2: Significant shift (require investigation/retraining).
    """
    def scale_range(input, min_v, max_v):
        input += -(np.min(input))
        input /= np.max(input) / (max_v - min_v)
        input += min_v
        return input

    breakpoints = np.arange(0, buckets + 1) / buckets * 100
    breakpoints = np.percentile(expected, breakpoints)
    breakpoints[0] = -np.inf
    breakpoints[-1] = np.inf

    expected_percents = np.histogram(expected, bins=breakpoints)[0] / len(expected)
    actual_percents = np.histogram(actual, bins=breakpoints)[0] / len(actual)

    # Avoid zero percentages to prevent log(0) errors
    expected_percents = np.clip(expected_percents, 1e-6, None)
    actual_percents = np.clip(actual_percents, 1e-6, None)

    psi_values = (expected_percents - actual_percents) * np.log(expected_percents / actual_percents)
    psi_total = np.sum(psi_values)

    return psi_total

def check_drift(features_train, features_prod):
    """
    Runs drift detection on key features.
    """
    for col in features_train.columns:
        psi = calculate_psi(features_train[col], features_prod[col])
        status = "STABLE" if psi < 0.1 else ("WARN" if psi < 0.2 else "DRIFT_DETECTED")
        print(f"Feature: {col} | PSI: {psi:.4f} | Status: {status}")
