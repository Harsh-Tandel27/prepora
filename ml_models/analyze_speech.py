#!/usr/bin/env python3
"""
ML Speech Analyzer - Real-time speech analysis for Vapi workflow
This script analyzes speech quality using the trained ML models
"""

import sys
import json
import os

# Add current directory to path so we can import our ML modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from speech_analyzer import SimpleSpeechAnalyzer

def analyze_speech_with_ml(speech_text, duration=30.0):
    """Analyze speech using ML models"""
    try:
        # Initialize speech analyzer
        analyzer = SimpleSpeechAnalyzer()
        
        # Load trained model
        model_path = os.path.join(os.path.dirname(__file__), 'trained_models', 'speech_analyzer.pkl')
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        analyzer.load_model(model_path)
        
        # Analyze speech
        analysis = analyzer.analyze_speech_text(speech_text, duration)
        
        # Format response for frontend (handle both old and new analysis formats)
        filler_analysis = analysis.get('filler_word_analysis', {})
        repetition_analysis = analysis.get('repetition_analysis', {})
        pause_analysis = analysis.get('pause_analysis', {})
        vocabulary_analysis = analysis.get('vocabulary_analysis', {})
        structure_analysis = analysis.get('structure_analysis', {})
        basic_metrics = analysis.get('basic_metrics', {})
        
        formatted_analysis = {
            'quality_score': analysis.get('quality_score', 0),
            'confidence_score': analysis.get('confidence_score', 0),
            'filler_word_analysis': {
                'filler_count': filler_analysis.get('filler_count', 0),
                'filler_rate': filler_analysis.get('filler_rate', 0),
                'is_acceptable': filler_analysis.get('is_acceptable', True),
                'severity': filler_analysis.get('severity', 'low')
            },
            'repetition_analysis': {
                'repetition_count': repetition_analysis.get('repetition_count', 0),
                'repetition_rate': repetition_analysis.get('repetition_rate', 0),
                'is_acceptable': repetition_analysis.get('is_acceptable', True),
                'severity': repetition_analysis.get('severity', 'low')
            },
            'pause_analysis': {
                'pause_count': pause_analysis.get('pause_count', 0),
                'pause_rate': pause_analysis.get('pause_rate', 0),
                'is_acceptable': pause_analysis.get('is_acceptable', True),
                'severity': pause_analysis.get('severity', 'low')
            },
            'vocabulary_analysis': {
                'diversity': vocabulary_analysis.get('diversity', basic_metrics.get('vocabulary_diversity', 0)),
                'unique_count': vocabulary_analysis.get('unique_count', basic_metrics.get('unique_words', 0)),
                'vocabulary_richness': vocabulary_analysis.get('vocabulary_richness', 'low')
            },
            'structure_analysis': {
                'avg_length': structure_analysis.get('avg_length', basic_metrics.get('avg_sentence_length', 0)),
                'structure_quality': structure_analysis.get('structure_quality', 'fair'),
                'variety_score': structure_analysis.get('variety_score', 50)
            },
            'basic_metrics': {
                'word_count': basic_metrics.get('word_count', 0),
                'sentence_count': basic_metrics.get('sentence_count', 0),
                'vocabulary_diversity': vocabulary_analysis.get('diversity', basic_metrics.get('vocabulary_diversity', 0)),
                'unique_words': vocabulary_analysis.get('unique_count', basic_metrics.get('unique_words', 0)),
                'avg_sentence_length': structure_analysis.get('avg_length', basic_metrics.get('avg_sentence_length', 0))
            },
            'recommendations': analysis.get('recommendations', [])
        }
        
        return {
            'success': True,
            'analysis': formatted_analysis
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'analysis': {}
        }

def main():
    """Main function - reads input from stdin and outputs to stdout"""
    try:
        # Read input from stdin (Next.js will pipe data here)
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        # Extract parameters
        speech_text = data.get('text', '')
        duration = data.get('duration', 30.0)
        
        if not speech_text:
            result = {
                'success': False,
                'error': 'Speech text is required',
                'analysis': {}
            }
        else:
            # Analyze speech using ML
            result = analyze_speech_with_ml(speech_text, duration)
        
        # Output to stdout (Next.js will read this)
        print(json.dumps(result))
        
    except json.JSONDecodeError as e:
        error_result = {
            'success': False,
            'error': f'Invalid JSON input: {str(e)}',
            'analysis': {}
        }
        print(json.dumps(error_result))
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': f'Unexpected error: {str(e)}',
            'analysis': {}
        }
        print(json.dumps(error_result))

if __name__ == '__main__':
    main()
