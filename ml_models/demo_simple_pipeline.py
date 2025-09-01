#!/usr/bin/env python3
"""
Simple ML Pipeline Demo
Demonstrates the trained ML models for interview preparation
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

class SimpleMLPipelineDemo:
    """Demo class for the simplified ML pipeline"""
    
    def __init__(self):
        self.models_dir = Path("trained_models")
        self.models_loaded = False
        
        # Initialize components
        self.data_preprocessor = None
        self.interview_predictor = None
        self.question_recommender = None
        self.speech_analyzer = None
        
        print("🚀 Simple ML Pipeline Demo Initialized")
    
    def load_all_models(self):
        """Load all trained models"""
        print("\n📂 Loading Trained Models...")
        print("-" * 40)
        
        try:
            # Load data preprocessor
            preprocessor_path = self.models_dir / "data_preprocessor.pkl"
            if preprocessor_path.exists():
                self.data_preprocessor = EnhancedDataPreprocessor()
                self.data_preprocessor.load_preprocessor(str(preprocessor_path))
                print("✅ Data Preprocessor loaded")
            else:
                print("⚠️  Data Preprocessor not found")
            
            # Load interview predictor
            predictor_path = self.models_dir / "interview_predictor.pkl"
            if predictor_path.exists():
                self.interview_predictor = SimpleInterviewPredictor()
                self.interview_predictor.load_model(str(predictor_path))
                print("✅ Interview Predictor loaded")
            else:
                print("⚠️  Interview Predictor not found")
            
            # Load question recommender
            recommender_path = self.models_dir / "question_recommender.pkl"
            if recommender_path.exists():
                self.question_recommender = SimpleQuestionRecommender()
                self.question_recommender.load_model(str(recommender_path))
                print("✅ Question Recommender loaded")
            else:
                print("⚠️  Question Recommender not found")
            
            # Load speech analyzer
            analyzer_path = self.models_dir / "speech_analyzer.pkl"
            if analyzer_path.exists():
                self.speech_analyzer = SimpleSpeechAnalyzer()
                self.speech_analyzer.load_model(str(analyzer_path))
                print("✅ Speech Analyzer loaded")
            else:
                print("⚠️  Speech Analyzer not found")
            
            # Check if all models are loaded
            if all([self.data_preprocessor, self.interview_predictor, 
                    self.question_recommender, self.speech_analyzer]):
                self.models_loaded = True
                print("\n🎉 All models loaded successfully!")
            else:
                print("\n⚠️  Some models failed to load")
                
        except Exception as e:
            print(f"❌ Error loading models: {str(e)}")
            raise
    
    def demo_interview_prediction(self):
        """Demonstrate interview prediction"""
        if not self.models_loaded or not self.interview_predictor:
            print("❌ Interview predictor not loaded")
            return
        
        print("\n🎯 Interview Prediction Demo")
        print("-" * 40)
        
        # Create sample data for prediction
        try:
            print("📊 Creating sample data for prediction...")
            
            # Sample feature values (18 features as trained)
            sample_features = [25, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 12, 1, 1]  # Example values
            
            # Create DataFrame with correct column names
            feature_names = [
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
                'Currently Employed', 'Role acceptance', 'Candidate is willing to relocate'
            ]
            
            sample_df = pd.DataFrame([sample_features], columns=feature_names)
            
            print(f"📊 Sample data shape: {sample_df.shape}")
            print(f"🔍 Sample features: {list(sample_df.columns[:5])}...")
            
            # Make prediction
            predictions, probabilities = self.interview_predictor.predict(
                sample_df, model_name=self.interview_predictor.best_model_name
            )
            
            print(f"🎯 Prediction: {'Success' if predictions[0] == 1 else 'Needs Improvement'}")
            print(f"📈 Confidence: {probabilities[0]:.2%}")
            
            # Show feature importance
            feature_importance = self.interview_predictor.get_feature_importance()
            if feature_importance:
                print("\n🔍 Top 5 Important Features:")
                for feature, importance in list(feature_importance.items())[:5]:
                    print(f"   • {feature}: {importance:.4f}")
            else:
                print("\n🔍 Feature importance not available")
                
        except Exception as e:
            print(f"❌ Error in interview prediction demo: {str(e)}")
    
    def demo_question_recommendation(self):
        """Demonstrate question recommendation"""
        if not self.models_loaded or not self.question_recommender:
            print("❌ Question recommender not loaded")
            return
        
        print("\n❓ Question Recommendation Demo")
        print("-" * 40)
        
        try:
            # Get available categories and difficulties
            categories = self.question_recommender.get_all_categories()
            difficulties = self.question_recommender.get_all_difficulties()
            
            print(f"📚 Available Categories: {', '.join(categories[:5])}...")
            print(f"🎯 Available Difficulties: {', '.join(difficulties)}")
            
            # Demo: Get questions by filters
            print("\n🔍 Sample Questions by Category (JavaScript):")
            js_questions = self.question_recommender.get_questions_by_filters(
                category='JavaScript', limit=3
            )
            
            if not js_questions.empty:
                for _, question in js_questions.iterrows():
                    print(f"   • {question['Question'][:80]}...")
            else:
                print("   • No JavaScript questions found, trying general category...")
                general_questions = self.question_recommender.get_questions_by_filters(
                    category='General Programming', limit=3
                )
                if not general_questions.empty:
                    for _, question in general_questions.iterrows():
                        print(f"   • {question['Question'][:80]}...")
            
            # Demo: Similarity-based recommendation
            print("\n🔍 Similar Questions to 'What is JavaScript?':")
            similar_questions = self.question_recommender.recommend_questions_by_similarity(
                "What is JavaScript?", n_recommendations=3
            )
            
            for q in similar_questions:
                print(f"   • {q['question'][:80]}... (Score: {q['similarity_score']:.3f})")
                
        except Exception as e:
            print(f"❌ Error in question recommendation demo: {str(e)}")
    
    def demo_speech_analysis(self):
        """Demonstrate speech analysis"""
        if not self.models_loaded or not self.speech_analyzer:
            print("❌ Speech analyzer not loaded")
            return
        
        print("\n🗣️  Speech Analysis Demo")
        print("-" * 40)
        
        try:
            # Sample speech text
            sample_speech = """
            Um, so I think that, you know, JavaScript is basically a programming language 
            that runs in the browser. I mean, it's like, really important for web development 
            and stuff. You know what I mean? It's basically used for, um, making websites 
            interactive and dynamic. I think it's pretty cool, you know?
            """
            
            print("📝 Sample Speech Text:")
            print(f"   {sample_speech.strip()}")
            
            # Analyze speech
            analysis = self.speech_analyzer.analyze_speech_text(sample_speech, audio_duration=30.0)
            
            print(f"\n📊 Analysis Results:")
            print(f"   • Quality Score: {analysis['quality_score']:.1f}/100")
            print(f"   • Vocabulary Diversity: {analysis['basic_metrics']['vocabulary_diversity']:.3f}")
            print(f"   • Unique Words: {analysis['basic_metrics']['unique_words']}")
            print(f"   • Average Sentence Length: {analysis['basic_metrics']['avg_sentence_length']:.1f} words")
            
            print(f"\n🔍 Filler Word Analysis:")
            filler_info = analysis['filler_word_analysis']
            print(f"   • Filler Words: {filler_info['filler_count']}")
            print(f"   • Filler Rate: {filler_info['filler_rate']:.1%}")
            print(f"   • Acceptable: {'✅' if filler_info['is_acceptable'] else '❌'}")
            
            print(f"\n🔄 Repetition Analysis:")
            rep_info = analysis['repetition_analysis']
            print(f"   • Repetitions: {rep_info['repetition_count']}")
            print(f"   • Repetition Rate: {rep_info['repetition_rate']:.1%}")
            print(f"   • Acceptable: {'✅' if rep_info['is_acceptable'] else '❌'}")
            
            print(f"\n💡 Recommendations:")
            for rec in analysis['recommendations']:
                print(f"   • {rec}")
                
        except Exception as e:
            print(f"❌ Error in speech analysis demo: {str(e)}")
    
    def run_complete_demo(self):
        """Run the complete demo"""
        print("\n" + "="*60)
        print("🎬 SIMPLE ML PIPELINE DEMO")
        print("="*60)
        
        # Load models
        self.load_all_models()
        
        if not self.models_loaded:
            print("❌ Cannot run demo - models not loaded")
            return
        
        # Run demos
        self.demo_interview_prediction()
        self.demo_question_recommendation()
        self.demo_speech_analysis()
        
        print("\n" + "="*60)
        print("🎉 DEMO COMPLETED SUCCESSFULLY!")
        print("="*60)
        
        # Print system summary
        self.print_system_summary()
    
    def print_system_summary(self):
        """Print summary of the ML system"""
        print("\n📊 System Summary:")
        print("-" * 40)
        
        if self.interview_predictor:
            print(f"🎯 Interview Predictor:")
            print(f"   • Best Model: {self.interview_predictor.best_model_name}")
            print(f"   • Total Models: {len(self.interview_predictor.models)}")
            print(f"   • Features: {len(self.interview_predictor.feature_names) if self.interview_predictor.feature_names else 0}")
        
        if self.question_recommender:
            print(f"\n❓ Question Recommender:")
            print(f"   • Total Questions: {len(self.question_recommender.questions_df) if self.question_recommender.questions_df is not None else 0}")
            print(f"   • TF-IDF Features: {self.question_recommender.question_vectors.shape[1] if self.question_recommender.question_vectors is not None else 0}")
        
        if self.speech_analyzer:
            print(f"\n🗣️  Speech Analyzer:")
            print(f"   • Filler Words: {len(self.speech_analyzer.filler_words)}")
            print(f"   • Analysis Metrics: {len(self.speech_analyzer.get_analysis_summary()['analysis_metrics'])}")

def main():
    """Main demo function"""
    print("🚀 Starting Simple ML Pipeline Demo...")
    
    # Initialize demo
    demo = SimpleMLPipelineDemo()
    
    # Run complete demo
    demo.run_complete_demo()

if __name__ == "__main__":
    main()
