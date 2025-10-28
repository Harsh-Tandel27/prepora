"use client";

import { useState } from "react";

export default function DebugMLPage() {
  const sampleTranscript = `Interviewer: Tell me about yourself.
Candidate: I'm a software engineer with five years of experience in TypeScript, React, and Node.js. I focus on building scalable, reliable systems and mentoring teammates.

Interviewer: How do you approach problem solving?
Candidate: I clarify the problem, list constraints, propose an initial approach, and validate with examples. I start with a simple solution and then optimize. For example, I might move from O(n^2) to O(n log n) by using sorting, or O(n) with a hash map.

Interviewer: How would you scale an API that gets slow under load?
Candidate: I'd measure with tracing, identify hotspots, and apply caching using Redis, add database indexes, and introduce a queue for heavy work. I'd also use autoscaling and circuit breakers.

Interviewer: Describe a recent technical project.
Candidate: I led a feature that reduced TTFB by 35% using edge caching and pre-computation. We designed the service with clean architecture, added observability, and wrote integration tests.`;

  const weakTranscript = `Uh, so, like, I'm a developer and I, you know, build stuff.
I guess I solve problems by trying different things until something works.
If an API is slow, I'd probably, um, restart the server or maybe increase the instance size.
For algorithms, I usually just write whatever comes to mind and then hope it passes tests.
Teamwork is fine, I prefer to work alone.
I don't really use metrics or anything; I just ship and see what happens.
Like, yeah, that’s basically it.`;

  const [transcript, setTranscript] = useState(sampleTranscript);
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState("Mid");
  const [techstack, setTechstack] = useState("TypeScript, React, Node.js");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestPayload, setRequestPayload] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const messages = transcript
        .split(/\n|\./)
        .map((s, i) => ({
          role: "candidate" as const,
          content: s.trim(),
          timestamp: new Date().toISOString(),
          questionIndex: Math.floor(i / 2),
        }))
        .filter((m) => m.content.length > 0);

      const payload = {
        interviewId: "debug-interview",
        userId: "debug-user",
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
      <h1 className="text-3xl font-bold text-white">Debug ML Analysis</h1>
      <p className="text-white/80">Paste or edit a human-like answer transcript and run the analysis.</p>

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

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setTranscript(sampleTranscript)}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold disabled:opacity-60"
        >
          Use Sample Responses
        </button>
        <button
          onClick={() => setTranscript(weakTranscript)}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold disabled:opacity-60"
        >
          Use Weak Responses
        </button>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-60"
        >
          {loading ? "Running..." : "Run Analysis"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-lg border border-red-400/40 bg-red-500/10 text-red-300">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 rounded-lg border border-white/20 bg-white/5 text-white space-y-2">
          <div className="text-lg font-semibold">Score: {result?.feedback?.totalScore ?? "N/A"}/100</div>
          <pre className="whitespace-pre-wrap text-sm text-white/90">{JSON.stringify(result, null, 2)}</pre>
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


