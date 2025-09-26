#!/usr/bin/env python3
"""
Simple ML Pipeline Trainer
Trains all ML models for the interview preparation system
"""

import os
import sys
import pandas as pd
from pathlib import Path

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data_preprocessor import EnhancedDataPreprocessor
from interview_predictor import SimpleInterviewPredictor
from question_recommender import SimpleQuestionRecommender
from speech_analyzer import SimpleSpeechAnalyzer

class SimpleMLPipelineTrainer:
    """Simple ML Pipeline Trainer for all models"""
    
    def __init__(self):
        self.data_preprocessor = EnhancedDataPreprocessor()
        self.interview_predictor = SimpleInterviewPredictor()
        self.question_recommender = SimpleQuestionRecommender()
        self.speech_analyzer = SimpleSpeechAnalyzer()
        
        # Create models directory
        self.models_dir = Path("trained_models")
        self.models_dir.mkdir(exist_ok=True)
        
        print("Simple ML Pipeline Trainer Initialized")
    
    def train_all_models(self):
        """Train all ML models in sequence"""
        print("\n" + "="*60)
        print("TRAINING SIMPLE ML PIPELINE")
        print("="*60)
        
        try:
            # Step 1: Data Preprocessing
            print("\nStep 1: Data Preprocessing")
            print("-" * 40)
            self._train_data_preprocessor()
            
            # Step 2: Interview Prediction Models
            print("\nStep 2: Interview Prediction Models")
            print("-" * 40)
            self._train_interview_predictor()
            
            # Step 3: Question Recommendation System
            print("\nStep 3: Question Recommendation System")
            print("-" * 40)
            self._train_question_recommender()
            
            # Step 4: Speech Analyzer
            print("\nStep 4: Speech Analyzer")
            print("-" * 40)
            self._train_speech_analyzer()
            
            print("\n" + "="*60)
            print("ALL MODELS TRAINED SUCCESSFULLY!")
            print("="*60)
            
            # Save all models
            self._save_all_models()
            
        except Exception as e:
            print(f"\n❌ Error during training: {str(e)}")
            raise
    
    def _train_data_preprocessor(self):
        """Train data preprocessor"""
        print("Training Data Preprocessor...")
        
        # Load and preprocess base data
        base_data_path = "../dataset/Data - Base.csv"
        if os.path.exists(base_data_path):
            print(f"Loading base data from {base_data_path}")
            self.data_preprocessor.base_data = self.data_preprocessor.load_and_preprocess_base_data(base_data_path)
            print("Base data preprocessing completed")
        else:
            print(f"Base data file not found: {base_data_path}")
        
        # Load and preprocess questions data
        questions_data_path = "../dataset/Software Questions.csv"
        if os.path.exists(questions_data_path):
            print(f"Loading questions data from {questions_data_path}")
            self.data_preprocessor.questions_data = self.data_preprocessor.load_and_preprocess_questions_data(questions_data_path)
            print("Questions data preprocessing completed")
        else:
            print(f"Questions data file not found: {questions_data_path}")
    
    def _train_interview_predictor(self):
        """Train interview prediction models"""
        print("Training Interview Prediction Models...")
        
        # Get preprocessed data
        if hasattr(self.data_preprocessor, 'base_data') and self.data_preprocessor.base_data is not None:
            X, y = self.data_preprocessor.prepare_ml_data(self.data_preprocessor.base_data)
            
            if X is not None and y is not None:
                print(f"Training with {X.shape[0]} samples and {X.shape[1]} features")
                print(f"Target distribution: {y.value_counts().to_dict()}")
                
                # Train models
                results = self.interview_predictor.train_models(X, y)
                
                print(f"Best model: {self.interview_predictor.best_model_name}")
                print(f"Model performance: {results}")
            else:
                print("Failed to prepare ML data")
        else:
            print("No base data available for interview prediction")
    
    def _train_question_recommender(self):
        """Train question recommendation system"""
        print("Training Question Recommendation System...")
        
        # Get preprocessed questions
        if hasattr(self.data_preprocessor, 'questions_data') and self.data_preprocessor.questions_data is not None:
            questions_df = self.data_preprocessor.questions_data
            print(f"Training with {len(questions_df)} questions")
            
            # Save questions to temporary file for the recommender to load
            temp_questions_path = "temp_questions.csv"
            questions_df.to_csv(temp_questions_path, index=False)
            
            # Load questions using the correct method
            success = self.question_recommender.load_and_preprocess_questions(temp_questions_path)
            
            if success:
                # Train TF-IDF model
                self.question_recommender.train_tfidf_model()
                print("Question recommendation system trained")
                
                # Clean up temporary file
                os.remove(temp_questions_path)
            else:
                print("Failed to load questions into recommender")
        else:
            print("No questions data available for training")
    
    def _train_speech_analyzer(self):
        """Train speech analyzer"""
        print("Training Speech Analyzer...")
        
        # Speech analyzer doesn't need training data, just initialization
        print("Speech analyzer initialized and ready")
    
    def _save_all_models(self):
        """Save all trained models"""
        print("\nSaving All Models...")
        print("-" * 40)
        
        # Save data preprocessor
        preprocessor_path = self.models_dir / "data_preprocessor.pkl"
        self.data_preprocessor.save_preprocessor(str(preprocessor_path))
        
        # Save interview predictor
        predictor_path = self.models_dir / "interview_predictor.pkl"
        self.interview_predictor.save_model(str(predictor_path))
        
        # Save question recommender
        recommender_path = self.models_dir / "question_recommender.pkl"
        self.question_recommender.save_model(str(recommender_path))
        
        # Save speech analyzer
        analyzer_path = self.models_dir / "speech_analyzer.pkl"
        self.speech_analyzer.save_model(str(analyzer_path))
        
        print("All models saved successfully!")
        
        # Print model locations
        print("\nModel Locations:")
        print(f"   Data Preprocessor: {preprocessor_path}")
        print(f"   Interview Predictor: {predictor_path}")
        print(f"   Question Recommender: {recommender_path}")
        print(f"   Speech Analyzer: {analyzer_path}")
    
    def get_training_summary(self):
        """Get summary of training results"""
        summary = {
            'data_preprocessor': {
                'base_data_shape': self.data_preprocessor.base_data.shape if hasattr(self.data_preprocessor, 'base_data') and self.data_preprocessor.base_data is not None else None,
                'questions_data_shape': self.data_preprocessor.questions_data.shape if hasattr(self.data_preprocessor, 'questions_data') and self.data_preprocessor.questions_data is not None else None
            },
            'interview_predictor': {
                'best_model': self.interview_predictor.best_model_name if hasattr(self.interview_predictor, 'best_model_name') else None,
                'model_count': len(self.interview_predictor.models) if hasattr(self.interview_predictor, 'models') else 0,
                'performance': self.interview_predictor.model_performance if hasattr(self.interview_predictor, 'model_performance') else {}
            },
            'question_recommender': {
                'question_count': len(self.question_recommender.questions_df) if hasattr(self.question_recommender, 'questions_df') and self.question_recommender.questions_df is not None else 0,
                'tfidf_features': self.question_recommender.question_vectors.shape[1] if hasattr(self.question_recommender, 'question_vectors') and self.question_recommender.question_vectors is not None else 0
            },
            'speech_analyzer': {
                'filler_words': len(self.speech_analyzer.filler_words),
                'thresholds': self.speech_analyzer.thresholds
            }
        }
        
        return summary

def main():
    """Main training function"""
    print("Starting Simple ML Pipeline Training...")
    
    # Initialize trainer
    trainer = SimpleMLPipelineTrainer()
    
    # Train all models
    trainer.train_all_models()
    
    # Print summary
    print("\nTraining Summary:")
    print("-" * 40)
    summary = trainer.get_training_summary()
    
    for component, details in summary.items():
        print(f"\n{component.replace('_', ' ').title()}:")
        for key, value in details.items():
            print(f"   {key}: {value}")
    
    print("\nTraining completed successfully!")
    print("Models saved in 'trained_models' directory")

if __name__ == "__main__":
    main()
