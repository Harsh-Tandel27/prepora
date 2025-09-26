#!/usr/bin/env python3
"""
Simple Speech Analyzer for ML Pipeline
Basic speech pattern analysis for interview evaluation
"""

import re
import numpy as np
import pickle
from typing import Dict, List, Tuple, Any
from collections import Counter
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
except:
    pass

class SimpleSpeechAnalyzer:
    """Simple speech pattern analysis for interview evaluation"""
    
    def __init__(self):
        # Common filler words
        self.filler_words = {
            'um', 'uh', 'ah', 'er', 'like', 'you know', 'i mean', 'basically',
            'actually', 'literally', 'sort of', 'kind of', 'right', 'okay',
            'well', 'so', 'and', 'but', 'then', 'now', 'see', 'look'
        }
        
        # Simple speech quality thresholds
        self.thresholds = {
            'filler_word_rate': 0.15,      # Max 15% filler words
            'repetition_threshold': 0.1,   # Max 10% repeated words
            'min_words': 10                # Minimum words for analysis
        }
        
        # Initialize analysis results
        self.analysis_results = {}
    
    def analyze_speech_text(self, text: str, audio_duration: float = None) -> Dict[str, Any]:
        """Basic speech text analysis"""
        if not text or not text.strip():
            return self._empty_analysis()
        
        # Clean and normalize text
        cleaned_text = self._clean_text(text)
        words = cleaned_text.split()
        
        if len(words) < self.thresholds['min_words']:
            return self._empty_analysis()
        
        # Basic metrics
        word_count = len(words)
        char_count = len(cleaned_text)
        sentence_count = len(sent_tokenize(text))
        
        # Calculate speaking rate if duration provided
        speaking_rate = None
        if audio_duration and audio_duration > 0:
            speaking_rate = (word_count / audio_duration) * 60  # words per minute
        
        # Simple analysis
        filler_analysis = self._analyze_filler_words(words)
        repetition_analysis = self._analyze_repetition(words)
        basic_metrics = self._analyze_basic_metrics(words, sentence_count)
        
        # Calculate simple quality score
        quality_score = self._calculate_simple_score(filler_analysis, repetition_analysis, speaking_rate)
        
        # Compile results
        results = {
            'basic_metrics': {
                'word_count': word_count,
                'char_count': char_count,
                'sentence_count': sentence_count,
                'speaking_rate_wpm': speaking_rate,
                'audio_duration_seconds': audio_duration,
                'avg_words_per_sentence': word_count / sentence_count if sentence_count > 0 else 0
            },
            'filler_word_analysis': filler_analysis,
            'repetition_analysis': repetition_analysis,
            'basic_metrics': basic_metrics,
            'quality_score': quality_score,
            'recommendations': self._generate_simple_recommendations(
                filler_analysis, repetition_analysis, speaking_rate
            )
        }
        
        # Store results
        self.analysis_results = results
        
        return results
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text for analysis"""
        if pd.isna(text):
            return ""
        
        # Convert to string and lowercase
        text = str(text).lower()
        
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _analyze_filler_words(self, words: List[str]) -> Dict[str, Any]:
        """Analyze filler word usage"""
        filler_count = 0
        filler_details = []
        
        for word in words:
            if word in self.filler_words:
                filler_count += 1
                filler_details.append(word)
        
        filler_rate = filler_count / len(words) if words else 0
        
        return {
            'filler_count': filler_count,
            'filler_rate': filler_rate,
            'filler_words': filler_details,
            'is_acceptable': filler_rate <= self.thresholds['filler_word_rate']
        }
    
    def _analyze_repetition(self, words: List[str]) -> Dict[str, Any]:
        """Analyze word repetition"""
        word_counts = Counter(words)
        repeated_words = {word: count for word, count in word_counts.items() if count > 1}
        
        # Calculate repetition rate
        total_repetitions = sum(count - 1 for count in repeated_words.values())
        repetition_rate = total_repetitions / len(words) if words else 0
        
        # Find most repeated words
        top_repeated = sorted(repeated_words.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'repetition_count': total_repetitions,
            'repetition_rate': repetition_rate,
            'repeated_words': top_repeated,
            'is_acceptable': repetition_rate <= self.thresholds['repetition_threshold']
        }
    
    def _analyze_basic_metrics(self, words: List[str], sentence_count: int) -> Dict[str, Any]:
        """Analyze basic speech metrics"""
        # Vocabulary diversity
        unique_words = len(set(words))
        vocabulary_diversity = unique_words / len(words) if words else 0
        
        # Average sentence length
        avg_sentence_length = len(words) / sentence_count if sentence_count > 0 else 0
        
        return {
            'vocabulary_diversity': vocabulary_diversity,
            'unique_words': unique_words,
            'avg_sentence_length': avg_sentence_length
        }
    
    def _calculate_simple_score(self, filler_analysis: Dict, repetition_analysis: Dict, 
                               speaking_rate: float) -> float:
        """Calculate simple speech quality score (0-100)"""
        score = 100.0
        
        # Deduct points for filler words
        filler_rate = filler_analysis['filler_rate']
        if filler_rate > self.thresholds['filler_word_rate']:
            score -= (filler_rate - self.thresholds['filler_word_rate']) * 200
        
        # Deduct points for repetition
        repetition_rate = repetition_analysis['repetition_rate']
        if repetition_rate > self.thresholds['repetition_threshold']:
            score -= (repetition_rate - self.thresholds['repetition_threshold']) * 150
        
        # Speaking rate scoring (simple)
        if speaking_rate:
            if speaking_rate < 100:
                score -= 10
            elif speaking_rate > 200:
                score -= 15
        
        # Ensure score is within bounds
        return max(0, min(100, score))
    
    def _generate_simple_recommendations(self, filler_analysis: Dict, repetition_analysis: Dict,
                                        speaking_rate: float) -> List[str]:
        """Generate simple improvement recommendations"""
        recommendations = []
        
        # Filler word recommendations
        if not filler_analysis['is_acceptable']:
            recommendations.append("Reduce filler words like 'um', 'uh', 'like' for clearer communication")
        
        # Repetition recommendations
        if not repetition_analysis['is_acceptable']:
            recommendations.append("Avoid repeating the same words - use synonyms and variety")
        
        # Speaking rate recommendations
        if speaking_rate:
            if speaking_rate < 100:
                recommendations.append("Speak a bit faster - aim for 100+ words per minute")
            elif speaking_rate > 200:
                recommendations.append("Slow down your speech - aim for under 200 words per minute")
        
        return recommendations if recommendations else ["Great job! Your speech quality is good."]
    
    def _empty_analysis(self) -> Dict[str, Any]:
        """Return empty analysis structure"""
        return {
            'basic_metrics': {
                'word_count': 0,
                'char_count': 0,
                'sentence_count': 0,
                'speaking_rate_wpm': None,
                'audio_duration_seconds': None,
                'avg_words_per_sentence': 0
            },
            'filler_word_analysis': {'filler_count': 0, 'filler_rate': 0, 'filler_words': [], 'is_acceptable': True},
            'repetition_analysis': {'repetition_count': 0, 'repetition_rate': 0, 'repeated_words': [], 'is_acceptable': True},
            'basic_metrics': {'vocabulary_diversity': 0, 'unique_words': 0, 'avg_sentence_length': 0},
            'quality_score': 0,
            'recommendations': ["No speech content to analyze"]
        }
    
    def save_model(self, file_path: str):
        """Save speech analyzer state using pickle"""
        analyzer_state = {
            'filler_words': self.filler_words,
            'thresholds': self.thresholds,
            'analysis_results': self.analysis_results
        }
        
        with open(file_path, 'wb') as f:
            pickle.dump(analyzer_state, f)
        
        print(f"Saved speech analyzer to {file_path}")
    
    def load_model(self, file_path: str):
        """Load speech analyzer state using pickle"""
        with open(file_path, 'rb') as f:
            analyzer_state = pickle.load(f)
        
        self.filler_words = analyzer_state['filler_words']
        self.thresholds = analyzer_state['thresholds']
        self.analysis_results = analyzer_state['analysis_results']
        
        print(f"Loaded speech analyzer from {file_path}")
    
    def get_analysis_summary(self) -> Dict[str, Any]:
        """Get summary of speech analysis capabilities"""
        return {
            'filler_words_count': len(self.filler_words),
            'thresholds': self.thresholds,
            'analysis_metrics': [
                'filler_word_analysis',
                'repetition_analysis', 
                'basic_metrics',
                'quality_scoring'
            ]
        }

# Add missing import
import pandas as pd
