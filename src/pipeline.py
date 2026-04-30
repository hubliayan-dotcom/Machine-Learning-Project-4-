from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

def get_preprocessor(num_cols):
    num_pipe = Pipeline([
        ('impute', SimpleImputer(strategy='median')),
        ('scale',  StandardScaler())
    ])
    
    preprocessor = ColumnTransformer([
        ('num', num_pipe, num_cols)
    ])
    return preprocessor
