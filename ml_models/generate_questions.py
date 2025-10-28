#!/usr/bin/env python3
"""
ML Question Generator - Replaces Gemini with ML models
This script generates interview questions using the trained ML models
"""

import sys
import json
import os
import re
import random

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

def map_techstack_to_category(techstack, role=None):
    """Map tech stack to question categories based on available dataset categories"""
    techstack_lower = techstack.lower()
    
    # Role-specific priority mapping
    if role and 'machine learning' in role.lower():
        if 'python' in techstack_lower or 'machine learning' in techstack_lower or 'deep learning' in techstack_lower:
            return 'Machine Learning'
    
    if role and 'data scientist' in role.lower():
        if 'python' in techstack_lower or 'machine learning' in techstack_lower or 'data analysis' in techstack_lower:
            return 'Machine Learning'
    
    if role and 'data engineer' in role.lower():
        if 'python' in techstack_lower or 'data' in techstack_lower or 'apache spark' in techstack_lower:
            return 'Data Engineering'
    
    if role and 'devops' in role.lower():
        if 'docker' in techstack_lower or 'kubernetes' in techstack_lower or 'aws' in techstack_lower:
            return 'DevOps'
    
    if role and 'security' in role.lower():
        if 'security' in techstack_lower or 'oauth' in techstack_lower or 'jwt' in techstack_lower:
            return 'Security'
    
    if role and 'qa' in role.lower() or 'testing' in role.lower():
        if 'testing' in techstack_lower or 'jest' in techstack_lower or 'cypress' in techstack_lower:
            return 'Software Testing'
    
    if role and 'database' in role.lower():
        if 'sql' in techstack_lower or 'mysql' in techstack_lower or 'postgresql' in techstack_lower:
            return 'Database and SQL'
    
    category_mapping = {
        # Frontend technologies
        'javascript': 'Front-end',
        'js': 'Front-end',
        'react': 'Front-end',
        'vue': 'Front-end',
        'angular': 'Front-end',
        'html': 'Front-end',
        'css': 'Front-end',
        'typescript': 'Front-end',
        'ts': 'Front-end',
        'jquery': 'Front-end',
        'bootstrap': 'Front-end',
        'tailwind': 'Front-end',
        'sass': 'Front-end',
        'scss': 'Front-end',
        
        # Backend technologies
        'node': 'Back-end',
        'express': 'Back-end',
        'python': 'Languages and Frameworks',
        'django': 'Back-end',
        'flask': 'Back-end',
        'fastapi': 'Back-end',
        'java': 'Back-end',
        'spring': 'Back-end',
        'php': 'Back-end',
        'laravel': 'Back-end',
        'ruby': 'Back-end',
        'rails': 'Back-end',
        'go': 'Back-end',
        'rust': 'Back-end',
        'c#': 'Back-end',
        '.net': 'Back-end',
        
        # Database technologies
        'sql': 'Database and SQL',
        'mysql': 'Database and SQL',
        'postgresql': 'Database and SQL',
        'mongodb': 'Database and SQL',
        'redis': 'Database and SQL',
        'sqlite': 'Database and SQL',
        
        # DevOps technologies
        'docker': 'DevOps',
        'kubernetes': 'DevOps',
        'aws': 'DevOps',
        'azure': 'DevOps',
        'gcp': 'DevOps',
        'jenkins': 'DevOps',
        'git': 'Version Control',
        'github': 'Version Control',
        'gitlab': 'Version Control',
        
        # Data structures and algorithms
        'data': 'Data Structures',
        'algorithm': 'Algorithms',
        'dsa': 'Data Structures',
        'algorithms': 'Algorithms',
        'machine learning': 'Machine Learning',
        'deep learning': 'Machine Learning',
        'tensorflow': 'Machine Learning',
        'pytorch': 'Machine Learning',
        'scikit-learn': 'Machine Learning',
        'data analysis': 'Data Engineering',
        'statistics': 'Data Engineering',
        'jupyter': 'Data Engineering',
        'apache spark': 'Data Engineering',
        'react native': 'Front-end',
        'flutter': 'Front-end',
        'swift': 'Front-end',
        'kotlin': 'Front-end',
        'ios': 'Front-end',
        'android': 'Front-end',
        'figma': 'Front-end',
        'sketch': 'Front-end',
        'adobe xd': 'Front-end',
        'prototyping': 'Front-end',
        'user research': 'Front-end',
        'wireframing': 'Front-end',
        'design systems': 'Front-end',
        'agile': 'Software Testing',
        'scrum': 'Software Testing',
        'team management': 'Software Testing',
        'project management': 'Software Testing',
        'api testing': 'Software Testing',
        'automation': 'Software Testing',
        'manual testing': 'Software Testing',
        'linux': 'DevOps',
        'windows': 'DevOps',
        'shell scripting': 'DevOps',
        'ci/cd': 'DevOps',
        'terraform': 'DevOps',
        'infrastructure as code': 'DevOps',
        'networking': 'Networking',
        'network security': 'Security',
        'application security': 'Security',
        'penetration testing': 'Security',
        'oracle': 'Database and SQL',
        'database design': 'Database and SQL',
        'performance tuning': 'Database and SQL',
        'backup and recovery': 'Database and SQL',
        'analytics': 'Data Engineering',
        
        # Security
        'security': 'Security',
        'oauth': 'Security',
        'jwt': 'Security',
        
        # Testing
        'testing': 'Software Testing',
        'jest': 'Software Testing',
        'cypress': 'Software Testing',
        'selenium': 'Software Testing',
        
        # System Design
        'system': 'System Design',
        'architecture': 'System Design',
        'microservices': 'System Design',
        'api': 'System Design',
        
        # Web Development (general)
        'web': 'Web Development',
        'http': 'Web Development',
        'https': 'Web Development',
        'rest': 'Web Development',
        'api': 'Web Development'
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
        category = map_techstack_to_category(techstack, role)
        difficulty = map_level_to_difficulty(level)
        
        # Get all available categories and difficulties for better variety
        all_categories = recommender.get_all_categories()
        all_difficulties = recommender.get_all_difficulties()
        
        questions = []
        
        # If user explicitly chose an interview type, honor it
        explicit_category = None
        if type_focus:
            tf = type_focus.lower()
            # Normalize known types to dataset categories
            if 'system' in tf:
                explicit_category = 'System Design'
            elif 'case' in tf:
                explicit_category = 'Case Study'
            elif 'behavior' in tf:
                explicit_category = 'Behavioral'
            elif 'technical' in tf:
                # Use mapped or fallback general technical buckets
                explicit_category = category or 'General Programming'
            elif 'mixed' in tf:
                explicit_category = 'Mixed'

        # If explicit category provided, override base category (except Mixed)
        if explicit_category and explicit_category != 'Mixed':
            category = explicit_category

        # Strategy 1: Get questions from the chosen category and difficulty
        if category and difficulty and category != 'Mixed':
            category_questions = recommender.get_questions_by_filters(
                category=category,
                difficulty=difficulty,
                limit=amount * 2  # Get more to allow for random selection
            )
            if len(category_questions) > 0:
                questions.extend(category_questions['Question'].tolist())
        
        # Strategy 2: If we don't have enough, get questions from the same category but different difficulties
        if len(questions) < amount and category:
            for diff in all_difficulties:
                if diff != difficulty:
                    more_questions = recommender.get_questions_by_filters(
                        category=category,
                        difficulty=diff,
                        limit=amount - len(questions)
                    )
                    if len(more_questions) > 0:
                        questions.extend(more_questions['Question'].tolist())
                        if len(questions) >= amount:
                            break
        
        # Mixed interview: blend multiple categories
        if (type_focus and 'mixed' in type_focus.lower()) and len(questions) < amount:
            mix_pool = []
            preferred = ['Behavioral', 'System Design', 'Algorithms', 'Back-end', 'Front-end', 'Security', 'DevOps']
            for cat in preferred + [c for c in all_categories if c not in preferred]:
                more = recommender.get_questions_by_filters(category=cat, limit=2)
                if len(more) > 0:
                    mix_pool.extend(more['Question'].tolist())
                if len(mix_pool) >= amount * 3:
                    break
            random.shuffle(mix_pool)
            questions.extend(mix_pool[:max(0, amount - len(questions))])

        # Strategy 3: If still not enough, prioritize related categories based on tech stack
        if len(questions) < amount:
            # Define related categories for better fallback
            related_categories = {
                'Languages and Frameworks': ['General Programming', 'Back-end', 'Front-end'],
                'Back-end': ['Languages and Frameworks', 'Database and SQL', 'System Design'],
                'Front-end': ['Languages and Frameworks', 'Web Development', 'General Programming'],
                'Database and SQL': ['Back-end', 'System Design', 'General Programming'],
                'DevOps': ['System Design', 'Back-end', 'Security'],
                'Machine Learning': ['Data Engineering', 'Algorithms', 'General Programming'],
                'Data Engineering': ['Machine Learning', 'Database and SQL', 'Algorithms'],
                'Security': ['System Design', 'Back-end', 'General Programming'],
                'Software Testing': ['General Programming', 'Back-end', 'Front-end'],
                'System Design': ['Back-end', 'DevOps', 'Security']
            }
            
            # Try related categories first
            if category in related_categories:
                for related_cat in related_categories[category]:
                    if len(questions) >= amount:
                        break
                    more_questions = recommender.get_questions_by_filters(
                        category=related_cat,
                        difficulty=difficulty,
                        limit=amount - len(questions)
                    )
                    if len(more_questions) > 0:
                        questions.extend(more_questions['Question'].tolist())
        
        # Strategy 4: If still not enough, get questions from different categories but same difficulty
        if len(questions) < amount and difficulty:
            for cat in all_categories:
                if cat != category and cat not in (related_categories.get(category, []) if category in related_categories else []):
                    more_questions = recommender.get_questions_by_filters(
                        category=cat,
                        difficulty=difficulty,
                        limit=amount - len(questions)
                    )
                    if len(more_questions) > 0:
                        questions.extend(more_questions['Question'].tolist())
                        if len(questions) >= amount:
                            break
        
        # Strategy 5: If still not enough, get random questions from any category/difficulty
        if len(questions) < amount:
            all_questions = recommender.get_questions_by_filters(limit=amount * 3)
            if len(all_questions) > 0:
                all_question_list = all_questions['Question'].tolist()
                # Randomly sample to avoid always getting the same questions
                random.shuffle(all_question_list)
                questions.extend(all_question_list[:amount - len(questions)])
        
        # Remove duplicates and limit to requested amount
        unique_questions = list(dict.fromkeys(questions))  # Preserves order while removing duplicates
        questions = unique_questions[:amount]
        
        # If we still don't have enough questions, use fallback questions
        if len(questions) < amount:
            fallback_questions = [
                "Explain the concept of object-oriented programming.",
                "What is the difference between a stack and a queue?",
                "How would you approach debugging a production issue?",
                "Describe a challenging project you worked on.",
                "What is your experience with version control systems?",
                "How do you stay updated with technology trends?",
                "Explain the concept of RESTful APIs.",
                "What is your approach to code optimization?",
                "How do you handle conflicting requirements?",
                "Describe your experience with testing methodologies."
            ]
            questions.extend(fallback_questions[:amount - len(questions)])
        
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
