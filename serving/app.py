from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI(title='Fraud Detection API')

@app.get('/health')
def health():
    return {'status': 'ok'}

@app.post('/score')
def score(txs: list[dict]):
    # In real app: load model and predict
    return [{'prob': 0.12, 'decision': 'ALLOW'}]
