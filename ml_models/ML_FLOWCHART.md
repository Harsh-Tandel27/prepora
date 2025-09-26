## ML System Flowcharts

Use these Mermaid diagrams to visualize the pipeline. You can render them in many markdown viewers, VS Code plugins, or online Mermaid renderers.

### 1) High-Level Components
```mermaid
flowchart LR
  A[Datasets]\nData - Base.csv\nSoftware Questions.csv --> B[Data Preprocessor]
  B -->|base features + target| C[Interview Predictor]
  B -->|cleaned Q/A + combined_text| D[Question Recommender]
  E[Speech Analyzer]\n(rule-based) -. no training .- E

  C --> F[(trained_models/\ninterview_predictor.pkl)]
  D --> G[(trained_models/\nquestion_recommender.pkl)]
  B --> H[(trained_models/\ndata_preprocessor.pkl)]
  E --> I[(trained_models/\nspeech_analyzer.pkl)]
```

### 2) Training Pipeline (`train_simple_pipeline.py`)
```mermaid
sequenceDiagram
  participant T as Trainer
  participant P as Data Preprocessor
  participant IP as Interview Predictor
  participant QR as Question Recommender
  participant SA as Speech Analyzer

  T->>P: load_and_preprocess_base_data(Data - Base.csv)
  T->>P: load_and_preprocess_questions_data(Software Questions.csv)
  P-->>T: base_data, questions_data

  T->>IP: prepare_ml_data(base_data) -> X, y
  T->>IP: train_models(X, y)
  IP-->>T: best model + metrics

  T->>QR: load_and_preprocess_questions(temp_questions.csv)
  T->>QR: train_tfidf_model()

  T->>SA: initialize (no dataset)

  T->>T: save all -> trained_models/*.pkl
```

### 3) Question Generation (`generate_questions.py`)
```mermaid
flowchart TD
  UI[Inputs\nrole, level, techstack, type, amount] --> M{map params}
  M -->|role+techstack| Cat[Category]
  M -->|level| Dif[Difficulty]
  Cat --> QG[Retrieval Strategy]
  Dif --> QG

  subgraph Strategy
  QG1[1. category + difficulty]
  QG2[2. same category, other difficulties]
  QG3[3. related categories (role-aware)]
  QG4[4. any category (random sample)]
  end

  QG -->|de-duplicate & trim| OUT[Questions JSON]

  subgraph Model
  QR[(trained_models/\nquestion_recommender.pkl)]
  end

  QG -. uses .-> QR
```

### 4) Interview Prediction (`interview_predictor.py`)
```mermaid
flowchart LR
  X[Preprocessed Features from base_data] --> S[Scaler]
  S --> MODELS{Models}
  MODELS -->|RandomForest| R
  MODELS -->|LogReg| L
  R --> ACC1[Accuracy]
  L --> ACC2[Accuracy]
  ACC1 & ACC2 --> BEST[Pick Best Model]
  BEST --> SAVE[(trained_models/interview_predictor.pkl)]
```

### 5) Speech Analysis (`speech_analyzer.py`)
```mermaid
flowchart TD
  TXT[Transcript Text + optional duration] --> Clean[Normalize Text]
  Clean --> Metrics[Basic Metrics\nword/sentence counts]
  Clean --> Filler[Filler Word Analysis]
  Clean --> Repeat[Repetition Analysis]
  Metrics & Filler & Repeat --> Score[Quality Score]
  Score --> Reco[Recommendations]
  Reco --> Out[Analysis JSON]
```

### Key File Locations
- Training artifacts: `ml_models/trained_models/`
  - `data_preprocessor.pkl`
  - `interview_predictor.pkl`
  - `question_recommender.pkl`
  - `speech_analyzer.pkl`
- Runtime generator: `ml_models/generate_questions.py`
- Orchestrated training: `ml_models/train_simple_pipeline.py`

### Notes
- Role-aware category mapping prioritizes domain (e.g., ML Engineer + Python → Machine Learning).
- Difficulty mapping: Junior→Easy, Senior/Lead→Hard, else Medium.
- If the primary bucket has too few questions, related-category fallbacks are used before random sampling.


