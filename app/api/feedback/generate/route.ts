import { exec } from "child_process";
import { promisify } from "util";
import { db } from "@/firebase/admin";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { interviewId, userId, transcript, interviewData } = await request.json();

    console.log('🚀 Starting ML-powered feedback generation...');
    console.log('📊 Interview ID:', interviewId);
    console.log('👤 User ID:', userId);
    console.log('📝 Transcript length:', transcript?.length || 0);

    // Prepare transcript text for ML analysis
    const transcriptText = transcript
      ?.map((msg: any) => msg.content)
      .join(' ')
      .trim() || '';

    if (!transcriptText) {
      return Response.json({ 
        success: false, 
        error: "No transcript content to analyze" 
      }, { status: 400 });
    }

    // Call ML models for comprehensive analysis
    const [speechAnalysis, interviewPrediction] = await Promise.all([
      analyzeSpeechWithML(transcriptText),
      predictInterviewSuccess(transcriptText, interviewData)
    ]);

    // Generate comprehensive feedback
    const feedback = await generateComprehensiveFeedback({
      transcriptText,
      speechAnalysis,
      interviewPrediction,
      interviewData,
      interviewId,
      userId
    });

    // Save feedback to Firebase
    const feedbackRef = await db.collection("feedback").add(feedback);
    console.log('✅ Feedback saved with ID:', feedbackRef.id);

    return Response.json({ 
      success: true, 
      feedbackId: feedbackRef.id,
      feedback: feedback
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error in feedback generation:", error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

async function analyzeSpeechWithML(transcriptText: string) {
  try {
    console.log('🎤 Analyzing speech patterns...');
    
    const { stdout, stderr } = await execAsync(
      `ml_models/venv_mac/bin/python ml_models/analyze_speech.py "${transcriptText.replace(/"/g, '\\"')}"`,
      {
        cwd: process.cwd(),
        timeout: 30000
      }
    );

    if (stderr) {
      console.error('Speech analysis stderr:', stderr);
    }

    const analysis = JSON.parse(stdout);
    console.log('✅ Speech analysis completed');
    
    return analysis.success ? analysis.analysis : null;
  } catch (error) {
    console.error('❌ Speech analysis error:', error);
    return null;
  }
}

async function predictInterviewSuccess(transcriptText: string, interviewData: any) {
  try {
    console.log('🔮 Predicting interview success...');
    
    // Prepare data for prediction
    const predictionData = {
      transcript: transcriptText,
      role: interviewData?.role || 'Software Engineer',
      level: interviewData?.level || 'Mid',
      techstack: interviewData?.techstack || ['JavaScript'],
      duration: 30 // Approximate duration in minutes
    };

    const { stdout, stderr } = await execAsync(
      `ml_models/venv_mac/bin/python ml_models/interview_predictor.py "${JSON.stringify(predictionData).replace(/"/g, '\\"')}"`,
      {
        cwd: process.cwd(),
        timeout: 30000
      }
    );

    if (stderr) {
      console.error('Interview prediction stderr:', stderr);
    }

    const prediction = JSON.parse(stdout);
    console.log('✅ Interview prediction completed');
    
    return prediction.success ? prediction.prediction : null;
  } catch (error) {
    console.error('❌ Interview prediction error:', error);
    return null;
  }
}

async function generateComprehensiveFeedback({
  transcriptText,
  speechAnalysis,
  interviewPrediction,
  interviewData,
  interviewId,
  userId
}: {
  transcriptText: string;
  speechAnalysis: any;
  interviewPrediction: any;
  interviewData: any;
  interviewId: string;
  userId: string;
}) {
  // Calculate overall score based on ML analysis
  const speechScore = speechAnalysis?.quality_score || 50;
  const predictionScore = interviewPrediction?.success_probability ? 
    interviewPrediction.success_probability * 100 : 50;
  
  const overallScore = Math.round((speechScore + predictionScore) / 2);

  // Generate category scores
  const categoryScores = generateCategoryScores(speechAnalysis, interviewPrediction, transcriptText);
  
  // Generate strengths and areas for improvement
  const { strengths, areasForImprovement } = generateInsights(
    speechAnalysis, 
    interviewPrediction, 
    transcriptText
  );

  // Generate final assessment
  const finalAssessment = generateFinalAssessment(
    overallScore, 
    speechAnalysis, 
    interviewPrediction,
    interviewData
  );

  return {
    interviewId,
    userId,
    totalScore: overallScore,
    categoryScores,
    strengths,
    areasForImprovement,
    finalAssessment,
    mlAnalysis: {
      speechAnalysis,
      interviewPrediction,
      transcriptLength: transcriptText.length,
      wordCount: transcriptText.split(' ').length
    },
    createdAt: new Date().toISOString(),
  };
}

function generateCategoryScores(speechAnalysis: any, interviewPrediction: any, transcriptText: string) {
  const baseScore = 50;
  
  return [
    {
      name: "Communication Skills",
      score: Math.round(speechAnalysis?.quality_score || baseScore),
      comment: generateCommunicationComment(speechAnalysis)
    },
    {
      name: "Technical Knowledge",
      score: Math.round(interviewPrediction?.technical_score || baseScore),
      comment: generateTechnicalComment(transcriptText, interviewPrediction)
    },
    {
      name: "Problem-Solving",
      score: Math.round(interviewPrediction?.problem_solving_score || baseScore),
      comment: generateProblemSolvingComment(transcriptText)
    },
    {
      name: "Confidence & Clarity",
      score: Math.round(speechAnalysis?.confidence_score || baseScore),
      comment: generateConfidenceComment(speechAnalysis)
    },
    {
      name: "Overall Performance",
      score: Math.round(interviewPrediction?.overall_score || baseScore),
      comment: generateOverallComment(interviewPrediction)
    }
  ];
}

function generateCommunicationComment(speechAnalysis: any) {
  if (!speechAnalysis) return "Unable to analyze communication patterns.";
  
  const fillerRate = speechAnalysis.filler_word_analysis?.filler_rate || 0;
  const qualityScore = speechAnalysis.quality_score || 0;
  
  if (qualityScore >= 80) {
    return "Excellent communication with clear, confident delivery.";
  } else if (qualityScore >= 60) {
    return "Good communication skills with room for improvement in clarity.";
  } else {
    return "Communication could be improved with better structure and clarity.";
  }
}

function generateTechnicalComment(transcriptText: string, interviewPrediction: any) {
  const technicalKeywords = ['algorithm', 'data structure', 'optimization', 'scalability', 'architecture', 'design pattern'];
  const keywordCount = technicalKeywords.filter(keyword => 
    transcriptText.toLowerCase().includes(keyword)
  ).length;
  
  if (keywordCount >= 4) {
    return "Strong technical knowledge demonstrated with relevant terminology.";
  } else if (keywordCount >= 2) {
    return "Good technical understanding with some relevant concepts mentioned.";
  } else {
    return "Consider using more technical terminology to demonstrate expertise.";
  }
}

function generateProblemSolvingComment(transcriptText: string) {
  const problemSolvingKeywords = ['approach', 'solution', 'step', 'process', 'method', 'strategy'];
  const keywordCount = problemSolvingKeywords.filter(keyword => 
    transcriptText.toLowerCase().includes(keyword)
  ).length;
  
  if (keywordCount >= 3) {
    return "Good problem-solving approach with structured thinking.";
  } else {
    return "Consider explaining your problem-solving process more clearly.";
  }
}

function generateConfidenceComment(speechAnalysis: any) {
  if (!speechAnalysis) return "Unable to assess confidence level.";
  
  const fillerRate = speechAnalysis.filler_word_analysis?.filler_rate || 0;
  const repetitionRate = speechAnalysis.repetition_analysis?.repetition_rate || 0;
  
  if (fillerRate < 0.1 && repetitionRate < 0.05) {
    return "Very confident and clear delivery with minimal hesitation.";
  } else if (fillerRate < 0.2 && repetitionRate < 0.1) {
    return "Generally confident with some areas for improvement.";
  } else {
    return "Work on reducing filler words and repetition to boost confidence.";
  }
}

function generateOverallComment(interviewPrediction: any) {
  if (!interviewPrediction) return "Overall performance shows potential for improvement.";
  
  const successProb = interviewPrediction.success_probability || 0;
  
  if (successProb >= 0.8) {
    return "Excellent interview performance with high success probability.";
  } else if (successProb >= 0.6) {
    return "Good interview performance with solid potential for success.";
  } else {
    return "Interview performance shows areas for improvement to increase success chances.";
  }
}

function generateInsights(speechAnalysis: any, interviewPrediction: any, transcriptText: string) {
  const strengths = [];
  const areasForImprovement = [];

  // Analyze speech patterns
  if (speechAnalysis) {
    const fillerRate = speechAnalysis.filler_word_analysis?.filler_rate || 0;
    const qualityScore = speechAnalysis.quality_score || 0;
    
    if (qualityScore >= 70) {
      strengths.push("Clear and articulate speech delivery");
    }
    
    if (fillerRate < 0.15) {
      strengths.push("Minimal use of filler words");
    } else {
      areasForImprovement.push("Reduce filler words like 'um', 'uh', 'like'");
    }
  }

  // Analyze content
  const technicalKeywords = ['algorithm', 'data structure', 'optimization', 'scalability'];
  const technicalCount = technicalKeywords.filter(keyword => 
    transcriptText.toLowerCase().includes(keyword)
  ).length;
  
  if (technicalCount >= 2) {
    strengths.push("Demonstrated technical knowledge");
  } else {
    areasForImprovement.push("Include more technical details and examples");
  }

  // Analyze structure
  const structureKeywords = ['first', 'then', 'next', 'finally', 'however', 'therefore'];
  const structureCount = structureKeywords.filter(keyword => 
    transcriptText.toLowerCase().includes(keyword)
  ).length;
  
  if (structureCount >= 2) {
    strengths.push("Well-structured responses");
  } else {
    areasForImprovement.push("Structure responses with clear beginning, middle, and end");
  }

  // Default insights if none generated
  if (strengths.length === 0) {
    strengths.push("Showed engagement with the questions");
  }
  
  if (areasForImprovement.length === 0) {
    areasForImprovement.push("Continue practicing to improve interview skills");
  }

  return { strengths, areasForImprovement };
}

function generateFinalAssessment(overallScore: number, speechAnalysis: any, interviewPrediction: any, interviewData: any) {
  const role = interviewData?.role || 'Software Engineer';
  
  if (overallScore >= 85) {
    return `Outstanding performance for the ${role} position! Your responses demonstrated strong technical knowledge, clear communication, and excellent problem-solving skills. You're well-prepared for similar interviews.`;
  } else if (overallScore >= 70) {
    return `Good performance for the ${role} position. You showed solid understanding and communication skills. With some targeted practice in the identified areas, you'll be even stronger in future interviews.`;
  } else if (overallScore >= 55) {
    return `Decent performance for the ${role} position with room for improvement. Focus on the specific areas mentioned to enhance your interview skills and increase your chances of success.`;
  } else {
    return `This interview highlighted several areas for improvement. Consider practicing more with mock interviews and focusing on the specific feedback provided to strengthen your interview performance.`;
  }
}
