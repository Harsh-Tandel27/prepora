# Prepora - AI-Powered Interview Preparation Platform

<div align="center">
  <h1>🎯 Prepora</h1>
  <p><strong>Master your job interviews with AI-powered voice interviews and real-time feedback</strong></p>
  
  <div>
    <img src="https://img.shields.io/badge/-Next.js-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=black" alt="Next.js" />
    <img src="https://img.shields.io/badge/-Firebase-black?style=for-the-badge&logoColor=white&logo=firebase&color=DD2C00" alt="Firebase" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/-Python-black?style=for-the-badge&logoColor=white&logo=python&color=3776AB" alt="Python" />
    <img src="https://img.shields.io/badge/-ElevenLabs-black?style=for-the-badge&logoColor=white&logo=elevenlabs&color=000000" alt="ElevenLabs" />
  </div>
</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Overview

Prepora is an intelligent interview preparation platform that combines machine learning models with advanced voice technology to provide realistic, AI-driven mock interviews. Users can practice with custom-generated questions based on their target role, experience level, and tech stack, receiving instant feedback and detailed analysis of their performance.

## ✨ Features

### 🎤 **Voice Interview Experience**
- **AI Voice Interviewer**: Conduct interviews with ElevenLabs-powered natural-sounding AI voices
- **Real-time Speech Recognition**: Web Speech API integration for seamless voice interaction
- **Voice Tone Selection**: Choose from multiple AI voice personalities and tones
- **Smart Conversation Flow**: AI automatically progresses through questions while maintaining natural dialogue

### 🤖 **ML-Powered Intelligence**
- **Dynamic Question Generation**: Python ML models generate role-specific interview questions
- **Speech Analysis**: Real-time analysis of speech patterns, filler words, and response quality
- **Personalized Feedback**: AI-generated comprehensive feedback with scoring across multiple categories
- **Adaptive Questioning**: Questions tailored to job role, experience level, and tech stack

### 🎯 **Interview Management**
- **Custom Interview Creation**: Multi-step form to configure interview parameters
- **Progress Tracking**: Monitor interview completion and performance metrics
- **Historical Data**: Access to past interviews and feedback for continuous improvement
- **Responsive Dashboard**: Modern UI for managing interviews and viewing results

### 🔐 **User Experience**
- **Authentication System**: Firebase Auth integration for secure user management
- **Responsive Design**: Mobile-first design that works across all devices
- **Modern UI/UX**: Clean, intuitive interface built with Tailwind CSS and shadcn/ui
- **Real-time Updates**: Live feedback and progress indicators throughout the interview

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15**: React framework with App Router and server components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library

### **Backend & AI**
- **Python ML Models**: Custom-trained models for question generation and speech analysis
- **ElevenLabs API**: High-quality text-to-speech synthesis
- **Web Speech API**: Browser-native speech recognition
- **Next.js API Routes**: Serverless backend functions

### **Database & Auth**
- **Firebase Firestore**: NoSQL database for interview data
- **Firebase Auth**: User authentication and management
- **Firebase Admin SDK**: Server-side Firebase operations

### **Development Tools**
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing
- **Git**: Version control

## 🏗️ Architecture

```
Prepora/
├── app/                    # Next.js App Router
│   ├── (auth)/           # Authentication routes
│   ├── (root)/           # Protected routes
│   ├── api/              # API endpoints
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── VoiceInterview.tsx # Core interview component
│   └── InterviewForm.tsx # Interview creation form
├── lib/                   # Utility functions and actions
├── ml_models/            # Python ML scripts
├── firebase/             # Firebase configuration
└── types/                # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 8+
- **Python** 3.8+ with pip
- **Git** for version control
- **Firebase** project account
- **ElevenLabs** API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd prepora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Python environment**
   ```bash
   cd ml_models
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

4. **Environment configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Setup

Create a `.env.local` file in the root directory:

```env
# ElevenLabs Configuration
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Configuration (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_PRIVATE_KEY_ID=your_private_key_id
```

### Getting API Keys

1. **Firebase**: Create a project at [Firebase Console](https://console.firebase.google.com/)
2. **ElevenLabs**: Sign up at [ElevenLabs](https://elevenlabs.io/) for TTS API access

## 📱 Usage

### Creating an Interview

1. **Navigate** to the interview creation page
2. **Select** job role, experience level, and tech stack
3. **Choose** interview type (technical, behavioral, or mixed)
4. **Set** number of questions (5-20)
5. **Submit** to generate custom questions

### Conducting an Interview

1. **Start** the voice interview
2. **Listen** to AI-generated questions
3. **Answer** using your voice (speech recognition active)
4. **Submit** answers manually when ready
5. **Receive** real-time feedback and scoring

### Reviewing Results

1. **View** comprehensive feedback breakdown
2. **Analyze** scores across multiple categories
3. **Identify** strengths and areas for improvement
4. **Track** progress over multiple interviews

## 📁 Project Structure

```
prepora/
├── app/                           # Next.js application
│   ├── (auth)/                   # Authentication pages
│   │   ├── sign-in/page.tsx      # Sign in form
│   │   └── sign-up/page.tsx      # Sign up form
│   ├── (root)/                   # Protected pages
│   │   ├── interview/            # Interview management
│   │   │   ├── page.tsx          # Interview creation
│   │   │   └── [id]/             # Specific interview
│   │   │       ├── page.tsx      # Interview interface
│   │   │       └── feedback/     # Results and feedback
│   │   └── page.tsx              # Dashboard
│   ├── api/                      # API endpoints
│   │   ├── interview/            # Interview APIs
│   │   └── tts/                  # Text-to-speech API
│   └── layout.tsx                # Root layout
├── components/                    # React components
│   ├── ui/                       # UI components (shadcn/ui)
│   ├── VoiceInterview.tsx        # Voice interview interface
│   ├── InterviewForm.tsx         # Interview creation form
│   └── InterviewWrapper.tsx      # Interview wrapper component
├── lib/                          # Utility libraries
│   ├── actions/                  # Server actions
│   │   ├── auth.action.ts        # Authentication actions
│   │   └── general.action.ts     # General database actions
│   ├── utils.ts                  # Utility functions
│   └── vapi.sdk.ts               # Vapi SDK (legacy)
├── ml_models/                    # Python ML scripts
│   ├── interview_predictor.py    # Interview scoring model
│   ├── question_recommender.py   # Question generation model
│   ├── speech_analyzer.py        # Speech analysis model
│   ├── data_preprocessor.py      # Data preprocessing utilities
│   └── requirements.txt          # Python dependencies
├── firebase/                     # Firebase configuration
│   ├── admin.ts                  # Admin SDK setup
│   └── client.ts                 # Client SDK setup
├── types/                        # TypeScript definitions
│   └── index.d.ts                # Global type definitions
├── constants/                     # Application constants
│   └── index.ts                  # Constants and configurations
└── public/                       # Static assets
    ├── covers/                   # Interview cover images
    ├── ai-avatar.png             # AI interviewer avatar
    └── logo.svg                  # Application logo
```

## 🤝 Contributing

We welcome contributions to Prepora! Here's how you can help:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Test your changes before submitting

### Areas for Contribution

- **ML Model Improvements**: Enhance question generation and speech analysis
- **UI/UX Enhancements**: Improve user interface and experience
- **Performance Optimization**: Optimize API calls and rendering
- **Testing**: Add unit and integration tests
- **Documentation**: Improve code documentation and guides

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ElevenLabs** for high-quality text-to-speech technology
- **Firebase** for robust backend infrastructure
- **Next.js** team for the excellent React framework
- **Tailwind CSS** for the utility-first CSS framework
- **shadcn/ui** for beautiful, accessible components

## 📞 Support

If you encounter any issues or have questions:

1. **Check** the existing issues in the repository
2. **Create** a new issue with detailed information
3. **Join** our community discussions
4. **Review** the documentation and troubleshooting guides

---

<div align="center">
  <p><strong>Built with ❤️ for better interview preparation</strong></p>
  <p>Star this repository if it helped you!</p>
</div> 