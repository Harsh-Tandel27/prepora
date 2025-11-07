import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { transcript, analysis, feedbackId } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Interview ID is required" },
        { status: 400 }
      );
    }

    // Update the interview document with analysis results
    const interviewRef = db.collection("interviews").doc(id);
    
    const updateData: any = {
      transcript: transcript || null,
      analysis: analysis || null,
      updatedAt: new Date().toISOString(),
    };

    if (feedbackId) {
      updateData.feedbackId = feedbackId;
    }

    await interviewRef.update(updateData);

    console.log('✅ Interview updated with analysis results:', id);

    return NextResponse.json(
      { 
        success: true, 
        message: "Interview updated successfully",
        interviewId: id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating interview:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
