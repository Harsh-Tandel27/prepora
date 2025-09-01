import { db } from "@/firebase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch interview from Firebase
    const interviewDoc = await db.collection("interviews").doc(id).get();
    
    if (!interviewDoc.exists) {
      return Response.json({ error: "Interview not found" }, { status: 404 });
    }
    
    const interviewData = interviewDoc.data();
    
    return Response.json({
      id: interviewDoc.id,
      ...interviewData
    });
    
  } catch (error) {
    console.error("Error fetching interview:", error);
    return Response.json(
      { error: "Failed to fetch interview" },
      { status: 500 }
    );
  }
}
