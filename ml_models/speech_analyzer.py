#!/usr/bin/env python3
"""
Enhanced Speech Analyzer for ML Pipeline
Advanced speech pattern analysis for interview evaluation
"""

import re
import numpy as np
import pickle
from typing import Dict, List, Tuple, Any, Optional
from collections import Counter
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
except:
    pass

class SimpleSpeechAnalyzer:
    """Enhanced speech pattern analysis for interview evaluation"""
    
    def __init__(self):
        # Comprehensive filler words and phrases
        self.filler_words = {
            'um', 'uh', 'ah', 'er', 'eh', 'hmm', 'huh',
            'like', 'you know', 'i mean', 'basically', 'actually', 'literally',
            'sort of', 'kind of', 'right', 'okay', 'well', 'so', 'and', 'but',
            'then', 'now', 'see', 'look', 'you see', 'i guess', 'i think',
            'i suppose', 'i believe', 'i feel', 'i would say', 'i mean to say'
        }
        
        # Filler phrases (multi-word)
        self.filler_phrases = [
            'you know', 'i mean', 'sort of', 'kind of', 'you see',
            'i guess', 'i think', 'i suppose', 'i believe', 'i feel',
            'i would say', 'i mean to say', 'let me think', 'what i mean is'
        ]
        
        # Enhanced speech quality thresholds - adjusted for better scoring
        self.thresholds = {
            'filler_word_rate': 0.15,      # Max 15% filler words (more lenient for natural speech)
            'repetition_threshold': 0.10,   # Max 10% repeated words (more lenient)
            'pause_rate': 0.20,            # Max 20% pause markers (more lenient)
            'min_words': 10,                # Minimum words for analysis
            'optimal_wpm_min': 100,         # Optimal speaking rate range (more lenient)
            'optimal_wpm_max': 200,
            'min_sentence_length': 5,       # Minimum words per sentence
            'max_sentence_length': 35       # Maximum words per sentence (more lenient)
        }
        
        # Initialize analysis results
        self.analysis_results = {}
    
    def analyze_speech_text(self, text: str, audio_duration: float = None) -> Dict[str, Any]:
        """Enhanced speech text analysis"""
        if not text or not text.strip():
            return self._empty_analysis()
        
        # Clean and normalize text (preserve pause markers)
        cleaned_text = self._clean_text(text)
        words = cleaned_text.split()
        
        if len(words) < self.thresholds['min_words']:
            return self._empty_analysis()
        
        # Detect pause markers (-- in transcript)
        pause_count = text.count('--') + text.count('...')
        pause_rate = pause_count / max(1, len(sent_tokenize(text)))
        
        # Basic metrics
        word_count = len(words)
        char_count = len(cleaned_text)
        sentences = sent_tokenize(text)
        sentence_count = len(sentences)
        
        # Calculate speaking rate if duration provided
        speaking_rate = None
        if audio_duration and audio_duration > 0:
            speaking_rate = (word_count / audio_duration) * 60  # words per minute
        
        # Enhanced analysis
        filler_analysis = self._analyze_filler_words_enhanced(text, words)
        repetition_analysis = self._analyze_repetition_enhanced(words)
        pause_analysis = self._analyze_pauses(text, pause_count, pause_rate)
        vocabulary_analysis = self._analyze_vocabulary_enhanced(words, sentences)
        structure_analysis = self._analyze_sentence_structure(sentences, words)
        
        # Calculate enhanced quality score
        quality_score = self._calculate_enhanced_score(
            filler_analysis, repetition_analysis, pause_analysis,
            vocabulary_analysis, structure_analysis, speaking_rate
        )
        
        # Compile results (fix duplicate basic_metrics)
        results = {
            'basic_metrics': {
                'word_count': word_count,
                'char_count': char_count,
                'sentence_count': sentence_count,
                'speaking_rate_wpm': speaking_rate,
                'audio_duration_seconds': audio_duration,
                'avg_words_per_sentence': word_count / sentence_count if sentence_count > 0 else 0,
                'vocabulary_diversity': vocabulary_analysis['diversity'],
                'unique_words': vocabulary_analysis['unique_count'],
                'avg_sentence_length': structure_analysis['avg_length']
            },
            'filler_word_analysis': filler_analysis,
            'repetition_analysis': repetition_analysis,
            'pause_analysis': pause_analysis,
            'vocabulary_analysis': vocabulary_analysis,
            'structure_analysis': structure_analysis,
            'quality_score': quality_score,
            'confidence_score': self._calculate_confidence_score(
                filler_analysis, repetition_analysis, pause_analysis, vocabulary_analysis
            ),
            'recommendations': self._generate_enhanced_recommendations(
                filler_analysis, repetition_analysis, pause_analysis,
                vocabulary_analysis, structure_analysis, speaking_rate
            )
        }
        
        # Store results
        self.analysis_results = results
        
        return results
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text for analysis"""
        # Handle None/NaN without pandas
        if text is None or (isinstance(text, float) and np.isnan(text)):
            return ""
        
        # Convert to string and lowercase
        text = str(text).lower()
        
        # Preserve pause markers for analysis
        text = text.replace('--', ' -- ')
        text = text.replace('...', ' ... ')
        
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _analyze_filler_words_enhanced(self, original_text: str, words: List[str]) -> Dict[str, Any]:
        """Enhanced filler word analysis with phrase detection"""
        filler_count = 0
        filler_details = []
        text_lower = original_text.lower()
        
        # Count filler phrases first (to avoid double counting)
        phrase_count = 0
        for phrase in self.filler_phrases:
            matches = len(re.findall(r'\b' + re.escape(phrase) + r'\b', text_lower))
            if matches > 0:
                phrase_count += matches
                filler_details.extend([phrase] * matches)
        
        # Count single-word fillers (excluding those in phrases)
        for word in words:
            if word in self.filler_words and word not in ' '.join(self.filler_phrases):
                filler_count += 1
                filler_details.append(word)
        
        total_fillers = phrase_count + filler_count
        filler_rate = total_fillers / len(words) if words else 0
        
        # Group by type
        filler_by_type = Counter(filler_details)
        
        return {
            'filler_count': total_fillers,
            'filler_rate': filler_rate,
            'filler_words': filler_details[:20],  # Limit to top 20
            'filler_by_type': dict(filler_by_type.most_common(10)),
            'phrase_count': phrase_count,
            'word_count': filler_count,
            'is_acceptable': filler_rate <= self.thresholds['filler_word_rate'],
            'severity': 'high' if filler_rate > 0.20 else 'medium' if filler_rate > 0.15 else 'low'
        }
    
    def _analyze_repetition_enhanced(self, words: List[str]) -> Dict[str, Any]:
        """Enhanced repetition analysis"""
        # Filter out very short words and common words
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        significant_words = [w for w in words if len(w) > 3 and w not in common_words]
        
        word_counts = Counter(significant_words)
        repeated_words = {word: count for word, count in word_counts.items() if count > 2}  # More than 2 occurrences
        
        # Calculate repetition rate
        total_repetitions = sum(count - 2 for count in repeated_words.values())
        repetition_rate = total_repetitions / len(significant_words) if significant_words else 0
        
        # Find most repeated words
        top_repeated = sorted(repeated_words.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Calculate consecutive repetition (same word repeated in sequence)
        consecutive_reps = 0
        prev_word = None
        rep_streak = 0
        for word in significant_words:
            if word == prev_word:
                rep_streak += 1
                if rep_streak == 2:  # First repetition
                    consecutive_reps += 1
            else:
                rep_streak = 0
            prev_word = word
        
        return {
            'repetition_count': total_repetitions,
            'repetition_rate': repetition_rate,
            'repeated_words': top_repeated,
            'consecutive_repetitions': consecutive_reps,
            'is_acceptable': repetition_rate <= self.thresholds['repetition_threshold'],
            'severity': 'high' if repetition_rate > 0.15 else 'medium' if repetition_rate > 0.08 else 'low'
        }
    
    def _analyze_pauses(self, text: str, pause_count: int, pause_rate: float) -> Dict[str, Any]:
        """Analyze pause patterns in speech"""
        # Count different pause types
        double_dash = text.count('--')
        ellipsis = text.count('...')
        long_pauses = len(re.findall(r'--\s*--', text))  # Multiple consecutive pauses
        
        return {
            'pause_count': pause_count,
            'pause_rate': pause_rate,
            'double_dash_count': double_dash,
            'ellipsis_count': ellipsis,
            'long_pause_count': long_pauses,
            'is_acceptable': pause_rate <= self.thresholds['pause_rate'],
            'severity': 'high' if pause_rate > 0.25 else 'medium' if pause_rate > 0.15 else 'low'
        }
    
    def _analyze_vocabulary_enhanced(self, words: List[str], sentences: List[str]) -> Dict[str, Any]:
        """Enhanced vocabulary analysis"""
        unique_words = set(words)
        vocabulary_diversity = len(unique_words) / len(words) if words else 0
        
        # Word length analysis (longer words often indicate sophistication)
        word_lengths = [len(w) for w in words if len(w) > 0]
        avg_word_length = np.mean(word_lengths) if word_lengths else 0
        long_words = sum(1 for w in words if len(w) > 6)
        long_word_ratio = long_words / len(words) if words else 0
        
        # Calculate type-token ratio (vocabulary richness)
        type_token_ratio = vocabulary_diversity
        
        # Analyze sentence-level vocabulary diversity
        sentence_diversities = []
        for sentence in sentences:
            sent_words = word_tokenize(sentence.lower())
            if len(sent_words) > 0:
                sent_diversity = len(set(sent_words)) / len(sent_words)
                sentence_diversities.append(sent_diversity)
        
        avg_sentence_diversity = np.mean(sentence_diversities) if sentence_diversities else 0
        
        return {
            'diversity': vocabulary_diversity,
            'unique_count': len(unique_words),
            'total_words': len(words),
            'avg_word_length': avg_word_length,
            'long_word_ratio': long_word_ratio,
            'type_token_ratio': type_token_ratio,
            'avg_sentence_diversity': avg_sentence_diversity,
            'vocabulary_richness': 'high' if vocabulary_diversity > 0.7 else 'medium' if vocabulary_diversity > 0.5 else 'low'
        }
    
    def _analyze_sentence_structure(self, sentences: List[str], words: List[str]) -> Dict[str, Any]:
        """Analyze sentence structure and complexity"""
        sentence_lengths = [len(word_tokenize(s.lower())) for s in sentences if s.strip()]
        
        if not sentence_lengths:
            return {
                'avg_length': 0,
                'min_length': 0,
                'max_length': 0,
                'structure_quality': 'poor',
                'variety_score': 0
            }
        
        avg_length = np.mean(sentence_lengths)
        min_length = min(sentence_lengths)
        max_length = max(sentence_lengths)
        
        # Calculate variety (standard deviation of sentence lengths)
        length_variety = np.std(sentence_lengths) if len(sentence_lengths) > 1 else 0
        
        # Assess structure quality
        too_short = sum(1 for l in sentence_lengths if l < self.thresholds['min_sentence_length'])
        too_long = sum(1 for l in sentence_lengths if l > self.thresholds['max_sentence_length'])
        
        structure_quality = 'excellent'
        if too_short > len(sentences) * 0.3 or too_long > len(sentences) * 0.3:
            structure_quality = 'poor'
        elif too_short > len(sentences) * 0.15 or too_long > len(sentences) * 0.15:
            structure_quality = 'fair'
        
        return {
            'avg_length': avg_length,
            'min_length': min_length,
            'max_length': max_length,
            'length_variety': length_variety,
            'too_short_count': too_short,
            'too_long_count': too_long,
            'structure_quality': structure_quality,
            'variety_score': min(95, length_variety * 10)  # Normalize to 0-95, cap at 95
        }
    
    def _calculate_enhanced_score(self, filler_analysis: Dict, repetition_analysis: Dict,
                                 pause_analysis: Dict, vocabulary_analysis: Dict,
                                 structure_analysis: Dict, speaking_rate: Optional[float]) -> float:
        """Calculate enhanced speech quality score (0-95) with balanced weighted factors"""
        # Start with higher base score for better candidates
        score = 80.0
        
        # Filler words penalty (weight: 25%) - Balanced
        filler_rate = filler_analysis['filler_rate']
        # Only penalize if more than 8% fillers (more lenient)
        if filler_rate > 0.08:
            if filler_rate > self.thresholds['filler_word_rate']:
                excess = filler_rate - self.thresholds['filler_word_rate']
                penalty = min(20, excess * 150)  # Reduced max penalty
            else:
                # Small penalty for moderate fillers
                penalty = (filler_rate - 0.05) * 30 if filler_rate > 0.05 else 0
            score -= penalty
        elif filler_rate < 0.03:  # Bonus for very low fillers
            score += 5
        # Additional penalty for high filler count (only if very high)
        if filler_analysis.get('filler_count', 0) > 10:
            score -= min(5, (filler_analysis['filler_count'] - 10) * 0.3)
        
        # Repetition penalty (weight: 20%) - Balanced
        repetition_rate = repetition_analysis['repetition_rate']
        if repetition_rate > 0.08:  # Only penalize if more than 8% repetition
            if repetition_rate > self.thresholds['repetition_threshold']:
                excess = repetition_rate - self.thresholds['repetition_threshold']
                penalty = min(20, excess * 200)  # Reduced max penalty
            else:
                # Small penalty for moderate repetition
                penalty = (repetition_rate - 0.05) * 25 if repetition_rate > 0.05 else 0
            score -= penalty
        elif repetition_rate < 0.02:  # Bonus for very low repetition
            score += 3
        # Additional penalty for consecutive repetitions (only if significant)
        if repetition_analysis.get('consecutive_repetitions', 0) > 2:
            score -= min(5, (repetition_analysis['consecutive_repetitions'] - 2) * 1.0)
        
        # Pause penalty (weight: 10%) - Balanced
        pause_rate = pause_analysis['pause_rate']
        if pause_rate > 0.10:  # Only penalize if more than 10% pauses (more lenient)
            if pause_rate > self.thresholds['pause_rate']:
                excess = pause_rate - self.thresholds['pause_rate']
                penalty = min(15, excess * 100)  # Reduced max penalty
            else:
                # Small penalty for moderate pauses
                penalty = (pause_rate - 0.05) * 20 if pause_rate > 0.05 else 0
            score -= penalty
        # Additional penalty for long pauses (only if significant)
        if pause_analysis.get('long_pause_count', 0) > 3:
            score -= min(3, (pause_analysis['long_pause_count'] - 3) * 0.5)
        
        # Vocabulary bonus (weight: 20%) - Increased bonuses for excellent vocabulary
        vocab_diversity = vocabulary_analysis['diversity']
        if vocab_diversity > 0.85:  # Excellent vocabulary
            bonus = min(15, (vocab_diversity - 0.85) * 60)  # Increased max bonus
            score += bonus
        elif vocab_diversity > 0.75:  # Very good vocabulary
            bonus = min(10, (vocab_diversity - 0.75) * 40)  # Increased bonus
            score += bonus
        elif vocab_diversity > 0.65:  # Good vocabulary
            bonus = min(5, (vocab_diversity - 0.65) * 25)  # Small bonus
            score += bonus
        elif vocab_diversity < 0.4:
            penalty = min(12, (0.4 - vocab_diversity) * 40)  # Reduced penalty
            score -= penalty
        elif vocab_diversity < 0.5:
            penalty = min(6, (0.5 - vocab_diversity) * 20)  # Reduced penalty
            score -= penalty
        
        # Structure bonus (weight: 15%) - Increased bonuses for excellent structure
        if structure_analysis['structure_quality'] == 'excellent':
            score += 10  # Increased bonus
        elif structure_analysis['structure_quality'] == 'fair':
            score += 4  # Increased bonus
        else:
            score -= 6  # Reduced penalty
        
        # Speaking rate penalty (weight: 5%) - More lenient
        if speaking_rate:
            if speaking_rate < self.thresholds['optimal_wpm_min']:
                penalty = min(5, (self.thresholds['optimal_wpm_min'] - speaking_rate) / 10)  # Reduced penalty
                score -= penalty
            elif speaking_rate > self.thresholds['optimal_wpm_max']:
                penalty = min(5, (speaking_rate - self.thresholds['optimal_wpm_max']) / 10)  # Reduced penalty
                score -= penalty
        
        # Additional penalties for poor structure
        if structure_analysis.get('too_short_count', 0) > 0:
            score -= min(5, structure_analysis['too_short_count'] * 0.5)
        if structure_analysis.get('too_long_count', 0) > 0:
            score -= min(5, structure_analysis['too_long_count'] * 0.5)
        
        # Ensure score is within bounds - cap at 95, never allow 100
        return max(0, min(95, round(score, 2)))
    
    def _calculate_confidence_score(self, filler_analysis: Dict, repetition_analysis: Dict,
                                   pause_analysis: Dict, vocabulary_analysis: Dict) -> float:
        """Calculate confidence score based on speech patterns (0-95) - balanced scoring"""
        # Start with higher base score for better candidates
        confidence = 75.0
        
        # Reduce confidence for high filler usage - Balanced
        if filler_analysis['severity'] == 'high':
            confidence -= 25  # Reduced penalty
        elif filler_analysis['severity'] == 'medium':
            confidence -= 12  # Reduced penalty
        elif filler_analysis.get('filler_rate', 0) > 0.05:  # Only penalize if more than 5%
            confidence -= 3
        
        # Reduce confidence for high repetition - Balanced
        if repetition_analysis['severity'] == 'high':
            confidence -= 20  # Reduced penalty
        elif repetition_analysis['severity'] == 'medium':
            confidence -= 10  # Reduced penalty
        elif repetition_analysis.get('repetition_rate', 0) > 0.05:  # Only penalize if more than 5%
            confidence -= 3
        
        # Reduce confidence for excessive pauses - Balanced
        if pause_analysis['severity'] == 'high':
            confidence -= 15  # Reduced penalty
        elif pause_analysis['severity'] == 'medium':
            confidence -= 6  # Reduced penalty
        elif pause_analysis.get('pause_rate', 0) > 0.08:  # Only penalize if more than 8%
            confidence -= 2
        
        # Boost confidence for good vocabulary - Increased bonuses
        if vocabulary_analysis['vocabulary_richness'] == 'high':
            confidence += 10  # Increased bonus
        elif vocabulary_analysis['vocabulary_richness'] == 'medium':
            confidence += 3  # Small bonus for medium
        elif vocabulary_analysis['vocabulary_richness'] == 'low':
            confidence -= 8  # Reduced penalty
        
        # Additional penalty for consecutive repetitions (shows lack of confidence)
        if repetition_analysis.get('consecutive_repetitions', 0) > 2:
            confidence -= min(5, (repetition_analysis['consecutive_repetitions'] - 2) * 1.0)
        
        # Additional penalty for long pauses (shows hesitation)
        if pause_analysis.get('long_pause_count', 0) > 3:
            confidence -= min(3, (pause_analysis['long_pause_count'] - 3) * 0.5)
        
        # Ensure score is within bounds - cap at 95, never allow 100
        return max(0, min(95, round(confidence, 2)))
    
    def _generate_enhanced_recommendations(self, filler_analysis: Dict, repetition_analysis: Dict,
                                         pause_analysis: Dict, vocabulary_analysis: Dict,
                                         structure_analysis: Dict, speaking_rate: Optional[float]) -> List[str]:
        """Generate detailed improvement recommendations"""
        recommendations = []
        
        # Filler word recommendations
        if filler_analysis['severity'] == 'high':
            top_fillers = [w for w, _ in Counter(filler_analysis['filler_words']).most_common(3)]
            recommendations.append(
                f"Significantly reduce filler words, especially '{', '.join(top_fillers)}'. "
                f"Practice pausing silently instead of using fillers."
            )
        elif filler_analysis['severity'] == 'medium':
            recommendations.append(
                "Work on reducing filler words. Try pausing briefly to gather your thoughts instead."
            )
        
        # Repetition recommendations
        if repetition_analysis['severity'] == 'high':
            top_repeated = [w for w, _ in repetition_analysis['repeated_words'][:3]]
            recommendations.append(
                f"Avoid repeating words like '{', '.join(top_repeated)}'. Use synonyms and vary your vocabulary."
            )
        elif repetition_analysis['severity'] == 'medium':
            recommendations.append("Try using more varied vocabulary to avoid repetition.")
        
        # Pause recommendations
        if pause_analysis['severity'] == 'high':
            recommendations.append(
                "Too many pauses detected. Work on smoother transitions between thoughts."
            )
        elif pause_analysis['pause_count'] > 0:
            recommendations.append("Use strategic pauses for emphasis, but avoid excessive hesitation.")
        
        # Vocabulary recommendations
        if vocabulary_analysis['vocabulary_richness'] == 'low':
            recommendations.append(
                "Expand your vocabulary. Use more specific and varied terms to express your ideas."
            )
        
        # Structure recommendations
        if structure_analysis['structure_quality'] == 'poor':
            if structure_analysis['too_short_count'] > structure_analysis['too_long_count']:
                recommendations.append(
                    "Many sentences are too short. Combine related ideas into more complete thoughts."
                )
            else:
                recommendations.append(
                    "Some sentences are too long. Break complex ideas into clearer, shorter sentences."
                )
        elif structure_analysis['variety_score'] < 30:
            recommendations.append("Vary your sentence lengths for more engaging speech.")
        
        # Speaking rate recommendations
        if speaking_rate:
            if speaking_rate < self.thresholds['optimal_wpm_min']:
                recommendations.append(
                    f"Speak slightly faster. Aim for {self.thresholds['optimal_wpm_min']}-{self.thresholds['optimal_wpm_max']} words per minute."
                )
            elif speaking_rate > self.thresholds['optimal_wpm_max']:
                recommendations.append(
                    f"Slow down slightly. Aim for {self.thresholds['optimal_wpm_min']}-{self.thresholds['optimal_wpm_max']} words per minute for clarity."
                )
        
        # Positive feedback
        if not recommendations:
            recommendations.append("Excellent speech quality! Your delivery is clear and confident.")
        elif filler_analysis['is_acceptable'] and repetition_analysis['is_acceptable']:
            recommendations.append("Good foundation! Continue working on the areas mentioned above.")
        
        return recommendations
    
    def _empty_analysis(self) -> Dict[str, Any]:
        """Return empty analysis structure"""
        return {
            'basic_metrics': {
                'word_count': 0,
                'char_count': 0,
                'sentence_count': 0,
                'speaking_rate_wpm': None,
                'audio_duration_seconds': None,
                'avg_words_per_sentence': 0,
                'vocabulary_diversity': 0,
                'unique_words': 0,
                'avg_sentence_length': 0
            },
            'filler_word_analysis': {
                'filler_count': 0, 'filler_rate': 0, 'filler_words': [], 
                'filler_by_type': {}, 'phrase_count': 0, 'word_count': 0,
                'is_acceptable': True, 'severity': 'low'
            },
            'repetition_analysis': {
                'repetition_count': 0, 'repetition_rate': 0, 'repeated_words': [],
                'consecutive_repetitions': 0, 'is_acceptable': True, 'severity': 'low'
            },
            'pause_analysis': {
                'pause_count': 0, 'pause_rate': 0, 'double_dash_count': 0,
                'ellipsis_count': 0, 'long_pause_count': 0, 'is_acceptable': True, 'severity': 'low'
            },
            'vocabulary_analysis': {
                'diversity': 0, 'unique_count': 0, 'total_words': 0,
                'avg_word_length': 0, 'long_word_ratio': 0, 'type_token_ratio': 0,
                'avg_sentence_diversity': 0, 'vocabulary_richness': 'low'
            },
            'structure_analysis': {
                'avg_length': 0, 'min_length': 0, 'max_length': 0,
                'length_variety': 0, 'too_short_count': 0, 'too_long_count': 0,
                'structure_quality': 'poor', 'variety_score': 0
            },
            'quality_score': 0,
            'confidence_score': 0,
            'recommendations': ["No speech content to analyze"]
        }
    
    def save_model(self, file_path: str):
        """Save speech analyzer state using pickle"""
        analyzer_state = {
            'filler_words': self.filler_words,
            'filler_phrases': self.filler_phrases,
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
        
        self.filler_words = analyzer_state.get('filler_words', self.filler_words)
        self.filler_phrases = analyzer_state.get('filler_phrases', self.filler_phrases)
        self.thresholds = analyzer_state.get('thresholds', self.thresholds)
        self.analysis_results = analyzer_state.get('analysis_results', {})
        
        print(f"Loaded speech analyzer from {file_path}")
    
    def get_analysis_summary(self) -> Dict[str, Any]:
        """Get summary of speech analysis capabilities"""
        return {
            'filler_words_count': len(self.filler_words),
            'filler_phrases_count': len(self.filler_phrases),
            'thresholds': self.thresholds,
            'analysis_metrics': [
                'filler_word_analysis',
                'repetition_analysis',
                'pause_analysis',
                'vocabulary_analysis',
                'structure_analysis',
                'quality_scoring',
                'confidence_scoring'
            ]
        }
