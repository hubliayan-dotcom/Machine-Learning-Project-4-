import streamlit as st
import pandas as pd
import joblib

st.title("Fraud Detection Dashboard (Local Streamlit)")
# In production, this would load the .joblib model
st.write("Connect to FastAPI at :8000")
st.sidebar.slider("Threshold", 0.05, 0.95, 0.5)
