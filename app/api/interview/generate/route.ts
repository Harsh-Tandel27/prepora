import { exec } from "child_process";
import { promisify } from "util";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  console.log('🚀 Starting interview generation with params:', { type, role, level, techstack, amount, userid });
  console.log('📁 Current working directory:', process.cwd());
  console.log('🐍 Python path:', `ml_models/venv_mac/bin/python`);

  try {
    // First, let's test if the Python executable exists
    console.log('🔍 Testing Python executable...');
    try {
      const { stdout: pythonVersion } = await execAsync(`ml_models/venv_mac/bin/python --version`);
      console.log('✅ Python version:', pythonVersion.trim());
    } catch (pythonError) {
      console.error('❌ Python executable test failed:', pythonError);
      throw new Error(`Python executable not found: ${pythonError}`);
    }

    // Call our ML model instead of Gemini
    console.log('🐍 Executing Python ML script...');
    const startTime = Date.now();
    
    const { stdout, stderr } = await execAsync(
      `ml_models/venv_mac/bin/python ml_models/generate_questions.py "${role}" "${level}" "${techstack}" "${type}" "${amount}"`,
      {
        cwd: process.cwd(),
        timeout: 30000 // 30 second timeout
      }
    );

    const executionTime = Date.now() - startTime;
    console.log(`✅ Python script executed in ${executionTime}ms`);

    if (stderr) {
      console.error('Python script stderr:', stderr);
    }

    console.log('📊 Python script output:', stdout);
    const mlData = JSON.parse(stdout);
    
    if (!mlData.success) {
      throw new Error(`ML Model Error: ${mlData.error}`);
    }

    console.log('🎯 ML data received:', mlData);

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: mlData.questions, // Use ML-generated questions!
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log('💾 Saving interview to Firebase...');
    // Save to Firebase and get the document reference
    const docRef = await db.collection("interviews").add(interview);
    console.log('✅ Interview saved with ID:', docRef.id);

    return Response.json({ 
      success: true, 
      interviewId: docRef.id, // Return the interview ID
      source: 'ML Models',
      category: mlData.category,
      difficulty: mlData.difficulty,
      questionCount: mlData.count
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in interview generation:", error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
