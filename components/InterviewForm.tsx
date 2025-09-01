"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InterviewFormProps {
  userId: string;
  userName: string;
}

export default function InterviewForm({ userId, userName }: InterviewFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    level: "Junior",
    type: "Technical",
    techstack: "",
    amount: 5
  });

  // Interview type options
  const interviewTypes = [
    { value: "Technical", label: "Technical Interview", description: "Focus on coding, algorithms, and technical skills" },
    { value: "Behavioral", label: "Behavioral Interview", description: "Focus on past experiences, teamwork, and problem-solving" },
    { value: "System Design", label: "System Design Interview", description: "Focus on architecture, scalability, and system thinking" },
    { value: "Case Study", label: "Case Study Interview", description: "Focus on business problems and analytical thinking" },
    { value: "Mixed", label: "Mixed Interview", description: "Combination of technical and behavioral questions" }
  ];

  // Experience level options
  const experienceLevels = [
    { value: "Junior", label: "Junior (0-2 years)", description: "Entry level positions" },
    { value: "Mid-Level", label: "Mid-Level (2-5 years)", description: "Intermediate positions" },
    { value: "Senior", label: "Senior (5+ years)", description: "Advanced positions" },
    { value: "Lead", label: "Lead/Architect", description: "Leadership and architecture roles" }
  ];

  // Question amount options
  const questionAmounts = [3, 5, 7, 10, 15];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/interview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userid: userId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Redirect to the interview page
          router.push(`/interview/${result.interviewId || 'new'}`);
        } else {
          console.error("Failed to create interview:", result.error);
        }
      } else {
        console.error("Failed to create interview");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-dark-200 rounded-lg border border-primary-200/20">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Create Your Interview
        </h2>
        <p className="text-gray-300">
          Customize your interview experience with ML-powered questions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Interview Type Selection */}
        <div className="space-y-3">
          <Label className="text-white font-semibold">Interview Type</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {interviewTypes.map((type) => (
              <div
                key={type.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.type === type.value
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-gray-600 bg-dark-300 hover:border-gray-500"
                }`}
                onClick={() => handleInputChange("type", type.value)}
              >
                <div className="font-medium text-white mb-1">{type.label}</div>
                <div className="text-sm text-gray-400">{type.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Input */}
        <div className="space-y-2">
          <Label htmlFor="role" className="text-white font-semibold">
            Job Role
          </Label>
          <Input
            id="role"
            type="text"
            placeholder="e.g., Frontend Developer, Data Scientist, DevOps Engineer"
            value={formData.role}
            onChange={(e) => handleInputChange("role", e.target.value)}
            className="bg-dark-300 border-gray-600 text-white placeholder-gray-400"
            required
          />
        </div>

        {/* Experience Level Selection */}
        <div className="space-y-3">
          <Label className="text-white font-semibold">Experience Level</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {experienceLevels.map((level) => (
              <div
                key={level.value}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.level === level.value
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-gray-600 bg-dark-300 hover:border-gray-500"
                }`}
                onClick={() => handleInputChange("level", level.value)}
              >
                <div className="font-medium text-white">{level.label}</div>
                <div className="text-xs text-gray-400">{level.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Input */}
        <div className="space-y-2">
          <Label htmlFor="techstack" className="text-white font-semibold">
            Tech Stack (comma-separated)
          </Label>
          <Input
            id="techstack"
            type="text"
            placeholder="e.g., React, Node.js, Python, AWS"
            value={formData.techstack}
            onChange={(e) => handleInputChange("techstack", e.target.value)}
            className="bg-dark-300 border-gray-600 text-white placeholder-gray-400"
          />
          <p className="text-xs text-gray-400">
            Leave empty for general questions, or specify technologies for focused questions
          </p>
        </div>

        {/* Question Amount Selection */}
        <div className="space-y-3">
          <Label className="text-white font-semibold">Number of Questions</Label>
          <div className="flex flex-wrap gap-2">
            {questionAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleInputChange("amount", amount)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  formData.amount === amount
                    ? "border-primary-500 bg-primary-500 text-white"
                    : "border-gray-600 bg-dark-300 text-gray-300 hover:border-gray-500"
                }`}
              >
                {amount} Questions
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !formData.role}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 text-white font-semibold py-3"
        >
          {isLoading ? "Creating Interview..." : "Create Interview"}
        </Button>
      </form>

      {/* Preview */}
      {formData.role && (
        <div className="mt-6 p-4 bg-dark-300 rounded-lg border border-gray-600">
          <h3 className="text-white font-semibold mb-2">Interview Preview</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p><span className="text-gray-400">Type:</span> {formData.type}</p>
            <p><span className="text-gray-400">Role:</span> {formData.role}</p>
            <p><span className="text-gray-400">Level:</span> {formData.level}</p>
            <p><span className="text-gray-400">Tech Stack:</span> {formData.techstack || "General"}</p>
            <p><span className="text-gray-400">Questions:</span> {formData.amount}</p>
          </div>
        </div>
      )}
    </div>
  );
}
