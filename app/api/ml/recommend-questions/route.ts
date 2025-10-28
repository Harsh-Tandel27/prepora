import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, query, n, category, difficulty, preferred_category, skill_level, profile } = body || {};

    const payload = {
      mode,
      query,
      n: n ?? 5,
      category,
      difficulty,
      preferred_category,
      skill_level,
      profile,
    };

    const { stdout, stderr } = await execAsync(
      `ml_models/venv_mac/bin/python ml_models/recommend_questions.py`,
      {
        input: JSON.stringify(payload),
        cwd: process.cwd(),
        timeout: 30000,
      }
    );

    if (stderr) {
      console.error("recommender stderr:", stderr);
    }

    const result = JSON.parse(stdout);

    if (!result.success) {
      return Response.json({ success: false, error: result.error || "Unknown error" }, { status: 400 });
    }

    return Response.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    console.error("Recommend Questions Error:", error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
