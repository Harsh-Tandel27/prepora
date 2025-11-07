import { exec } from "child_process";
import { promisify } from "util";
import { db, auth } from "@/firebase/admin";
import { calculateProfileCompletion } from "@/lib/utils/profile";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { interviewId, userId, transcript, interviewData } = await request.json();

    console.log('🚀 Starting ML-powered feedback generation...');
    console.log('📊 Interview ID:', interviewId);
    console.log('👤 User ID:', userId);
    console.log('📝 Transcript length:', transcript?.length || 0);

    // Validate required fields
    if (!userId) {
      return Response.json({ 
        success: false, 
        error: "User ID is required" 
      }, { status: 400 });
    }

    if (!interviewId) {
      return Response.json({ 
        success: false, 
        error: "Interview ID is required" 
      }, { status: 400 });
    }

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

    // Fetch user profile from Firebase
    console.log('🔍 Fetching user profile from Firebase...');
    console.log('   User ID being searched:', userId);
    console.log('   User ID type:', typeof userId);
    console.log('   User ID length:', userId?.length);
    
    // Verify user exists in Firebase Auth first
    let userExistsInAuth = false;
    try {
      await auth.getUser(userId);
      userExistsInAuth = true;
      console.log('✅ User verified in Firebase Auth');
    } catch (authError: any) {
      console.warn('⚠️ User not found in Firebase Auth:', authError?.code || authError?.message);
      // Continue anyway - might be a debug user or edge case
    }
    
    let userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('⚠️ User document not found in Firestore');
      console.log('   Searched for document ID:', userId);
      console.log('   Collection: users');
      console.log('   User exists in Auth:', userExistsInAuth);
      
      // If user exists in Auth, try to get their email and search by that
      if (userExistsInAuth) {
        try {
          const authUser = await auth.getUser(userId);
          if (authUser.email) {
            console.log('   Attempting to find user by email:', authUser.email);
            const emailQuery = await db.collection("users")
              .where("email", "==", authUser.email)
              .limit(1)
              .get();
            
            if (!emailQuery.empty) {
              const foundDoc = emailQuery.docs[0];
              console.log('   ✅ Found user document with different ID:', foundDoc.id);
              console.log('   ⚠️ Document ID mismatch - using found document');
              userDoc = foundDoc;
            } else {
              console.log('   ⚠️ Data inconsistency: User exists in Auth but not in Firestore');
            }
          }
        } catch (queryError) {
          console.log('   Could not query by email:', queryError);
        }
      }
      
      // If still not found, proceed with creating default profile
      if (!userDoc.exists) {
        // Check if this is a test/debug user ID (allow temp-user, debug-user, etc.)
        const isTestUserId = /^(temp|debug|test|demo)-/.test(userId) || userId.startsWith('temp-') || userId.startsWith('debug-');
        
        // Try to verify if this is a valid Firebase Auth UID format
        // Firebase UIDs are typically 28 characters alphanumeric
        const isValidUIDFormat = /^[a-zA-Z0-9]{20,}$/.test(userId);
        
        // Allow test users or valid UID format
        if (!isTestUserId && !isValidUIDFormat) {
          console.error('❌ Invalid user ID format:', userId);
          return Response.json({ 
            success: false, 
            error: `Invalid user ID format: ${userId}. Please ensure you are logged in.`,
          }, { status: 400 });
        }
        
        // Create user document with default profile if it doesn't exist
        // This can happen if user signed up before profile system was implemented
        // or for test/debug users
        const defaultProfile = {
          age: null,
          gender: null,
          education: null,
          maritalStatus: null,
          currentlyEmployed: null,
          experienceMonths: null,
          willingToRelocate: null,
          hasAcquaintance: null,
          profileCompleted: false,
          profileCompletionPercentage: 0
        };
        
        try {
          await db.collection("users").doc(userId).set({
            profile: defaultProfile,
            createdAt: new Date().toISOString(),
          }, { merge: true });
          
          console.log('✅ Successfully created user document with default profile');
          if (isTestUserId) {
            console.log('   ℹ️ Test/debug user - profile will be incomplete');
          }
          userDoc = await db.collection("users").doc(userId).get();
        } catch (createError) {
          console.error('❌ Failed to create user document:', createError);
          return Response.json({ 
            success: false, 
            error: `User not found and could not be created. User ID: ${userId}. Please contact support.`,
          }, { status: 404 });
        }
      }
    }
    
    const userData = userDoc.data();
    const profileData = userData?.profile || {};
    
    // Debug: Log the actual profile data structure
    console.log('🔍 Debugging profile data:');
    console.log('   User document exists:', userDoc.exists);
    console.log('   User data keys:', Object.keys(userData || {}));
    console.log('   Profile data keys:', Object.keys(profileData));
    console.log('   Profile data:', JSON.stringify(profileData, null, 2));
    console.log('   Profile age:', profileData.age);
    console.log('   Profile gender:', profileData.gender);
    console.log('   Profile education:', profileData.education);
    console.log('   Profile currentlyEmployed:', profileData.currentlyEmployed);
    console.log('   Profile experienceMonths:', profileData.experienceMonths);
    console.log('   Profile willingToRelocate:', profileData.willingToRelocate);
    
    // Recalculate profile completion to ensure accuracy
    const completion = calculateProfileCompletion(profileData);
    const isProfileComplete = completion.completed;
    
    console.log('📊 Profile completion check:');
    console.log('   Stored profileCompleted:', profileData.profileCompleted);
    console.log('   Calculated completion:', isProfileComplete);
    console.log('   Completion percentage:', completion.percentage + '%');
    console.log('   Missing fields:', completion.missingFields.length > 0 ? completion.missingFields : 'none');
    
    // Check if profile is complete
    if (!isProfileComplete) {
      console.warn('⚠️ Profile incomplete, skipping prediction');
      // Still generate feedback but without prediction
      const speechAnalysis = await analyzeSpeechWithML(transcriptText);
      const feedback = await generateComprehensiveFeedback({
        transcriptText,
        speechAnalysis,
        interviewPrediction: null, // No prediction available
        interviewData,
        interviewId,
        userId
      });
      
      const feedbackRef = await db.collection("feedback").add(feedback);
      return Response.json({ 
        success: true, 
        feedbackId: feedbackRef.id,
        feedback: feedback,
        warning: "Profile incomplete - predictions not available"
      }, { status: 200 });
    }

    // Call ML models for comprehensive analysis
    const speechAnalysis = await analyzeSpeechWithML(transcriptText);
    
    // Get interview prediction (required - no fallback)
    let interviewPrediction: any = null;
    try {
      interviewPrediction = await predictInterviewSuccess(
        transcriptText, 
        profileData, 
        speechAnalysis, 
        interviewData
      );
    } catch (predictionError) {
      console.error('❌ Interview prediction failed:', predictionError);
      // Return error - prediction is required
      return Response.json({ 
        success: false, 
        error: `Interview prediction failed: ${predictionError instanceof Error ? predictionError.message : String(predictionError)}. Please ensure your profile is complete and the ML model is properly configured.`
      }, { status: 500 });
    }

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
    
    // Prefer piping JSON to the Python script's stdin (matches analyze_speech.py interface)
    const payload = JSON.stringify({ text: transcriptText, duration: 30.0 })
      .replace(/"/g, '\\"');
    const { stdout, stderr } = await execAsync(
      `echo "${payload}" | ml_models/venv_mac/bin/python ml_models/analyze_speech.py`,
      {
        cwd: process.cwd(),
        timeout: 30000
      }
    );

    if (stderr) {
      console.error('Speech analysis stderr:', stderr);
    }

    // Parse JSON from Python output (tolerate prefixed logs)
    let parsed: any = null;
    const trimmed = (stdout || '').trim();
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      // Try the widest curly-brace slice first (from first '{' to last '}')
      const firstBrace = trimmed.indexOf('{');
      const lastBrace = trimmed.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const wideSlice = trimmed.slice(firstBrace, lastBrace + 1);
        try {
          parsed = JSON.parse(wideSlice);
        } catch {}
      }
      // If still not parsed, fallback to scanning all brace blocks and pick the longest parseable
      if (!parsed) {
        const candidates = trimmed.match(/\{[\s\S]*\}/g) || [];
        let best: any = null;
        let bestLen = -1;
        for (const cand of candidates) {
          try {
            const obj = JSON.parse(cand);
            if (cand.length > bestLen) {
              best = obj;
              bestLen = cand.length;
            }
          } catch {}
        }
        parsed = best;
      }
    }
    console.log('✅ Speech analysis completed');
    if (!parsed?.success || !parsed?.analysis) {
      throw new Error(`Speech analyzer returned invalid result: ${trimmed.slice(0, 200)}`);
    }
    return parsed.analysis;
  } catch (error) {
    console.error('❌ Speech analysis error:', error);
    throw error;
  }
}

async function predictInterviewSuccess(
  transcriptText: string, 
  profileData: any, 
  speechAnalysis: any, 
  interviewData: any
) {
  try {
    console.log('🔮 Predicting interview success with ML model...');
    
    // Prepare payload for Python script
    const payload = JSON.stringify({
      text: transcriptText,
      profileData: profileData,
      speechAnalysis: speechAnalysis,
      interviewData: interviewData
    }).replace(/"/g, '\\"');
    
    const { stdout, stderr } = await execAsync(
      `echo "${payload}" | ml_models/venv_mac/bin/python ml_models/interview_predictor.py`,
      {
        cwd: process.cwd(),
        timeout: 30000
      }
    );

    if (stderr) {
      console.error('Interview prediction stderr:', stderr);
    }

    // Parse JSON from Python output (same robust parsing as speech analyzer)
    let parsed: any = null;
    const trimmed = (stdout || '').trim();
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      // Try the widest curly-brace slice first
      const firstBrace = trimmed.indexOf('{');
      const lastBrace = trimmed.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const wideSlice = trimmed.slice(firstBrace, lastBrace + 1);
        try {
          parsed = JSON.parse(wideSlice);
        } catch {}
      }
      // If still not parsed, fallback to scanning all brace blocks
      if (!parsed) {
        const candidates = trimmed.match(/\{[\s\S]*\}/g) || [];
        let best: any = null;
        let bestLen = -1;
        for (const cand of candidates) {
          try {
            const obj = JSON.parse(cand);
            if (cand.length > bestLen) {
              best = obj;
              bestLen = cand.length;
            }
          } catch {}
        }
        parsed = best;
      }
    }

    console.log('✅ Interview prediction completed');
    
    if (!parsed?.success || !parsed?.prediction) {
      const errorMsg = parsed?.error || 'ML prediction failed';
      console.error('❌ ML prediction failed:', errorMsg);
      throw new Error(`Interview prediction failed: ${errorMsg}`);
    }

    // Format response to match expected structure
    const pred = parsed.prediction;
    return {
      success_probability: pred.success_probability || 0.5,
      overall_score: pred.overall_score || 50,
      predicted_success: pred.predicted_success || false,
      model_used: pred.model_used || 'unknown',
    };
  } catch (error) {
    console.error('❌ Interview prediction error:', error);
    throw error; // Re-throw instead of falling back to heuristic
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
  // Calculate overall score from available ML metrics (avoid constant 50 fallback)
  // Cap all scores at 95 - no parameter should reach 100
  const speechQuality = typeof speechAnalysis?.quality_score === 'number'
    ? Math.max(0, Math.min(95, speechAnalysis.quality_score))
    : undefined;
  const predOverall = typeof interviewPrediction?.overall_score === 'number'
    ? Math.max(0, Math.min(95, interviewPrediction.overall_score))
    : undefined;
  const predSuccessProb = typeof interviewPrediction?.success_probability === 'number'
    ? Math.max(0, Math.min(95, interviewPrediction.success_probability * 100))
    : undefined;

  // Prefer model overall; otherwise use success prob; combine with speech via weights
  // More generous scoring - give more weight to speech quality
  let combinedModelScore: number | undefined = predOverall ?? predSuccessProb;
  let overallScore: number;
  if (combinedModelScore != null && speechQuality != null) {
    // More generous weighting - favor speech quality more
    if (speechQuality > 75 && combinedModelScore < 50) {
      // Excellent speech but low prediction - favor speech (70% speech, 30% prediction)
      overallScore = Math.round(0.7 * speechQuality + 0.3 * combinedModelScore);
    } else if (speechQuality > 65 && combinedModelScore < 45) {
      // Good speech but low prediction - favor speech (65% speech, 35% prediction)
      overallScore = Math.round(0.65 * speechQuality + 0.35 * combinedModelScore);
    } else if (speechQuality > 70) {
      // Good speech - give it more weight (60% speech, 40% prediction)
      overallScore = Math.round(0.6 * speechQuality + 0.4 * combinedModelScore);
    } else {
      // Balanced weighting but favor speech slightly (55% speech, 45% prediction)
      overallScore = Math.round(0.55 * speechQuality + 0.45 * combinedModelScore);
    }
    // Cap overall score at 95
    overallScore = Math.min(95, overallScore);
  } else if (combinedModelScore != null) {
    overallScore = Math.round(combinedModelScore);
    overallScore = Math.min(95, overallScore);
  } else if (speechQuality != null) {
    overallScore = Math.round(speechQuality);
    overallScore = Math.min(95, overallScore);
  } else {
    overallScore = 50;
  }

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
  
  // Only show speech-related categories since we're only analyzing speech patterns
  // Technical Knowledge and Problem-Solving require actual content analysis, not just speech
  // All scores capped at 95 - no parameter should reach 100
  
  // Communication Skills - based on quality score, no scaling reduction
  const commScore = speechAnalysis?.quality_score || baseScore;
  const scaledCommScore = Math.min(95, Math.round(commScore));
  
  // Clarity & Fluency - based on vocabulary and structure, minimal scaling
  const vocabDiversity = speechAnalysis?.vocabulary_analysis?.diversity || speechAnalysis?.basic_metrics?.vocabulary_diversity || 0.5;
  const structureScore = speechAnalysis?.structure_analysis?.variety_score || 50;
  const clarityRaw = ((vocabDiversity * 100 + structureScore) / 2);
  // Only slight reduction for very low scores
  const scaledClarityScore = clarityRaw > 50
    ? Math.min(95, Math.round(clarityRaw))
    : Math.min(95, Math.round(clarityRaw * 0.95)); // Only 5% reduction for very low clarity
  
  // Confidence & Delivery - based on confidence score, no scaling reduction
  const confScore = speechAnalysis?.confidence_score || baseScore;
  const scaledConfScore = Math.min(95, Math.round(confScore));
  
  // Speech Quality - same as quality score, no scaling reduction
  const speechScore = speechAnalysis?.quality_score || baseScore;
  const scaledSpeechScore = Math.min(95, Math.round(speechScore));
  
  return [
    {
      name: "Communication Skills",
      score: scaledCommScore,
      comment: generateCommunicationComment(speechAnalysis)
    },
    {
      name: "Clarity & Fluency",
      score: scaledClarityScore,
      comment: generateClarityComment(speechAnalysis)
    },
    {
      name: "Confidence & Delivery",
      score: scaledConfScore,
      comment: generateConfidenceComment(speechAnalysis)
    },
    {
      name: "Speech Quality",
      score: scaledSpeechScore,
      comment: generateSpeechQualityComment(speechAnalysis)
    }
  ];
}

// Note: All heuristics removed - Python ML models are required

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

function generateClarityComment(speechAnalysis: any) {
  if (!speechAnalysis) return "Unable to analyze clarity and fluency.";
  
  const vocabDiversity = speechAnalysis.vocabulary_analysis?.diversity || speechAnalysis.basic_metrics?.vocabulary_diversity || 0;
  const structureQuality = speechAnalysis.structure_analysis?.structure_quality || 'fair';
  const varietyScore = speechAnalysis.structure_analysis?.variety_score || 50;
  
  if (vocabDiversity > 0.7 && structureQuality === 'excellent' && varietyScore > 70) {
    return "Excellent clarity and fluency with varied vocabulary and well-structured sentences.";
  } else if (vocabDiversity > 0.5 && structureQuality !== 'poor' && varietyScore > 50) {
    return "Good clarity and fluency with room for improvement in sentence variety.";
  } else {
    return "Work on improving clarity by using more varied vocabulary and better sentence structure.";
  }
}

function generateSpeechQualityComment(speechAnalysis: any) {
  if (!speechAnalysis) return "Unable to assess speech quality.";
  
  const qualityScore = speechAnalysis.quality_score || 0;
  const fillerRate = speechAnalysis.filler_word_analysis?.filler_rate || 0;
  const repetitionRate = speechAnalysis.repetition_analysis?.repetition_rate || 0;
  
  if (qualityScore >= 80 && fillerRate < 0.1 && repetitionRate < 0.05) {
    return "Excellent speech quality with minimal filler words and repetition.";
  } else if (qualityScore >= 60) {
    return "Good speech quality. Continue working on reducing filler words and repetition.";
  } else {
    return "Speech quality needs improvement. Focus on reducing filler words, pauses, and repetition.";
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

// Removed generateOverallComment - no longer used since we removed "Overall Performance" category

function generateInsights(speechAnalysis: any, interviewPrediction: any, transcriptText: string) {
  const strengths = [];
  const areasForImprovement = [];

  // Analyze speech patterns only (we're not analyzing content/technical knowledge)
  if (speechAnalysis) {
    const fillerRate = speechAnalysis.filler_word_analysis?.filler_rate || 0;
    const repetitionRate = speechAnalysis.repetition_analysis?.repetition_rate || 0;
    const pauseRate = speechAnalysis.pause_analysis?.pause_rate || 0;
    const qualityScore = speechAnalysis.quality_score || 0;
    const confidenceScore = speechAnalysis.confidence_score || 0;
    const vocabDiversity = speechAnalysis.vocabulary_analysis?.diversity || speechAnalysis.basic_metrics?.vocabulary_diversity || 0;
    const structureQuality = speechAnalysis.structure_analysis?.structure_quality || 'fair';
    
    // Strengths based on speech analysis
    if (qualityScore >= 75) {
      strengths.push("Excellent overall speech quality");
    }
    
    if (fillerRate < 0.12) {
      strengths.push("Minimal use of filler words");
    } else if (fillerRate >= 0.20) {
      areasForImprovement.push("Significantly reduce filler words like 'um', 'uh', 'like' for clearer communication");
    } else {
      areasForImprovement.push("Work on reducing filler words");
    }
    
    if (repetitionRate < 0.08) {
      strengths.push("Good vocabulary variety with minimal repetition");
    } else if (repetitionRate >= 0.15) {
      areasForImprovement.push("Avoid repeating the same words - use synonyms and vary your vocabulary");
    }
    
    if (pauseRate < 0.15) {
      strengths.push("Smooth speech flow with appropriate pacing");
    } else if (pauseRate >= 0.25) {
      areasForImprovement.push("Too many pauses detected - work on smoother transitions between thoughts");
    }
    
    if (vocabDiversity > 0.6) {
      strengths.push("Rich and varied vocabulary");
    } else if (vocabDiversity < 0.4) {
      areasForImprovement.push("Expand your vocabulary - use more specific and varied terms");
    }
    
    if (structureQuality === 'excellent') {
      strengths.push("Well-structured sentences with good variety");
    } else if (structureQuality === 'poor') {
      areasForImprovement.push("Improve sentence structure - vary sentence lengths for better clarity");
    }
    
    if (confidenceScore >= 75) {
      strengths.push("Confident and clear delivery");
    } else if (confidenceScore < 50) {
      areasForImprovement.push("Work on building confidence - reduce hesitation and practice speaking more assertively");
    }
  }

  // Default insights if none generated
  if (strengths.length === 0) {
    strengths.push("Showed engagement with the questions");
  }
  
  if (areasForImprovement.length === 0) {
    areasForImprovement.push("Continue practicing to improve speech delivery and clarity");
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
