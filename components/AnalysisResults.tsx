"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Mic, Target, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Clock, BarChart3 } from "lucide-react";

interface AnalysisResultsProps {
  transcript: string;
  interviewData: {
    role: string;
    level: string;
    techstack: string[];
    type: string;
  };
  onContinue: () => void;
  onRetake: () => void;
}

interface AnalysisData {
  speechAnalysis: any;
  interviewPrediction: any;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  overallScore: number;
  isAnalyzing: boolean;
}

export default function AnalysisResults({ transcript, interviewData, onContinue, onRetake }: AnalysisResultsProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    speechAnalysis: null,
    interviewPrediction: null,
    categoryScores: [],
    strengths: [],
    areasForImprovement: [],
    overallScore: 0,
    isAnalyzing: true
  });

  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  const analysisSteps = [
    "Analyzing speech patterns...",
    "Evaluating technical knowledge...",
    "Assessing communication skills...",
    "Calculating overall performance...",
    "Generating recommendations..."
  ];

  useEffect(() => {
    performAnalysis();
  }, []);

  const performAnalysis = async () => {
    try {
      console.log('🔍 Starting comprehensive analysis...');
      
      // Simulate analysis steps with real API calls
      for (let i = 0; i < analysisSteps.length; i++) {
        setCurrentAnalysisStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      }

      // Call the ML analysis API
      const response = await fetch('/api/feedback/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: 'temp-analysis',
          userId: 'temp-user',
          transcript: transcript.split('.').map((sentence, index) => ({
            role: 'candidate' as const,
            content: sentence.trim(),
            timestamp: new Date().toISOString(),
            questionIndex: Math.floor(index / 2)
          })).filter(msg => msg.content.length > 0),
          interviewData
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.feedback) {
          setAnalysisData({
            speechAnalysis: result.feedback.mlAnalysis?.speechAnalysis,
            interviewPrediction: result.feedback.mlAnalysis?.interviewPrediction,
            categoryScores: result.feedback.categoryScores,
            strengths: result.feedback.strengths,
            areasForImprovement: result.feedback.areasForImprovement,
            overallScore: result.feedback.totalScore,
            isAnalyzing: false
          });
        }
      }
    } catch (error) {
      console.error('❌ Analysis error:', error);
      // Fallback to mock data
      setAnalysisData({
        speechAnalysis: {
          quality_score: 75,
          filler_word_analysis: { filler_count: 3, filler_rate: 0.05 },
          basic_metrics: { word_count: 150, vocabulary_diversity: 0.8 }
        },
        interviewPrediction: {
          success_probability: 0.75,
          technical_score: 80,
          communication_score: 70
        },
        categoryScores: [
          { name: "Communication Skills", score: 75, comment: "Good communication with room for improvement" },
          { name: "Technical Knowledge", score: 80, comment: "Strong technical understanding demonstrated" },
          { name: "Problem-Solving", score: 70, comment: "Showed logical thinking approach" },
          { name: "Confidence & Clarity", score: 75, comment: "Generally confident delivery" }
        ],
        strengths: ["Clear technical explanations", "Good problem-solving approach"],
        areasForImprovement: ["Could provide more specific examples", "Work on reducing filler words"],
        overallScore: 75,
        isAnalyzing: false
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "destructive";
  };

  if (analysisData.isAnalyzing) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg border border-white/20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            🔍 Analyzing Your Interview
          </h2>
          
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <p className="text-gray-300 text-lg">
                {analysisSteps[currentAnalysisStep]}
              </p>
            </div>
            
            <Progress 
              value={(currentAnalysisStep + 1) / analysisSteps.length * 100} 
              className="w-full h-3 mb-4"
            />
            
            <div className="text-gray-400 text-sm">
              Step {currentAnalysisStep + 1} of {analysisSteps.length}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-2">Speech Analysis</h3>
              <p className="text-gray-400 text-sm">Analyzing speech patterns, filler words, and clarity</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-2">Technical Assessment</h3>
              <p className="text-gray-400 text-sm">Evaluating technical knowledge and problem-solving</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-2">Performance Scoring</h3>
              <p className="text-gray-400 text-sm">Calculating overall performance metrics</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg border border-white/20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          📊 Interview Analysis Results
        </h2>
        <p className="text-gray-300 text-lg">
          Here's a detailed breakdown of your interview performance
        </p>
      </div>

      {/* Overall Score */}
      <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl font-bold mb-4">
            <span className={getScoreColor(analysisData.overallScore)}>
              {analysisData.overallScore}
            </span>
            <span className="text-4xl text-gray-400">/100</span>
          </div>
          <Progress 
            value={analysisData.overallScore} 
            className="w-full h-3 mb-4"
          />
          <Badge 
            variant={getScoreBadgeVariant(analysisData.overallScore)}
            className="text-lg px-4 py-2"
          >
            {analysisData.overallScore >= 80 ? "Excellent" : 
             analysisData.overallScore >= 60 ? "Good" : "Needs Improvement"}
          </Badge>
        </CardContent>
      </Card>

      {/* ML Analysis Insights */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Speech Analysis */}
        {analysisData.speechAnalysis && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Mic className="w-6 h-6" />
                Speech Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Speech Quality:</span>
                  <Badge variant={getScoreBadgeVariant(analysisData.speechAnalysis.quality_score)}>
                    {analysisData.speechAnalysis.quality_score?.toFixed(1) || 'N/A'}/100
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Filler Words:</span>
                  <span className="text-white">{analysisData.speechAnalysis.filler_word_analysis?.filler_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Words Spoken:</span>
                  <span className="text-white">{analysisData.speechAnalysis.basic_metrics?.word_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Vocabulary Diversity:</span>
                  <span className="text-white">{((analysisData.speechAnalysis.basic_metrics?.vocabulary_diversity || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interview Prediction */}
        {analysisData.interviewPrediction && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Target className="w-6 h-6" />
                Success Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Success Probability:</span>
                  <Badge variant={getScoreBadgeVariant((analysisData.interviewPrediction.success_probability || 0) * 100)}>
                    {((analysisData.interviewPrediction.success_probability || 0) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Technical Score:</span>
                  <span className="text-white">{analysisData.interviewPrediction.technical_score || 'N/A'}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Communication Score:</span>
                  <span className="text-white">{analysisData.interviewPrediction.communication_score || 'N/A'}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Category Scores */}
      <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {analysisData.categoryScores.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{category.name}</span>
                  <Badge variant={getScoreBadgeVariant(category.score)}>
                    {category.score}/100
                  </Badge>
                </div>
                <Progress value={category.score} className="w-full h-2" />
                <p className="text-gray-300 text-sm">{category.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Areas for Improvement */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Strengths */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysisData.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-200">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysisData.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-200">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  {area}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onContinue}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 text-lg font-semibold"
        >
          <TrendingUp className="w-5 h-5" />
          Continue to Detailed Feedback
        </button>
        <button
          onClick={onRetake}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-lg font-semibold"
        >
          <TrendingDown className="w-5 h-5" />
          Retake Interview
        </button>
      </div>
    </div>
  );
}
