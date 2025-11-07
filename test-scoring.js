#!/usr/bin/env node
/**
 * Test script for scoring system
 * Tests overall score calculation and category scores with different scenarios
 */

// Simulate the scoring functions from the API
function calculateOverallScore(speechQuality, predOverall, predSuccessProb) {
  // Cap all scores at 95
  const speech = typeof speechQuality === 'number'
    ? Math.max(0, Math.min(95, speechQuality))
    : undefined;
  const pred = typeof predOverall === 'number'
    ? Math.max(0, Math.min(95, predOverall))
    : undefined;
  const prob = typeof predSuccessProb === 'number'
    ? Math.max(0, Math.min(95, predSuccessProb * 100))
    : undefined;

  // Prefer model overall; otherwise use success prob; combine with speech via weights
  let combinedModelScore = pred ?? prob;
  let overallScore;
  
  if (combinedModelScore != null && speech != null) {
    // If speech quality is excellent (>75), give it more weight
    // If prediction is very low (<50) but speech is good (>65), favor speech more
    if (speech > 75 && combinedModelScore < 50) {
      // Excellent speech but low prediction - favor speech (65% speech, 35% prediction)
      overallScore = Math.round(0.65 * speech + 0.35 * combinedModelScore);
    } else if (speech > 65 && combinedModelScore < 45) {
      // Good speech but low prediction - favor speech (60% speech, 40% prediction)
      overallScore = Math.round(0.6 * speech + 0.4 * combinedModelScore);
    } else if (speech > 80) {
      // Excellent speech - give it more weight even if prediction is decent
      overallScore = Math.round(0.55 * speech + 0.45 * combinedModelScore);
    } else {
      // Balanced weighting (50% each)
      overallScore = Math.round(0.5 * combinedModelScore + 0.5 * speech);
    }
    // Cap overall score at 95
    overallScore = Math.min(95, overallScore);
  } else if (combinedModelScore != null) {
    overallScore = Math.round(combinedModelScore);
    overallScore = Math.min(95, overallScore);
  } else if (speech != null) {
    overallScore = Math.round(speech);
    overallScore = Math.min(95, overallScore);
  } else {
    overallScore = 50;
  }
  
  return overallScore;
}

function calculateCategoryScores(speechAnalysis) {
  const baseScore = 50;
  const qualityScore = speechAnalysis?.quality_score || baseScore;
  const confidenceScore = speechAnalysis?.confidence_score || baseScore;
  const vocabDiversity = speechAnalysis?.vocabulary_analysis?.diversity || 0.5;
  const structureScore = speechAnalysis?.structure_analysis?.variety_score || 50;
  const clarityRaw = ((vocabDiversity * 100 + structureScore) / 2);
  
  // Communication Skills - less harsh scaling for good scores
  const commScore = qualityScore > 70 
    ? Math.min(95, Math.round(qualityScore * 0.95)) // Only 5% reduction for good scores
    : Math.min(95, Math.round(qualityScore * 0.9)); // 10% reduction for lower scores
  
  // Clarity & Fluency - less harsh scaling
  const clarityScore = clarityRaw > 70
    ? Math.min(95, Math.round(clarityRaw * 0.92)) // Only 8% reduction for good clarity
    : Math.min(95, Math.round(clarityRaw * 0.85)); // 15% reduction for lower clarity
  
  // Confidence & Delivery - less harsh scaling
  const confScore = confidenceScore > 70
    ? Math.min(95, Math.round(confidenceScore * 0.95)) // Only 5% reduction for good confidence
    : Math.min(95, Math.round(confidenceScore * 0.9)); // 10% reduction for lower confidence
  
  // Speech Quality - less harsh scaling
  const speechScore = qualityScore > 70
    ? Math.min(95, Math.round(qualityScore * 0.95)) // Only 5% reduction for good quality
    : Math.min(95, Math.round(qualityScore * 0.9)); // 10% reduction for lower quality
  
  return {
    communication: commScore,
    clarity: clarityScore,
    confidence: confScore,
    speechQuality: speechScore
  };
}

// Test scenarios
const testScenarios = [
  {
    name: "🏆 Best Speech + Best Candidate",
    description: "Excellent speech quality with best candidate profile",
    speechAnalysis: {
      quality_score: 85,
      confidence_score: 88,
      vocabulary_analysis: { diversity: 0.90 },
      structure_analysis: { variety_score: 90 }
    },
    interviewPrediction: {
      overall_score: 85,
      success_probability: 0.85
    },
    expectedRange: { min: 75, max: 95 }
  },
  {
    name: "⭐ Excellent Speech + Strong Candidate",
    description: "Very good speech with strong candidate profile",
    speechAnalysis: {
      quality_score: 80,
      confidence_score: 82,
      vocabulary_analysis: { diversity: 0.85 },
      structure_analysis: { variety_score: 85 }
    },
    interviewPrediction: {
      overall_score: 75,
      success_probability: 0.75
    },
    expectedRange: { min: 70, max: 90 }
  },
  {
    name: "✅ Good Speech + Solid Candidate",
    description: "Good speech with solid candidate profile",
    speechAnalysis: {
      quality_score: 75,
      confidence_score: 78,
      vocabulary_analysis: { diversity: 0.75 },
      structure_analysis: { variety_score: 75 }
    },
    interviewPrediction: {
      overall_score: 70,
      success_probability: 0.70
    },
    expectedRange: { min: 65, max: 85 }
  },
  {
    name: "⚠️ Your Current Case - Best Speech + Low Prediction",
    description: "Excellent speech but low prediction score (the issue you reported)",
    speechAnalysis: {
      quality_score: 67.35,
      confidence_score: 71,
      vocabulary_analysis: { diversity: 0.879 },
      structure_analysis: { variety_score: 75 }
    },
    interviewPrediction: {
      overall_score: 34.85,
      success_probability: 0.367
    },
    expectedRange: { min: 55, max: 75 } // Should be higher with adjusted scoring
  },
  {
    name: "👍 Average Speech + Average Candidate",
    description: "Average speech with average candidate profile",
    speechAnalysis: {
      quality_score: 60,
      confidence_score: 65,
      vocabulary_analysis: { diversity: 0.60 },
      structure_analysis: { variety_score: 60 }
    },
    interviewPrediction: {
      overall_score: 55,
      success_probability: 0.55
    },
    expectedRange: { min: 50, max: 70 }
  },
  {
    name: "❌ Poor Speech + Weak Candidate",
    description: "Poor speech with weak candidate profile",
    speechAnalysis: {
      quality_score: 45,
      confidence_score: 50,
      vocabulary_analysis: { diversity: 0.45 },
      structure_analysis: { variety_score: 45 }
    },
    interviewPrediction: {
      overall_score: 40,
      success_probability: 0.40
    },
    expectedRange: { min: 35, max: 55 }
  }
];

// Run tests
console.log("🧪 Testing Scoring System\n");
console.log("=" .repeat(80));

let passedTests = 0;
let failedTests = 0;

testScenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}`);
  console.log(`   ${scenario.description}`);
  console.log(`   Expected Range: ${scenario.expectedRange.min}-${scenario.expectedRange.max}`);
  
  // Calculate overall score
  const overallScore = calculateOverallScore(
    scenario.speechAnalysis.quality_score,
    scenario.interviewPrediction.overall_score,
    scenario.interviewPrediction.success_probability
  );
  
  // Calculate category scores
  const categoryScores = calculateCategoryScores(scenario.speechAnalysis);
  
  // Display results
  console.log(`\n   📊 Results:`);
  console.log(`   - Overall Score: ${overallScore}/100`);
  console.log(`   - Communication: ${categoryScores.communication}/100`);
  console.log(`   - Clarity & Fluency: ${categoryScores.clarity}/100`);
  console.log(`   - Confidence & Delivery: ${categoryScores.confidence}/100`);
  console.log(`   - Speech Quality: ${categoryScores.speechQuality}/100`);
  
  // Check if score is in expected range
  const inRange = overallScore >= scenario.expectedRange.min && 
                  overallScore <= scenario.expectedRange.max;
  
  if (inRange) {
    console.log(`   ✅ PASS: Overall score (${overallScore}) is in expected range`);
    passedTests++;
  } else {
    console.log(`   ❌ FAIL: Overall score (${overallScore}) is outside expected range`);
    console.log(`      Expected: ${scenario.expectedRange.min}-${scenario.expectedRange.max}`);
    failedTests++;
  }
  
  // Show calculation breakdown
  console.log(`\n   🔍 Calculation Breakdown:`);
  console.log(`   - Speech Quality: ${scenario.speechAnalysis.quality_score}`);
  console.log(`   - Prediction Score: ${scenario.interviewPrediction.overall_score}`);
  console.log(`   - Success Probability: ${(scenario.interviewPrediction.success_probability * 100).toFixed(1)}%`);
  
  const speech = scenario.speechAnalysis.quality_score;
  const pred = scenario.interviewPrediction.overall_score;
  if (speech > 75 && pred < 50) {
    console.log(`   - Weighting: 65% speech + 35% prediction (excellent speech, low prediction)`);
  } else if (speech > 65 && pred < 45) {
    console.log(`   - Weighting: 60% speech + 40% prediction (good speech, low prediction)`);
  } else if (speech > 80) {
    console.log(`   - Weighting: 55% speech + 45% prediction (excellent speech)`);
  } else {
    console.log(`   - Weighting: 50% speech + 50% prediction (balanced)`);
  }
});

// Summary
console.log("\n" + "=".repeat(80));
console.log("\n📈 Test Summary:");
console.log(`   ✅ Passed: ${passedTests}/${testScenarios.length}`);
console.log(`   ❌ Failed: ${failedTests}/${testScenarios.length}`);
console.log(`   📊 Success Rate: ${((passedTests / testScenarios.length) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log("\n🎉 All tests passed!");
} else {
  console.log("\n⚠️  Some tests failed. Review the scoring logic.");
}

// Test the specific case from the user
console.log("\n" + "=".repeat(80));
console.log("\n🔍 Detailed Analysis of Your Reported Case:");
console.log("   Speech Quality: 67.35");
console.log("   Prediction Score: 34.85");
console.log("   Success Probability: 36.7%");
console.log("   Reported Overall Score: 48/100");

const userCaseScore = calculateOverallScore(67.35, 34.85, 0.367);
console.log(`   Calculated Overall Score: ${userCaseScore}/100`);

if (userCaseScore > 48) {
  console.log(`   ✅ IMPROVED: Score increased from 48 to ${userCaseScore} (+${userCaseScore - 48})`);
} else {
  console.log(`   ⚠️  Score is still ${userCaseScore} (same or lower than 48)`);
}

const userCategoryScores = calculateCategoryScores({
  quality_score: 67.35,
  confidence_score: 71,
  vocabulary_analysis: { diversity: 0.879 },
  structure_analysis: { variety_score: 75 }
});

console.log(`\n   Category Scores:`);
console.log(`   - Communication: ${userCategoryScores.communication}/100 (was 61)`);
console.log(`   - Clarity & Fluency: ${userCategoryScores.clarity}/100 (was 59)`);
console.log(`   - Confidence & Delivery: ${userCategoryScores.confidence}/100 (was 64)`);
console.log(`   - Speech Quality: ${userCategoryScores.speechQuality}/100 (was 61)`);

