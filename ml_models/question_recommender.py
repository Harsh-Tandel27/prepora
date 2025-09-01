#!/usr/bin/env python3
"""
Simple Question Recommender for ML Pipeline
Basic NLP-based question recommendation system
"""

import pandas as pd
import numpy as np
import pickle
import re
import random
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import warnings
from typing import Dict, List, Tuple, Any, Optional
warnings.filterwarnings('ignore')

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except:
    pass

class SimpleQuestionRecommender:
    """Simple question recommendation system with basic NLP"""
    
    def __init__(self):
        self.questions_df = None
        self.tfidf_vectorizer = None
        self.question_vectors = None
        self.stop_words = set(stopwords.words('english'))
        
    def load_and_preprocess_questions(self, questions_path: str) -> bool:
        """Load and preprocess questions dataset"""
        try:
            print("📚 Loading and preprocessing questions...")
            
            # Load questions
            self.questions_df = pd.read_csv(questions_path, encoding='latin-1')
            print(f"✅ Loaded {len(self.questions_df)} questions")
            
            # Clean and validate data
            self.questions_df = self.questions_df.dropna(subset=['Question', 'Answer', 'Category', 'Difficulty'])
            self.questions_df['Question'] = self.questions_df['Question'].astype(str)
            self.questions_df['Answer'] = self.questions_df['Answer'].astype(str)
            
            # Simple text preprocessing
            self.questions_df['cleaned_question'] = self.questions_df['Question'].apply(self._simple_text_cleaning)
            self.questions_df['cleaned_answer'] = self.questions_df['Answer'].apply(self._simple_text_cleaning)
            
            # Create combined text for vectorization
            self.questions_df['combined_text'] = (
                self.questions_df['cleaned_question'] + ' ' + 
                self.questions_df['cleaned_answer']
            )
            
            print(f"✅ Preprocessed {len(self.questions_df)} questions")
            print(f"📊 Categories: {list(self.questions_df['Category'].unique())}")
            print(f"📊 Difficulties: {list(self.questions_df['Difficulty'].unique())}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error loading questions: {e}")
            return False
    
    def _simple_text_cleaning(self, text: str) -> str:
        """Simple text cleaning and preprocessing"""
        if pd.isna(text):
            return ""
        
        # Convert to string and lowercase
        text = str(text).lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def train_tfidf_model(self):
        """Train simple TF-IDF vectorization model"""
        print("🔤 Training Simple TF-IDF Model...")
        
        # Basic TF-IDF with simple parameters
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,        # Limit to 1000 features
            stop_words='english',     # Remove common English words
            ngram_range=(1, 2),      # Use single words and pairs
            min_df=1,                 # Include all words
            max_df=0.9                # Exclude very common words
        )
        
        # Fit on combined text
        self.question_vectors = self.tfidf_vectorizer.fit_transform(
            self.questions_df['combined_text']
        )
        
        print(f"✅ TF-IDF trained with {self.question_vectors.shape[1]} features")
    
    def get_questions_by_filters(self, category=None, difficulty=None, limit=10):
        """Get questions filtered by various criteria"""
        filtered_df = self.questions_df.copy()
        
        if category:
            filtered_df = filtered_df[filtered_df['Category'] == category]
        
        if difficulty:
            filtered_df = filtered_df[filtered_df['Difficulty'] == difficulty]
        
        # Shuffle the questions to ensure variety
        filtered_df = filtered_df.sample(frac=1, random_state=random.randint(1, 1000)).reset_index(drop=True)
        
        if limit:
            filtered_df = filtered_df.head(limit)
        
        return filtered_df[['Question Number', 'Question', 'Answer', 'Category', 'Difficulty']]
    
    def recommend_questions_by_similarity(self, query_question, n_recommendations=5):
        """Recommend questions similar to a given query"""
        if self.question_vectors is None:
            raise ValueError("Questions not loaded. Please load questions first.")
        
        # Clean and vectorize the query
        cleaned_query = self._simple_text_cleaning(query_question)
        query_vector = self.tfidf_vectorizer.transform([cleaned_query])
        
        # Calculate similarity with all questions
        similarities = cosine_similarity(query_vector, self.question_vectors).flatten()
        
        # Get top similar questions
        top_indices = similarities.argsort()[-n_recommendations:][::-1]
        
        recommendations = []
        for idx in top_indices:
            recommendations.append({
                'question_number': self.questions_df.iloc[idx]['Question Number'],
                'question': self.questions_df.iloc[idx]['Question'],
                'answer': self.questions_df.iloc[idx]['Answer'],
                'category': self.questions_df.iloc[idx]['Category'],
                'difficulty': self.questions_df.iloc[idx]['Difficulty'],
                'similarity_score': similarities[idx]
            })
        
        return recommendations
    
    def recommend_questions_by_profile(self, candidate_profile, n_questions=10):
        """Recommend questions based on candidate profile"""
        if self.question_vectors is None:
            raise ValueError("Questions not loaded. Please load questions first.")
        
        # Get candidate preferences from profile
        preferred_category = candidate_profile.get('preferred_category', None)
        skill_level = candidate_profile.get('skill_level', 'Medium')
        
        # Filter questions based on preferences
        filtered_df = self.questions_df.copy()
        
        if preferred_category:
            filtered_df = filtered_df[filtered_df['Category'] == preferred_category]
        
        # Adjust difficulty based on skill level
        if skill_level == 'Beginner':
            filtered_df = filtered_df[filtered_df['Difficulty'] == 'Easy']
        elif skill_level == 'Advanced':
            filtered_df = filtered_df[filtered_df['Difficulty'] == 'Hard']
        
        # Select random questions for variety
        if len(filtered_df) > n_questions:
            filtered_df = filtered_df.sample(n=n_questions, random_state=42)
        
        recommendations = []
        for _, row in filtered_df.iterrows():
            recommendations.append({
                'question_number': row['Question Number'],
                'question': row['Question'],
                'answer': row['Answer'],
                'category': row['Category'],
                'difficulty': row['Difficulty'],
                'recommendation_score': 1.0  # Simple scoring
            })
        
        return recommendations
    
    def get_all_categories(self):
        """Get list of all available categories"""
        if self.questions_df is None:
            return []
        return self.questions_df['Category'].unique().tolist()
    
    def get_all_difficulties(self):
        """Get list of all available difficulties"""
        if self.questions_df is None:
            return []
        return self.questions_df['Difficulty'].unique().tolist()
    
    def save_model(self, file_path: str):
        """Save trained models using pickle"""
        model_state = {
            'questions_df': self.questions_df,
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'question_vectors': self.question_vectors
        }
        
        with open(file_path, 'wb') as f:
            pickle.dump(model_state, f)
        
        print(f"💾 Saved question recommender to {file_path}")
    
    def load_model(self, file_path: str):
        """Load trained models using pickle"""
        with open(file_path, 'rb') as f:
            model_state = pickle.load(f)
        
        self.questions_df = model_state['questions_df']
        self.tfidf_vectorizer = model_state['tfidf_vectorizer']
        self.question_vectors = model_state['question_vectors']
        
        # Model loaded successfully
    
    def get_model_summary(self) -> Dict[str, Any]:
        """Get summary of the question recommendation system"""
        if self.questions_df is None:
            return {}
        
        summary = {
            'total_questions': len(self.questions_df),
            'categories': self.questions_df['Category'].value_counts().to_dict(),
            'difficulties': self.questions_df['Difficulty'].value_counts().to_dict(),
            'tfidf_features': self.question_vectors.shape[1] if self.question_vectors is not None else 0
        }
        
        return summary
