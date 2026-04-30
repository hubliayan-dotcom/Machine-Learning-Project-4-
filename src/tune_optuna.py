import optuna
import numpy as np
from xgboost import XGBClassifier
from sklearn.metrics import average_precision_score, confusion_matrix

def pick_threshold(proba, y_true, fn_cost=5000, fp_cost=50):
    """
    Finds the threshold that minimizes the total business cost.
    Default costs: $5000 for a missed fraud (FN), $50 for a false alert (FP).
    """
    best_t, best_cost = 0.5, float('inf')
    thresholds = np.linspace(0.01, 0.99, 99)
    
    for t in thresholds:
        y_hat = (proba >= t).astype(int)
        tn, fp, fn, tp = confusion_matrix(y_true, y_hat).ravel()
        cost = (fn * fn_cost) + (fp * fp_cost)
        if cost < best_cost:
            best_cost, best_t = cost, t
            
    return best_t, best_cost

def objective(trial, X_train, y_train, X_val, y_val):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 300, 900),
        'max_depth': trial.suggest_int('max_depth', 3, 8),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.2, log=True),
        'subsample': trial.suggest_float('subsample', 0.6, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
        'scale_pos_weight': (y_train == 0).sum() / (y_train == 1).sum() if (y_train == 1).sum() > 0 else 1
    }
    model = XGBClassifier(**params, tree_method='hist')
    model.fit(X_train, y_train)
    p = model.predict_proba(X_val)[:, 1]
    return average_precision_score(y_val, p)

def run_tuning(X_train, y_train, X_val, y_val):
    study = optuna.create_study(direction='maximize')
    study.optimize(lambda t: objective(t, X_train, y_train, X_val, y_val), n_trials=40)
    
    print(f"Best Params: {study.best_params}")
    print(f"Best PR-AUC: {study.best_value:.4f}")
    
    # After tuning, pick the cost-optimal threshold
    best_model = XGBClassifier(**study.best_params)
    best_model.fit(X_train, y_train)
    p_val = best_model.predict_proba(X_val)[:, 1]
    
    t_star, min_cost = pick_threshold(p_val, y_val)
    print(f"Optimal Threshold: {t_star:.3f} (Cost minimized to {min_cost})")
    
    return best_model, t_star
