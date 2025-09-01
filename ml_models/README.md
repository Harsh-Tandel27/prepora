# Simple ML Pipeline for Interview Preparation System

A simplified, beginner-friendly machine learning pipeline designed for interview preparation and evaluation. This system uses basic ML algorithms and straightforward approaches to make it accessible for newcomers to AI/ML.

## 🎯 Overview

This ML pipeline provides three core functionalities:
1. **Interview Success Prediction** - Predicts interview outcomes using simple ML models
2. **Question Recommendation** - Suggests relevant interview questions based on similarity
3. **Speech Analysis** - Analyzes speech quality using basic text analysis

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Required packages (see `requirements.txt`)

### Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Train the models
python train_enhanced_pipeline.py

# Test the system
python demo_enhanced_pipeline.py
```

## 🔧 Core Components

### 1. Data Preprocessor (`data_preprocessor.py`)
- **Purpose**: Handles data loading, cleaning, and feature engineering
- **Features**: 
  - Loads interview data and question datasets
  - Handles missing values and data cleaning
  - Creates features for ML training
- **Complexity**: Basic data manipulation with pandas

### 2. Interview Predictor (`interview_predictor.py`)
- **Purpose**: Predicts interview success using simple ML models
- **Models**: 
  - Random Forest (100 trees, max depth 10)
  - Logistic Regression
- **Features**: Basic accuracy metrics, feature importance
- **Complexity**: Simple models with basic parameters (no hyperparameter tuning)

### 3. Question Recommender (`question_recommender.py`)
- **Purpose**: Recommends interview questions based on similarity
- **Features**:
  - Basic text cleaning (lowercase, remove special characters)
  - Simple TF-IDF vectorization (1000 features max)
  - Cosine similarity for recommendations
- **Complexity**: Basic NLP without advanced techniques

### 4. Speech Analyzer (`speech_analyzer.py`)
- **Purpose**: Analyzes speech quality using simple metrics
- **Features**:
  - Filler word detection
  - Word repetition analysis
  - Basic speaking rate calculation
  - Simple quality scoring (0-100)
- **Complexity**: Basic text analysis without sentiment or complexity scoring

## 📊 Training Process

### Step 1: Data Preprocessing
- Load interview data from `dataset/Data - Base.csv`
- Load questions from `dataset/Software Questions.csv`
- Clean and prepare data for ML training

### Step 2: Model Training
- **Interview Predictor**: Train Random Forest and Logistic Regression
- **Question Recommender**: Train TF-IDF vectorization
- **Speech Analyzer**: Initialize with filler words and thresholds

### Step 3: Model Saving
- All models saved using `pickle` format
- Models stored in `trained_models/` directory

## 🎯 Key Features

### Simplicity First
- **Basic Algorithms**: Random Forest, Logistic Regression
- **Simple Text Processing**: Basic cleaning without lemmatization
- **Straightforward Metrics**: Accuracy, basic similarity scores
- **No Over-engineering**: Focus on core functionality

### Beginner Friendly
- **Clear Code Structure**: Well-documented, easy to understand
- **Basic Parameters**: Simple model configurations
- **Error Handling**: Graceful handling of edge cases
- **Modular Design**: Each component is independent

### Practical Functionality
- **Interview Prediction**: Real-world interview outcome prediction
- **Question Matching**: Find similar interview questions
- **Speech Quality**: Basic speech pattern analysis
- **Easy Integration**: Simple API for each component

## 📈 Expected Results

### Interview Prediction
- **Accuracy**: 70-85% (depending on data quality)
- **Models**: 2 simple models (Random Forest + Logistic Regression)
- **Features**: Basic feature engineering from interview data

### Question Recommendation
- **TF-IDF Features**: Up to 1000 features
- **Similarity**: Cosine similarity for question matching
- **Categories**: Support for multiple question categories

### Speech Analysis
- **Quality Score**: 0-100 scale
- **Filler Words**: Detection of common filler words
- **Repetition**: Basic word repetition analysis

## 🔧 Customization

### Adding New Models
```python
# In interview_predictor.py
models = {
    'Your Model': YourModelClass(
        param1=value1,
        param2=value2
    )
}
```

### Modifying Text Processing
```python
# In question_recommender.py
def _simple_text_cleaning(self, text):
    # Add your custom text cleaning logic
    return cleaned_text
```

### Adjusting Speech Analysis
```python
# In speech_analyzer.py
self.thresholds = {
    'filler_word_rate': 0.20,  # Adjust threshold
    'repetition_threshold': 0.15
}
```

## 🚀 Deployment

### Local Development
```bash
# Train models
python train_enhanced_pipeline.py

# Test system
python demo_enhanced_pipeline.py
```

### Production Use
```python
# Load trained models
from interview_predictor import SimpleInterviewPredictor
predictor = SimpleInterviewPredictor()
predictor.load_model('path/to/model.pkl')

# Make predictions
prediction = predictor.predict(data)
```

## 📊 Monitoring

### Model Performance
- Track accuracy metrics for interview prediction
- Monitor question recommendation quality
- Check speech analysis thresholds

### Data Quality
- Validate input data formats
- Check for missing values
- Monitor feature distributions

## 🔮 Future Enhancements

### Easy Improvements
- **Add More Models**: Support Vector Machine, Decision Trees
- **Better Text Processing**: Basic stemming, stop word removal
- **Feature Engineering**: Simple feature selection methods

### Advanced Features (Optional)
- **Cross-validation**: Basic k-fold validation
- **Hyperparameter Tuning**: Simple grid search
- **Model Ensembling**: Basic voting classifiers

## 📚 Learning Resources

### For Beginners
- **Scikit-learn Documentation**: Basic ML concepts
- **Pandas Tutorial**: Data manipulation
- **NLTK Basics**: Simple text processing

### Understanding the Code
- **Code Comments**: Extensive inline documentation
- **Simple Functions**: Each function has a single purpose
- **Clear Naming**: Descriptive variable and function names

## 🆘 Troubleshooting

### Common Issues
1. **Missing Dependencies**: Run `pip install -r requirements.txt`
2. **Data Format**: Ensure CSV files are properly formatted
3. **Memory Issues**: Reduce dataset size for testing

### Getting Help
- Check error messages for specific issues
- Verify data file paths and formats
- Ensure all required packages are installed

## 📄 License

This project is designed for educational purposes and interview preparation. Feel free to modify and adapt for your needs.

---

**Note**: This system is intentionally simplified to help beginners understand ML concepts. The focus is on clarity and functionality rather than advanced performance optimization.
