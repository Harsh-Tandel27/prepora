#!/usr/bin/env python3
"""
ML Question Generator - Replaces Gemini with ML models
This script generates interview questions using the trained ML models
"""

import sys
import json
import os
import re

# Add current directory to path so we can import our ML modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from question_recommender import SimpleQuestionRecommender

def clean_question_text(question):
    """Clean question text to be voice assistant friendly"""
    # Remove special characters that might break voice assistant
    cleaned = re.sub(r'[/*\\]', '', question)
    # Remove extra whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def map_techstack_to_category(techstack):
    """Map tech stack to question categories"""
    techstack_lower = techstack.lower()
    
    category_mapping = {
        'javascript': 'Languages and Frameworks',
        'js': 'Languages and Frameworks',
        'python': 'Languages and Frameworks',
        'java': 'Languages and Frameworks',
        'react': 'Frontend Development',
        'vue': 'Frontend Development',
        'angular': 'Frontend Development',
        'node': 'Backend Development',
        'express': 'Backend Development',
        'django': 'Backend Development',
        'flask': 'Backend Development',
        'sql': 'Database and SQL',
        'mysql': 'Database and SQL',
        'postgresql': 'Database and SQL',
        'mongodb': 'Database and SQL',
        'data': 'Data Structures',
        'algorithm': 'Data Structures',
        'dsa': 'Data Structures',
        'html': 'Frontend Development',
        'css': 'Frontend Development',
        'typescript': 'Languages and Frameworks',
        'ts': 'Languages and Frameworks'
    }
    
    # Find matching category
    for tech, category in category_mapping.items():
        if tech in techstack_lower:
            return category
    
    # Default category
    return 'General Programming'

def map_level_to_difficulty(level):
    """Map experience level to difficulty"""
    level_lower = level.lower()
    
    if 'junior' in level_lower or 'entry' in level_lower:
        return 'Easy'
    elif 'senior' in level_lower or 'lead' in level_lower:
        return 'Hard'
    else:
        return 'Medium'

def generate_questions(role, level, techstack, type_focus, amount):
    """Generate interview questions using ML models"""
    try:
        # Initialize question recommender
        recommender = SimpleQuestionRecommender()
        
        # Load trained model
        model_path = os.path.join(os.path.dirname(__file__), 'trained_models', 'question_recommender.pkl')
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        recommender.load_model(model_path)
        
        # Map inputs to ML model parameters
        category = map_techstack_to_category(techstack)
        difficulty = map_level_to_difficulty(level)
        
        # Get questions by filters
        questions_df = recommender.get_questions_by_filters(
            category=category,
            difficulty=difficulty,
            limit=amount
        )
        
        questions = []
        
        # If we have enough questions from filters, use them
        if len(questions_df) >= amount:
            questions = questions_df['Question'].head(amount).tolist()
        else:
            # If not enough questions, get some from filters and some similar ones
            filter_questions = questions_df['Question'].tolist()
            remaining_needed = amount - len(filter_questions)
            
            # Get similar questions based on role
            similar_questions = recommender.recommend_questions_by_similarity(
                role, n_recommendations=remaining_needed
            )
            
            # Combine questions
            questions = filter_questions + [q['question'] for q in similar_questions]
            questions = questions[:amount]  # Ensure we don't exceed amount
        
        # Clean questions for voice assistant
        cleaned_questions = [clean_question_text(q) for q in questions]
        
        return {
            'success': True,
            'questions': cleaned_questions,
            'source': 'ML Models',
            'category': category,
            'difficulty': difficulty,
            'count': len(cleaned_questions)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'questions': []
        }

def main():
    """Main function - reads input from command line arguments and outputs to stdout"""
    try:
        # Read input from command line arguments
        if len(sys.argv) < 6:
            raise ValueError("Insufficient arguments. Expected: role level techstack type amount")
        
        # Extract parameters from command line arguments
        role = sys.argv[1]
        level = sys.argv[2]
        techstack = sys.argv[3]
        type_focus = sys.argv[4]
        amount = int(sys.argv[5])
        
        # Generate questions using ML
        result = generate_questions(role, level, techstack, type_focus, amount)
        
        # Output to stdout (Next.js will read this)
        print(json.dumps(result))
        
    except ValueError as e:
        error_result = {
            'success': False,
            'error': f'Invalid arguments: {str(e)}',
            'questions': []
        }
        print(json.dumps(error_result))
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': f'Unexpected error: {str(e)}',
            'questions': []
        }
        print(json.dumps(error_result))

if __name__ == '__main__':
    main()
