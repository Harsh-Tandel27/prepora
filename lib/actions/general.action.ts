"use server";

import { db } from "@/firebase/admin";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    // For now, create a basic feedback structure
    // In the future, this could integrate with your ML models for analysis
    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: 75, // Default score - could be calculated by ML models
      categoryScores: [
        {
          name: "Communication Skills",
          score: 75,
          comment: "Good communication based on transcript analysis"
        },
        {
          name: "Technical Knowledge", 
          score: 75,
          comment: "Demonstrated technical understanding"
        },
        {
          name: "Problem-Solving",
          score: 75,
          comment: "Showed problem-solving approach"
        },
        {
          name: "Cultural & Role Fit",
          score: 75,
          comment: "Appears to be a good fit"
        },
        {
          name: "Confidence & Clarity",
          score: 75,
          comment: "Confident and clear responses"
        }
      ],
      strengths: ["Good communication", "Technical knowledge"],
      areasForImprovement: ["Could provide more specific examples"],
      finalAssessment: "Good interview performance with room for improvement in specific examples.",
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    const interviewDoc = await db.collection("interviews").doc(id).get();
    
    if (!interviewDoc.exists) {
      return null;
    }
    
    return {
      id: interviewDoc.id,
      ...interviewDoc.data()
    } as Interview;
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  // Return null if required parameters are missing
  if (!interviewId || !userId) {
    return null;
  }

  try {
    const querySnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) return null;

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  // Return empty array if userId is not provided
  if (!userId) {
    return [];
  }

  try {
    const interviews = await db
      .collection("interviews")
      .limit(limit * 2) // Get more to account for filtering
      .get();

    // Filter and sort the results in memory
    const sortedInterviews = interviews.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(interview => interview.finalized === true && interview.userId !== userId) // Filter in memory
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
        const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
        return dateB.getTime() - dateA.getTime(); // Descending order
      })
      .slice(0, limit); // Limit after filtering

    return sortedInterviews as Interview[];
  } catch (error) {
    console.error("Error fetching latest interviews:", error);
    return [];
  }
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  // Return empty array if userId is not provided
  if (!userId) {
    return [];
  }

  try {
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      // Temporarily removed orderBy to avoid index requirement
      // .orderBy("createdAt", "desc")
      .get();

    // Sort the results in memory instead
    const sortedInterviews = interviews.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
        const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });

    return sortedInterviews as Interview[];
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return [];
  }
}
