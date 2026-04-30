from sklearn.metrics import classification_report, confusion_matrix, average_precision_score
import shap

def evaluate(model, X_test, y_test):
    preds = model.predict(X_test)
    print(classification_report(y_test, preds))
    print("PR-AUC:", average_precision_score(y_test, model.predict_proba(X_test)[:, 1]))
