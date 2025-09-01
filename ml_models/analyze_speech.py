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
        
        # Format response for frontend
        formatted_analysis = {
            'quality_score': analysis.get('quality_score', 0),
            'filler_word_analysis': {
                'filler_count': analysis.get('filler_word_analysis', {}).get('filler_count', 0),
                'filler_rate': analysis.get('filler_word_analysis', {}).get('filler_rate', 0),
                'is_acceptable': analysis.get('filler_word_analysis', {}).get('is_acceptable', True)
            },
            'repetition_analysis': {
                'repetition_count': analysis.get('repetition_analysis', {}).get('repetition_count', 0),
                'repetition_rate': analysis.get('repetition_analysis', {}).get('repetition_rate', 0),
                'is_acceptable': analysis.get('repetition_analysis', {}).get('is_acceptable', True)
            },
            'basic_metrics': {
                'vocabulary_diversity': analysis.get('basic_metrics', {}).get('vocabulary_diversity', 0),
                'unique_words': analysis.get('basic_metrics', {}).get('unique_words', 0),
                'avg_sentence_length': analysis.get('basic_metrics', {}).get('avg_sentence_length', 0)
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
