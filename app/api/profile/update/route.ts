import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
import { mergeProfileWithCompletion, type UserProfile } from "@/lib/utils/profile";

export async function POST(request: NextRequest) {
  try {
    const { userId, profile } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile data is required" },
        { status: 400 }
      );
    }

    // Merge profile with completion calculation
    const mergedProfile = mergeProfileWithCompletion(profile);

    // Update user document in Firebase
    const userRef = db.collection("users").doc(userId);
    
    // Get existing user data
    const userDoc = await userRef.get();
    const existingData = userDoc.exists ? userDoc.data() : {};

    // Update profile field
    await userRef.update({
      ...existingData,
      profile: mergedProfile,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Profile updated for user:', userId);
    console.log('📊 Profile completion:', mergedProfile.profileCompleted, `${mergedProfile.profileCompletionPercentage}%`);

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        profile: mergedProfile
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

