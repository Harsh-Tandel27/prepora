#!/usr/bin/env python3
"""
Enhanced Data Preprocessor for Interview ML Pipeline
Handles data cleaning, feature engineering, and preparation for ML models
"""

import pandas as pd
import numpy as np
import pickle
import os
from typing import Tuple, Dict, Any
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer

class EnhancedDataPreprocessor:
    """Advanced data preprocessing for interview datasets"""
    
    def __init__(self):
        self.scalers = {}
        self.label_encoders = {}
        self.imputers = {}
        self.feature_names = {}
        self.preprocessing_info = {}
        
    def load_and_preprocess_base_data(self, file_path: str) -> pd.DataFrame:
        """Load and preprocess the main interview dataset"""
        print("📊 Loading and preprocessing base interview data...")
        
        # Load data with multiple encoding attempts
        try:
            df = pd.read_csv(file_path, encoding='utf-8')
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(file_path, encoding='latin-1')
            except:
                df = pd.read_csv(file_path, encoding='cp1252')
        
        print(f"✅ Loaded {df.shape[0]} rows, {df.shape[1]} columns")
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Define feature columns for interview prediction
        feature_columns = [
            'Age', 'Gender', 'Type of Graduation/Post Graduation',
            'Mode of interview given by candidate?', 'Pre Interview Check',
            'Confidence based on Introduction (English).1',
            'Confidence based on the topic given  .1',
            'Confidence based on the sales scenario.1',
            'Structured Thinking (In regional only).1',
            'Structured Thinking( Call pitch).1',
            'Regional fluency based on the topic given  .1',
            'Regional fluency Based on the PPT Question.1',
            'Regional fluency based on the  sales scenario.1',
            'Does the candidate has mother tongue influence while speaking english.',
            'Has acquaintance in Company and has spoken to him/her before applying?',
            'Currently Employed', 'Experienced candidate - (Experience in months)',
            'Role acceptance', 'Candidate is willing to relocate'
        ]
        
        # Filter to available features
        available_features = [col for col in feature_columns if col in df.columns]
        df = df[available_features + ['Interview Verdict']]
        
        print(f"📋 Selected {len(available_features)} features for analysis")
        
        # Clean and preprocess features
        df = self._clean_features(df, available_features)
        
        # Handle target variable
        df = self._process_target_variable(df)
        
        # Store preprocessing info
        self.preprocessing_info['base_data'] = {
            'total_samples': len(df),
            'features_used': available_features,
            'target_distribution': df['Interview Verdict'].value_counts().to_dict()
        }
        
        return df
    
    def load_and_preprocess_questions_data(self, file_path: str) -> pd.DataFrame:
        """Load and preprocess the software questions dataset"""
        print("📚 Loading and preprocessing questions data...")
        
        try:
            # Robust CSV load that tolerates unquoted commas in the Answer field
            import csv
            rows = []
            with open(file_path, 'r', encoding='latin-1', newline='') as f:
                reader = csv.reader(f)
                header = next(reader, None)
                for fields in reader:
                    if not fields:
                        continue
                    # Expect at least 5 columns: [Question Number, Question, Answer, Category, Difficulty]
                    if len(fields) < 5:
                        continue
                    question_number = fields[0].strip()
                    category = fields[-2].strip()
                    difficulty = fields[-1].strip()
                    question = fields[1].strip()
                    # Join middle fields back into Answer to handle commas inside answers
                    answer_parts = fields[2:-2]
                    answer = ",".join(part.strip() for part in answer_parts)
                    rows.append({
                        'Question Number': question_number,
                        'Question': question,
                        'Answer': answer,
                        'Category': category,
                        'Difficulty': difficulty,
                    })

            df = pd.DataFrame(rows)
            print(f"✅ Loaded {len(df)} questions")

            # Clean and validate data
            df = df.dropna(subset=['Question', 'Answer', 'Category', 'Difficulty'])
            df['Question'] = df['Question'].astype(str)
            df['Answer'] = df['Answer'].astype(str)

            # Clean text data
            df['cleaned_question'] = df['Question'].apply(self._clean_text)
            df['cleaned_answer'] = df['Answer'].apply(self._clean_text)

            # Create combined text for vectorization
            df['combined_text'] = df['cleaned_question'] + ' ' + df['cleaned_answer']

            print(f"✅ Preprocessed {len(df)} questions")

            self.preprocessing_info['questions_data'] = {
                'total_questions': len(df),
                'categories': df['Category'].unique().tolist(),
                'difficulties': df['Difficulty'].unique().tolist()
            }

            return df

        except Exception as e:
            print(f"❌ Error processing questions: {e}")
            raise
    
    def _clean_features(self, df: pd.DataFrame, feature_columns: list) -> pd.DataFrame:
        """Clean and preprocess feature columns"""
        for col in feature_columns:
            if col == 'Age':
                # Handle age column
                df[col] = df[col].replace('32+', '32')
                df[col] = pd.to_numeric(df[col], errors='coerce')
                
            elif col == 'Gender':
                # Encode gender
                df[col] = df[col].map({'Female': 0, 'Male': 1})
                
            elif col == 'Type of Graduation/Post Graduation':
                # Encode education type
                df[col] = pd.Categorical(df[col]).codes
                
            elif col == 'Mode of interview given by candidate?':
                # Encode interview mode
                df[col] = pd.Categorical(df[col]).codes
                
            elif col == 'Pre Interview Check':
                # Encode pre-interview check
                df[col] = pd.Categorical(df[col]).codes
                
            elif col == 'Does the candidate has mother tongue influence while speaking english.':
                # Encode accent influence
                df[col] = pd.Categorical(df[col]).codes
                
            elif col == 'Has acquaintance in Company and has spoken to him/her before applying?':
                # Encode acquaintance
                df[col] = pd.Categorical(df[col]).codes
                
            elif col == 'Currently Employed':
                # Encode employment status
                df[col] = pd.Categorical(df[col]).codes
                
            elif col == 'Role acceptance':
                # Encode role acceptance
                df[col] = pd.Categorical(df[col]).codes
                
            elif col == 'Candidate is willing to relocate':
                # Encode relocation willingness
                df[col] = pd.Categorical(df[col]).codes
                
            elif col == 'Experienced candidate - (Experience in months)':
                # Handle experience (convert to numeric)
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        return df
    
    def _process_target_variable(self, df: pd.DataFrame) -> pd.DataFrame:
        """Process the target variable (Interview Verdict)"""
        # Map target values
        target_mapping = {
            'Select': 1, 'Premium Select': 1,        # Success
            'Reject': 0, 'Borderline Reject': 0,     # Failure
            'Borderline Select': 0                    # Neutral/Failure
        }
        
        df['Interview Verdict'] = df['Interview Verdict'].map(target_mapping)
        
        # Remove rows with missing target
        df = df.dropna(subset=['Interview Verdict'])
        
        print(f"🎯 Target distribution: {df['Interview Verdict'].value_counts().to_dict()}")
        
        return df
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text data"""
        if pd.isna(text):
            return ""
        
        # Convert to string and lowercase
        text = str(text).lower()
        
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def prepare_ml_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare data for ML training"""
        print("🔧 Preparing data for ML training...")
        
        # Separate features and target
        feature_cols = [col for col in df.columns if col != 'Interview Verdict']
        X = df[feature_cols]
        y = df['Interview Verdict']
        
        # Handle missing values
        X = self._handle_missing_values(X)
        
        # Store feature names
        self.feature_names['base_data'] = X.columns.tolist()
        
        print(f"✅ Prepared {X.shape[0]} samples with {X.shape[1]} features")
        
        return X, y
    
    def _handle_missing_values(self, X: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values in feature matrix"""
        # Create a copy to avoid modifying original
        X_imputed = X.copy()
        
        print(f"   🔍 Original shape: {X_imputed.shape}")
        print(f"   🔍 Columns: {list(X_imputed.columns)}")
        
        # Convert all columns to numeric if possible
        for col in X_imputed.columns:
            try:
                X_imputed[col] = pd.to_numeric(X_imputed[col], errors='coerce')
            except:
                pass
        
        print(f"   🔍 After conversion shape: {X_imputed.shape}")
        
        # Check for any remaining non-numeric columns
        non_numeric_cols = X_imputed.select_dtypes(exclude=[np.number]).columns
        if len(non_numeric_cols) > 0:
            print(f"   ⚠️  Non-numeric columns found: {list(non_numeric_cols)}")
            # Drop non-numeric columns
            X_imputed = X_imputed.drop(columns=non_numeric_cols)
            print(f"   🔍 After dropping non-numeric shape: {X_imputed.shape}")
        
        # Check for columns with all NaN values
        all_nan_cols = X_imputed.columns[X_imputed.isna().all()].tolist()
        if all_nan_cols:
            print(f"   ⚠️  Columns with all NaN values: {all_nan_cols}")
            X_imputed = X_imputed.drop(columns=all_nan_cols)
            print(f"   🔍 After dropping all-NaN columns shape: {X_imputed.shape}")
        
        # Now handle missing values
        imputer = SimpleImputer(strategy='mean')
        imputed_values = imputer.fit_transform(X_imputed)
        
        print(f"   🔍 Imputed values shape: {imputed_values.shape}")
        
        # Create DataFrame with the correct shape
        X_imputed_imputed = pd.DataFrame(
            imputed_values,
            columns=X_imputed.columns,
            index=X_imputed.index
        )
        
        print(f"   🔍 Final DataFrame shape: {X_imputed_imputed.shape}")
        
        self.imputers['numeric'] = imputer
        
        print(f"   🔍 Final shape: {X_imputed_imputed.shape}")
        
        return X_imputed_imputed
    
    def save_preprocessor(self, file_path: str):
        """Save preprocessor state using pickle"""
        preprocessor_state = {
            'scalers': self.scalers,
            'label_encoders': self.label_encoders,
            'imputers': self.imputers,
            'feature_names': self.feature_names,
            'preprocessing_info': self.preprocessing_info
        }
        
        with open(file_path, 'wb') as f:
            pickle.dump(preprocessor_state, f)
        
        print(f"💾 Saved preprocessor state to {file_path}")
    
    def load_preprocessor(self, file_path: str):
        """Load preprocessor state using pickle"""
        with open(file_path, 'rb') as f:
            preprocessor_state = pickle.load(f)
        
        self.scalers = preprocessor_state['scalers']
        self.label_encoders = preprocessor_state['label_encoders']
        self.imputers = preprocessor_state['imputers']
        self.feature_names = preprocessor_state['feature_names']
        self.preprocessing_info = preprocessor_state['preprocessing_info']
        
        print(f"📂 Loaded preprocessor state from {file_path}")

# Add missing import
import re
