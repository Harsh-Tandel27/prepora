"use client";

import { useState, useEffect } from "react";

export default function DebugMLPage() {
  // Test samples specifically designed for speech analysis
  // These focus on speech patterns: filler words, repetition, pauses, vocabulary, structure

  const [transcript, setTranscript] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState("Mid");
  const [techstack, setTechstack] = useState("TypeScript, React, Node.js");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestPayload, setRequestPayload] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("debug-user-12345678901234567890"); // Valid UID format for debug
  const [profileStatus, setProfileStatus] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Speech analysis test presets - designed to test different aspects of speech quality
  const presets: { name: string; text: string; description: string }[] = [
    {
      name: "Best - Excellent Speech",
      description: "No fillers, varied vocabulary, excellent structure, no repetition",
      text: `I approach problem-solving systematically by first understanding requirements and constraints. Then I design a solution architecture considering scalability, maintainability, and performance trade-offs. For instance, when optimizing an API, I implement caching strategies, database indexing, and asynchronous processing. I communicate technical decisions clearly to stakeholders, document architectural choices, and validate solutions through comprehensive testing. My methodology emphasizes iterative refinement and continuous improvement based on metrics and feedback.`,
    },
    {
      name: "Good - Solid Speech",
      description: "Minimal fillers, good vocabulary, well-structured, occasional repetition",
      text: `I typically start by analyzing the problem requirements and identifying key constraints. Then I design an initial solution approach, considering different implementation strategies. For performance optimization, I focus on caching mechanisms, database query improvements, and efficient algorithms. I communicate my approach to team members and document important decisions. I test the solution thoroughly and iterate based on results.`,
    },
    {
      name: "Average - Moderate Speech",
      description: "Some fillers, average vocabulary, decent structure, some repetition",
      text: `I usually try to understand the problem first, then I think about possible solutions. I might try a few different approaches to see what works best. For performance, I would add caching and maybe optimize some queries. I explain what I'm doing to the team and write some tests. Sometimes I need to go back and fix things if they don't work as expected.`,
    },
    {
      name: "Weak - Poor Speech",
      description: "Many fillers, repetitive words, poor structure, limited vocabulary",
      text: `Um, so like, I usually, you know, try to solve the problem. I mean, I start coding and then, like, if it doesn't work, I try something else. You know, I think performance is important, but, um, I usually just, like, add more servers or something. I mean, I explain things to people, but, you know, sometimes it's hard to, like, explain technical stuff. So yeah, that's basically, um, how I do things.`,
    },
    {
      name: "Very Weak - Extremely Poor Speech",
      description: "Excessive fillers, heavy repetition, many pauses, very poor structure",
      text: `Uh, so, um, like, I guess I, you know, I try to, um, solve problems. Like, I code stuff and, um, you know, if it works, great. If not, um, I try again. I mean, like, performance is, you know, important, but, um, I don't really, like, think about it too much. I just, you know, code and hope it works. Um, yeah, that's, like, my approach.`,
    },
    {
      name: "Repetition Heavy",
      description: "Tests repetition detection - same words repeated many times",
      text: `I solve problems by solving them systematically. When I solve a problem, I think about the problem carefully. The problem requires understanding the problem domain. My problem-solving approach involves breaking down the problem into smaller problems. Each problem gets solved individually until the entire problem is solved.`,
    },
    {
      name: "Pause Heavy",
      description: "Tests pause detection - many hesitation markers",
      text: `I approach development -- by first understanding -- the requirements. Then I design -- a solution architecture -- considering various factors. For optimization -- I implement caching -- and database improvements. I communicate -- technical decisions -- to the team.`,
    },
    {
      name: "Short Response",
      description: "Tests minimum word threshold - very brief answer",
      text: `I code. I test. I deploy.`,
    },
  ];

  // Fetch real user ID if logged in and check profile status
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user?.id) {
            const realUserId = data.user.id;
            setUserId(realUserId);
            // Check profile status
            checkProfileStatus(realUserId);
          } else {
            // Use default debug user ID
            checkProfileStatus(userId);
          }
        } else {
          // Use default debug user ID
          checkProfileStatus(userId);
        }
      } catch (error) {
        console.log('Debug mode: Using default debug user ID');
        checkProfileStatus(userId);
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const checkProfileStatus = async (uid: string) => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch(`/api/profile/check?userId=${uid}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfileStatus(data);
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // User profile templates from best to worst scores
  const profileTemplates = [
    {
      name: "🏆 Best - Ideal Candidate",
      description: "Experienced, educated, employed, willing to relocate",
      profile: {
        age: 30,
        gender: 'Male',
        education: 'M.E / M-Tech',
        maritalStatus: 'Unmarried',
        currentlyEmployed: true,
        experienceMonths: 60,
        willingToRelocate: true,
        hasAcquaintance: false,
      }
    },
    {
      name: "⭐ Excellent - Strong Candidate",
      description: "Good experience, well-educated, flexible",
      profile: {
        age: 28,
        gender: 'Male',
        education: 'B.E / B-Tech',
        maritalStatus: 'Unmarried',
        currentlyEmployed: true,
        experienceMonths: 48,
        willingToRelocate: true,
        hasAcquaintance: false,
      }
    },
    {
      name: "✅ Good - Solid Candidate",
      description: "Moderate experience, good education",
      profile: {
        age: 26,
        gender: 'Male',
        education: 'B.E / B-Tech',
        maritalStatus: 'Unmarried',
        currentlyEmployed: true,
        experienceMonths: 36,
        willingToRelocate: true,
        hasAcquaintance: false,
      }
    },
    {
      name: "👍 Average - Decent Candidate",
      description: "Some experience, basic education",
      profile: {
        age: 25,
        gender: 'Male',
        education: 'BSc or MSc',
        maritalStatus: 'Unmarried',
        currentlyEmployed: false,
        experienceMonths: 24,
        willingToRelocate: false,
        hasAcquaintance: false,
      }
    },
    {
      name: "⚠️ Below Average - Weak Candidate",
      description: "Limited experience, basic education, not flexible",
      profile: {
        age: 23,
        gender: 'Female',
        education: 'BA/MA',
        maritalStatus: 'Married',
        currentlyEmployed: false,
        experienceMonths: 12,
        willingToRelocate: false,
        hasAcquaintance: false,
      }
    },
    {
      name: "❌ Poor - Very Weak Candidate",
      description: "Minimal experience, lower education, constraints",
      profile: {
        age: 22,
        gender: 'Female',
        education: 'B.com (Bachelor of commerce)',
        maritalStatus: 'Married',
        currentlyEmployed: false,
        experienceMonths: 6,
        willingToRelocate: false,
        hasAcquaintance: false,
      }
    },
    {
      name: "🔴 Worst - Extremely Weak Candidate",
      description: "No experience, basic education, many constraints",
      profile: {
        age: 21,
        gender: 'Female',
        education: 'B.com (Bachelor of commerce)',
        maritalStatus: 'Married',
        currentlyEmployed: false,
        experienceMonths: 0,
        willingToRelocate: false,
        hasAcquaintance: false,
      }
    }
  ];

  const createCompleteProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const completeProfile = {
        age: 28,
        gender: 'Male',
        education: 'B.E / B-Tech',
        maritalStatus: 'Unmarried',
        currentlyEmployed: true,
        experienceMonths: 36,
        willingToRelocate: true,
        hasAcquaintance: false,
      };

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          profile: completeProfile,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('✅ Complete profile created successfully!');
          checkProfileStatus(userId);
        }
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('❌ Failed to create profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const applyProfileTemplate = async (template: typeof profileTemplates[0]) => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          profile: template.profile,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`✅ ${template.name} profile applied!`);
          checkProfileStatus(userId);
        }
      }
    } catch (error) {
      console.error('Error applying profile template:', error);
      alert('❌ Failed to apply profile template');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const clearProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const emptyProfile = {
        age: null,
        gender: null,
        education: null,
        maritalStatus: null,
        currentlyEmployed: null,
        experienceMonths: null,
        willingToRelocate: null,
        hasAcquaintance: null,
      };

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          profile: emptyProfile,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('✅ Profile cleared!');
          checkProfileStatus(userId);
        }
      }
    } catch (error) {
      console.error('Error clearing profile:', error);
      alert('❌ Failed to clear profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Extract candidate responses from transcript
      // Handle both "Interviewer: ... Candidate: ..." format and plain text
      const candidateText = transcript
        .split(/\n/)
        .filter(line => {
          const trimmed = line.trim();
          return trimmed && !trimmed.toLowerCase().startsWith('interviewer:');
        })
        .map(line => line.replace(/^candidate:\s*/i, '').trim())
        .filter(line => line.length > 0)
        .join(' ') || transcript.trim();

      // Create messages array - split into sentences for better analysis
      const sentences = candidateText
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const messages = sentences.map((content, i) => ({
        role: "candidate" as const,
        content: content,
        timestamp: new Date().toISOString(),
        questionIndex: Math.floor(i / 3), // Group every 3 sentences as one answer
      }));

      const payload = {
        interviewId: "debug-interview",
        userId: userId,
        transcript: messages,
        interviewData: {
          role,
          level,
          techstack: techstack.split(",").map((t) => t.trim()).filter(Boolean),
          type: "mock",
        },
      };

      setRequestPayload(payload);

      const res = await fetch("/api/feedback/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setResponseStatus(`${res.status} ${res.statusText}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) {
        setError(body?.error || res.statusText || "Failed to run analysis");
      } else {
        setResult(body);
      }
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">ML Models Debug Tool</h1>
      <p className="text-white/80">
        Test the speech analyzer and interview predictor with different speech patterns and profile states.
        The analyzer evaluates: filler words, repetition, pauses, vocabulary diversity, and sentence structure.
      </p>

      {/* Profile Status Section */}
      <div className="p-4 rounded-lg border border-white/20 bg-white/5 text-white space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Profile Status</h2>
          <button
            onClick={() => checkProfileStatus(userId)}
            disabled={isLoadingProfile}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm disabled:opacity-60"
          >
            {isLoadingProfile ? "Loading..." : "Refresh"}
          </button>
        </div>
        
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <div className="text-sm text-white/70">User ID:</div>
            <div className="text-sm font-mono break-all">{userId}</div>
          </div>
          {profileStatus && (
            <>
              <div>
                <div className="text-sm text-white/70">Profile Completion:</div>
                <div className={`text-sm font-semibold ${profileStatus.completion?.completed ? 'text-green-400' : 'text-yellow-400'}`}>
                  {profileStatus.completion?.completed ? '✅ Complete' : '⚠️ Incomplete'} ({profileStatus.completion?.percentage || 0}%)
                </div>
              </div>
              {profileStatus.completion?.missingFields && profileStatus.completion.missingFields.length > 0 && (
                <div className="md:col-span-2">
                  <div className="text-sm text-white/70">Missing Fields:</div>
                  <div className="text-sm text-yellow-300">
                    {profileStatus.completion.missingFields.join(', ')}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3 pt-2 border-t border-white/10">
          <button
            onClick={createCompleteProfile}
            disabled={isLoadingProfile}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-60"
          >
            Create Complete Profile
          </button>
          <button
            onClick={clearProfile}
            disabled={isLoadingProfile}
            className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium disabled:opacity-60"
          >
            Clear Profile (Test Incomplete)
          </button>
        </div>
      </div>

      {/* Profile Templates Section */}
      <div className="p-4 rounded-lg border border-white/20 bg-white/5 text-white space-y-3">
        <h2 className="text-xl font-semibold">Profile Templates (Best to Worst Scores)</h2>
        <p className="text-sm text-white/70">
          Apply different profile templates to test how they affect interview prediction scores.
          Templates are ordered from best (highest expected score) to worst (lowest expected score).
        </p>
        
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {profileTemplates.map((template, index) => (
            <button
              key={index}
              onClick={() => applyProfileTemplate(template)}
              disabled={isLoadingProfile}
              className="p-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-left text-sm disabled:opacity-60 transition-colors"
              title={template.description}
            >
              <div className="font-semibold text-white mb-1">{template.name}</div>
              <div className="text-xs text-white/70 mb-2">{template.description}</div>
              <div className="text-xs text-white/60 space-y-0.5">
                <div>Age: {template.profile.age} | Exp: {template.profile.experienceMonths}mo</div>
                <div>Edu: {template.profile.education}</div>
                <div>
                  {template.profile.currentlyEmployed ? '✅ Employed' : '❌ Unemployed'} | 
                  {template.profile.willingToRelocate ? ' ✅ Relocate' : ' ❌ No Relocate'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-white/90">Role
          <input className="w-full mt-1 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white" value={role} onChange={(e) => setRole(e.target.value)} />
        </label>
        <label className="text-white/90">Level
          <input className="w-full mt-1 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white" value={level} onChange={(e) => setLevel(e.target.value)} />
        </label>
        <label className="text-white/90">Techstack (comma separated)
          <input className="w-full mt-1 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white" value={techstack} onChange={(e) => setTechstack(e.target.value)} />
        </label>
      </div>

      <div>
        <textarea
          className="w-full h-60 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => setTranscript(p.text)}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium disabled:opacity-60 border border-white/20"
              title={p.description}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={runAnalysis}
            disabled={loading || !transcript.trim()}
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Running Analysis..." : "Run Speech Analysis"}
          </button>
          <button
            onClick={() => {
              setTranscript("");
              setResult(null);
              setError(null);
            }}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-lg border border-red-400/40 bg-red-500/10 text-red-300">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 rounded-lg border border-white/20 bg-white/5 text-white space-y-4">
          <div className="text-lg font-semibold">
            Overall Score: {result?.feedback?.totalScore ?? result?.totalScore ?? "N/A"}/100
          </div>
          
          {(result?.feedback?.categoryScores || result?.categoryScores) && (
            <div className="space-y-2">
              <h3 className="font-semibold text-white/90">Category Scores:</h3>
              {(result.feedback?.categoryScores || result.categoryScores || []).map((cat: any, i: number) => (
                <div key={i} className="pl-4 border-l-2 border-white/20">
                  <div className="font-medium">{cat.name}: {cat.score}/100</div>
                  <div className="text-sm text-white/70">{cat.comment}</div>
                </div>
              ))}
            </div>
          )}

          {/* Prediction Status */}
          {result?.warning && (
            <div className="p-3 rounded bg-yellow-500/10 border border-yellow-400/40 text-yellow-300 text-sm">
              ⚠️ {result.warning}
            </div>
          )}
          
          {result?.feedback?.mlAnalysis?.interviewPrediction && (
            <div className="space-y-2">
              <h3 className="font-semibold text-green-400">✅ Interview Prediction (Profile Complete):</h3>
              {(() => {
                const prediction = result.feedback.mlAnalysis.interviewPrediction;
                return (
                  <div className="pl-4 space-y-1 text-sm">
                    <div>Success Probability: {(prediction.success_probability * 100 || 0).toFixed(1)}%</div>
                    <div>Predicted Success: {prediction.predicted_success ? '✅ Yes' : '❌ No'}</div>
                    <div>Overall Score: {prediction.overall_score || 'N/A'}/100</div>
                    <div>Model Used: {prediction.model_used || 'N/A'}</div>
                  </div>
                );
              })()}
            </div>
          )}

          {!result?.feedback?.mlAnalysis?.interviewPrediction && !result?.warning && (
            <div className="p-3 rounded bg-yellow-500/10 border border-yellow-400/40 text-yellow-300 text-sm">
              ⚠️ Interview prediction not available (profile incomplete)
            </div>
          )}

          {(result?.feedback?.mlAnalysis?.speechAnalysis || result?.mlAnalysis?.speechAnalysis) && (
            <div className="space-y-2">
              <h3 className="font-semibold text-white/90">Speech Analysis Details:</h3>
              {(() => {
                const speechAnalysis = result.feedback?.mlAnalysis?.speechAnalysis || result.mlAnalysis?.speechAnalysis;
                return (
                  <div className="pl-4 space-y-1 text-sm">
                    <div>Quality Score: {speechAnalysis.quality_score}/100</div>
                    <div>Confidence Score: {speechAnalysis.confidence_score}/100</div>
                    <div>Filler Rate: {(speechAnalysis.filler_word_analysis?.filler_rate * 100 || 0).toFixed(1)}%</div>
                    <div>Repetition Rate: {(speechAnalysis.repetition_analysis?.repetition_rate * 100 || 0).toFixed(1)}%</div>
                    <div>Pause Rate: {(speechAnalysis.pause_analysis?.pause_rate * 100 || 0).toFixed(1)}%</div>
                    <div>Vocabulary Diversity: {(speechAnalysis.vocabulary_analysis?.diversity * 100 || 0).toFixed(1)}%</div>
                  </div>
                );
              })()}
            </div>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-white/70 hover:text-white/90">View Full JSON Response</summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-white/60 overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}

      {requestPayload && (
        <div className="mt-4 p-4 rounded-lg border border-white/20 bg-white/5 text-white space-y-2">
          <div className="text-lg font-semibold">Request Payload {responseStatus ? `(Response: ${responseStatus})` : ''}</div>
          <pre className="whitespace-pre-wrap text-sm text-white/90">{JSON.stringify(requestPayload, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}


