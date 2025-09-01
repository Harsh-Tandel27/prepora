#!/usr/bin/env python3
"""
Simple Interview Predictor for ML Pipeline
Uses basic ML models for interview success prediction
"""

import pandas as pd
import numpy as np
import pickle
import os
from typing import Dict, List, Tuple, Any, Optional
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

class SimpleInterviewPredictor:
    """Simple ML models for interview success prediction"""
    
    def __init__(self):
        self.models = {}
        self.best_model = None
        self.best_model_name = None
        self.scaler = StandardScaler()
        self.feature_names = None
        self.model_performance = {}
        
    def train_models(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        """Train simple ML models"""
        print("🚀 Training Simple Interview Prediction Models...")
        
        # Store feature names
        self.feature_names = X.columns.tolist()
        
        # Split data (80% train, 20% test)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Define simple models with basic parameters
        models = {
            'Random Forest': RandomForestClassifier(
                n_estimators=100,      # 100 trees
                max_depth=10,          # Max depth of 10
                random_state=42
            ),
            'Logistic Regression': LogisticRegression(
                random_state=42,
                max_iter=1000
            )
        }
        
        results = {}
        
        # Train each model
        for name, model in models.items():
            print(f"📊 Training {name}...")
            
            # Train the model
            model.fit(X_train_scaled, y_train)
            self.models[name] = model
            
            # Make predictions
            y_pred = model.predict(X_test_scaled)
            
            # Calculate accuracy
            accuracy = accuracy_score(y_test, y_pred)
            
            # Store results
            results[name] = {
                'accuracy': accuracy,
                'predictions': y_pred
            }
            
            print(f"   ✅ {name}: Accuracy={accuracy:.2%}")
        
        # Find best model
        best_model_name = max(results.keys(), key=lambda k: results[k]['accuracy'])
        self.best_model = self.models[best_model_name]
        self.best_model_name = best_model_name
        
        print(f"\n🏆 Best Model: {best_model_name} (Accuracy: {results[best_model_name]['accuracy']:.2%})")
        
        # Store performance metrics
        self.model_performance = results
        
        return results
    
    def predict(self, X: pd.DataFrame, model_name: str = None) -> Tuple[np.ndarray, np.ndarray]:
        """Make predictions using specified or best model"""
        if model_name is None:
            model_name = self.best_model_name
        
        if model_name not in self.models:
            raise ValueError(f"Model '{model_name}' not found")
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Make predictions
        model = self.models[model_name]
        predictions = model.predict(X_scaled)
        
        # For simple models, we'll create basic probabilities
        # (Random Forest has predict_proba, Logistic Regression has predict_proba)
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(X_scaled)[:, 1]
        else:
            # If no predict_proba, use predictions as probabilities
            probabilities = predictions.astype(float)
        
        return predictions, probabilities
    
    def get_feature_importance(self, model_name: str = None) -> Dict[str, float]:
        """Get feature importance for specified model"""
        if model_name is None:
            model_name = self.best_model_name
        
        if model_name not in self.models:
            return {}
        
        model = self.models[model_name]
        
        # Get feature importance if available
        if hasattr(model, 'feature_importances_'):
            feature_importance = dict(zip(self.feature_names, model.feature_importances_))
        elif hasattr(model, 'coef_'):
            # For Logistic Regression, use absolute coefficients
            feature_importance = dict(zip(self.feature_names, np.abs(model.coef_[0])))
        else:
            return {}
        
        # Sort by importance
        sorted_features = sorted(
            feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return dict(sorted_features)
    
    def save_model(self, file_path: str):
        """Save trained models using pickle"""
        model_state = {
            'models': self.models,
            'best_model_name': self.best_model_name,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'model_performance': self.model_performance
        }
        
        with open(file_path, 'wb') as f:
            pickle.dump(model_state, f)
        
        print(f"💾 Saved interview predictor to {file_path}")
    
    def load_model(self, file_path: str):
        """Load trained models using pickle"""
        with open(file_path, 'rb') as f:
            model_state = pickle.load(f)
        
        self.models = model_state['models']
        self.best_model_name = model_state['best_model_name']
        self.scaler = model_state['scaler']
        self.feature_names = model_state['feature_names']
        self.model_performance = model_state['model_performance']
        
        # Set best model
        if self.best_model_name:
            self.best_model = self.models[self.best_model_name]
        
        print(f"📂 Loaded interview predictor from {file_path}")
    
    def get_model_summary(self) -> Dict[str, Any]:
        """Get summary of all trained models"""
        summary = {
            'total_models': len(self.models),
            'best_model': self.best_model_name,
            'feature_count': len(self.feature_names) if self.feature_names else 0,
            'model_performance': self.model_performance
        }
        
        return summary
