import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
import { calculateProfileCompletion } from "@/lib/utils/profile";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user document from Firebase
    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const profile = userData?.profile || {};
    
    // Calculate completion
    const completion = calculateProfileCompletion(profile);

    return NextResponse.json(
      {
        success: true,
        profile,
        completion
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error checking profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

