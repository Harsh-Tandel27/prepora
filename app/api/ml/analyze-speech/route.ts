import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { text, duration } = await request.json();

    if (!text) {
      return Response.json({ 
        success: false, 
        error: "Speech text is required" 
      }, { status: 400 });
    }

    // Call our ML speech analyzer
    const { stdout, stderr } = await execAsync(
      `ml_models/venv_mac/bin/python ml_models/analyze_speech.py`,
      {
        input: JSON.stringify({ text, duration: duration || 30.0 }),
        cwd: process.cwd()
      }
    );

    if (stderr) {
      console.error('Python script stderr:', stderr);
    }

    const mlData = JSON.parse(stdout);
    
    if (!mlData.success) {
      throw new Error(`ML Analysis Error: ${mlData.error}`);
    }

    return Response.json({ 
      success: true, 
      analysis: mlData.analysis,
      source: 'ML Models'
    }, { status: 200 });

  } catch (error) {
    console.error("Speech Analysis Error:", error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
