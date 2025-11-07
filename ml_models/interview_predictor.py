#!/usr/bin/env python3
"""
Simple Interview Predictor for ML Pipeline
Uses basic ML models for interview success prediction
"""

import pandas as pd
import numpy as np
import pickle
import os
import sys
import json
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


# ============================================================================
# CLI Interface for Interview Prediction
# ============================================================================

def map_education_to_code(education: str) -> int:
    """Map education string to numeric code matching training data"""
    education_map = {
        'B.E / B-Tech': 0,
        'BSc or MSc': 1,
        'BA/MA': 2,
        'B.com (Bachelor of commerce)': 3,
        'M.E / M-Tech': 4,
        'Masters in data science': 5,
        'MED': 6,
        'B.ed(Teaching)': 7,
        'M.com': 8,
    }
    return education_map.get(education, 0)  # Default to 0 if not found

def derive_speech_metrics(speech_analysis: Dict) -> Dict[str, Any]:
    """Derive confidence, fluency, and structured thinking from speech analysis"""
    confidence_score = speech_analysis.get('confidence_score', 50)  # 0-95
    quality_score = speech_analysis.get('quality_score', 50)  # 0-95
    vocab_diversity = speech_analysis.get('vocabulary_analysis', {}).get('diversity', 0.5)
    structure_quality = speech_analysis.get('structure_analysis', {}).get('structure_quality', 'fair')
    variety_score = speech_analysis.get('structure_analysis', {}).get('variety_score', 50)
    
    # Convert confidence_score (0-95) to 1-5 scale
    confidence_1_to_5 = max(1, min(5, round((confidence_score / 95) * 5)))
    
    # Convert to fluency (1-5 scale) - combine vocabulary diversity and quality
    vocab_score = vocab_diversity * 100  # 0-100
    fluency_score = (vocab_score * 0.4 + quality_score * 0.6) / 20  # Normalize to 1-5
    fluency_1_to_5 = max(1, min(5, round(fluency_score)))
    
    # Convert to structured thinking (1-5 scale)
    structure_map = {'excellent': 5, 'fair': 3, 'poor': 1}
    base_structure = structure_map.get(structure_quality, 3)
    variety_boost = (variety_score / 95) * 2  # 0-2 boost
    structured_thinking = max(1, min(5, round(base_structure + variety_boost)))
    
    # Mother tongue influence (Yes=1, No=0)
    has_mti = 1 if quality_score < 60 else 0
    
    return {
        'confidence_1_to_5': confidence_1_to_5,
        'fluency_1_to_5': fluency_1_to_5,
        'structured_thinking': structured_thinking,
        'has_mti': has_mti
    }

def build_feature_vector(profile_data: Dict, speech_analysis: Dict, interview_data: Dict, expected_feature_names: list = None) -> pd.DataFrame:
    """Build feature vector matching training data structure exactly
    
    Args:
        profile_data: User profile data
        speech_analysis: Speech analysis results
        interview_data: Interview metadata
        expected_feature_names: List of feature names the model expects (from model.feature_names)
    
    Returns:
        DataFrame with features matching the model's expected structure
    """
    
    # Profile data (required fields)
    age = profile_data.get('age', 25)
    gender = 1 if profile_data.get('gender') == 'Male' else 0
    education = map_education_to_code(profile_data.get('education', 'B.E / B-Tech'))
    currently_employed = 1 if profile_data.get('currentlyEmployed', False) else 0
    experience_months = profile_data.get('experienceMonths', 0)
    willing_to_relocate = 1 if profile_data.get('willingToRelocate', False) else 0
    has_acquaintance = 1 if profile_data.get('hasAcquaintance', False) else 0
    
    # Derive speech metrics
    speech_metrics = derive_speech_metrics(speech_analysis)
    
    # Build all possible features (mapping from feature name to value)
    all_features = {
        'Age': age,
        'Gender': gender,
        'Type of Graduation/Post Graduation': education,
        'Mode of interview given by candidate?': 1,  # Always online/voice
        'Pre Interview Check': 1,  # They got to interview
        'Confidence based on Introduction (English).1': speech_metrics['confidence_1_to_5'],
        'Confidence based on the topic given  .1': speech_metrics['confidence_1_to_5'],
        'Confidence based on the sales scenario.1': speech_metrics['confidence_1_to_5'],
        'Structured Thinking (In regional only).1': speech_metrics['structured_thinking'],
        'Structured Thinking( Call pitch).1': speech_metrics['structured_thinking'],
        'Regional fluency based on the topic given  .1': speech_metrics['fluency_1_to_5'],
        'Regional fluency Based on the PPT Question.1': speech_metrics['fluency_1_to_5'],
        'Regional fluency based on the  sales scenario.1': speech_metrics['fluency_1_to_5'],
        'Does the candidate has mother tongue influence while speaking english.': speech_metrics['has_mti'],
        'Has acquaintance in Company and has spoken to him/her before applying?': has_acquaintance,
        'Currently Employed': currently_employed,
        'Experienced candidate - (Experience in months)': experience_months,
        'Role acceptance': 1,  # They're doing the interview
        'Candidate is willing to relocate': willing_to_relocate
    }
    
    # If expected feature names are provided, only include those features
    # This ensures we match exactly what the model was trained with
    if expected_feature_names:
        features = {name: all_features.get(name, 0) for name in expected_feature_names}
        # Reorder to match expected order
        features_ordered = {name: features[name] for name in expected_feature_names if name in features}
        return pd.DataFrame([features_ordered])
    else:
        # Fallback: return all features (for backward compatibility)
        return pd.DataFrame([all_features])

def predict_interview_success(transcript_text: str, profile_data: Dict, 
                              speech_analysis: Dict, interview_data: Dict) -> Dict:
    """Predict interview success using trained model"""
    try:
        # Load predictor
        predictor = SimpleInterviewPredictor()
        model_path = os.path.join(os.path.dirname(__file__), 'trained_models', 'interview_predictor.pkl')
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        predictor.load_model(model_path)
        
        # Build feature vector using only features the model expects
        # This ensures we match exactly what the model was trained with
        expected_features = predictor.feature_names if predictor.feature_names else None
        if expected_features:
            print(f"📋 Model expects {len(expected_features)} features: {expected_features[:5]}...")
        
        features_df = build_feature_vector(profile_data, speech_analysis, interview_data, expected_features)
        
        # Verify feature names match
        if expected_features and list(features_df.columns) != expected_features:
            print(f"⚠️ Feature name mismatch!")
            print(f"   Expected: {expected_features}")
            print(f"   Got: {list(features_df.columns)}")
            # Reorder columns to match expected order
            features_df = features_df[expected_features]
        
        # Make prediction
        predictions, probabilities = predictor.predict(features_df)
        
        # Get feature importance (optional, for debugging)
        feature_importance = predictor.get_feature_importance()
        
        # Format response
        success_probability = float(probabilities[0]) if len(probabilities) > 0 else 0.5
        predicted_success = bool(predictions[0]) if len(predictions) > 0 else False
        
        # Calculate overall score (0-95, more generous scoring)
        # Scale more generously: 0.5 probability = 70, 0.7 = 85, 0.9 = 95
        if success_probability < 0.5:
            overall_score = min(95, 50 + (success_probability * 40))  # 0.0 -> 50, 0.5 -> 70
        else:
            overall_score = min(95, 70 + ((success_probability - 0.5) * 50))  # 0.5 -> 70, 1.0 -> 95
        
        return {
            'success': True,
            'prediction': {
                'success_probability': success_probability,
                'predicted_success': predicted_success,
                'overall_score': round(overall_score, 2),
                'model_used': predictor.best_model_name,
                'data_sources': {
                    'profile_complete': profile_data.get('profileCompleted', False),
                    'profile_completion_pct': profile_data.get('profileCompletionPercentage', 0),
                    'speech_analysis_available': True
                }
            }
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        return {
            'success': False,
            'error': str(e),
            'trace': error_trace,
            'prediction': {}
        }

def main():
    """Main function - reads input from stdin and outputs to stdout"""
    try:
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        transcript_text = data.get('text', '')
        profile_data = data.get('profileData', {})
        speech_analysis = data.get('speechAnalysis', {})
        interview_data = data.get('interviewData', {})
        
        if not transcript_text:
            result = {
                'success': False,
                'error': 'Transcript text is required',
                'prediction': {}
            }
        elif not profile_data or not profile_data.get('profileCompleted', False):
            result = {
                'success': False,
                'error': 'Profile must be complete for prediction',
                'prediction': {}
            }
        else:
            result = predict_interview_success(
                transcript_text,
                profile_data,
                speech_analysis,
                interview_data
            )
        
        print(json.dumps(result))
        
    except json.JSONDecodeError as e:
        error_result = {
            'success': False,
            'error': f'Invalid JSON input: {str(e)}',
            'prediction': {}
        }
        print(json.dumps(error_result))
    except Exception as e:
        import traceback
        error_result = {
            'success': False,
            'error': f'Unexpected error: {str(e)}',
            'trace': traceback.format_exc(),
            'prediction': {}
        }
        print(json.dumps(error_result))

if __name__ == '__main__':
    main()