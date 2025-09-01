"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "@/styles/interview-form.css";

interface InterviewFormProps {
  userId: string;
  userName: string;
}

export default function InterviewForm({ userId, userName }: InterviewFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    role: "",
    level: "Junior",
    type: "Technical",
    techstack: "",
    amount: 5
  });

  // Job role options
  const jobRoles = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer",
    "Data Scientist", "Data Engineer", "Machine Learning Engineer", "Software Engineer",
    "Mobile Developer", "UI/UX Designer", "Product Manager", "QA Engineer",
    "System Administrator", "Cloud Engineer", "Security Engineer", "Database Administrator",
    "Technical Lead", "Engineering Manager", "Solution Architect", "Other"
  ];

  // Tech stack options
  const techStacks = [
    "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "Node.js", "Express.js",
    "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "C#", ".NET",
    "Go", "Rust", "PHP", "Laravel", "Ruby", "Rails", "Swift", "Kotlin",
    "HTML/CSS", "SASS/SCSS", "Tailwind CSS", "Bootstrap", "Material-UI",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch", "Firebase",
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins",
    "Git", "GitHub", "GitLab", "Jira", "Confluence", "Figma", "Sketch"
  ];

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

  // Form steps
  const steps = [
    { title: "Interview Type", description: "Choose the type of interview you want to practice" },
    { title: "Job Role", description: "Select your target job role" },
    { title: "Experience Level", description: "Choose your experience level" },
    { title: "Tech Stack", description: "Select relevant technologies" },
    { title: "Question Count", description: "Choose number of questions" },
    { title: "Review & Create", description: "Review your selections and create interview" }
  ];

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

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTechStackToggle = (tech: string) => {
    const currentTechs = formData.techstack.split(",").filter(t => t.trim());
    if (currentTechs.includes(tech)) {
      const newTechs = currentTechs.filter(t => t !== tech);
      setFormData(prev => ({ ...prev, techstack: newTechs.join(", ") }));
    } else {
      const newTechs = [...currentTechs, tech];
      setFormData(prev => ({ ...prev, techstack: newTechs.join(", ") }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Interview Type
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {interviewTypes.map((type, index) => (
                <div
                  key={type.value}
                  className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    formData.type === type.value
                      ? "border-primary-500 bg-gradient-to-br from-primary-500/20 to-primary-600/10 shadow-lg shadow-primary-500/25"
                      : "border-gray-600 bg-dark-300/50 hover:border-primary-400/50 hover:bg-dark-300/80"
                  }`}
                  onClick={() => handleInputChange("type", type.value)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      formData.type === type.value
                        ? "bg-primary-500 text-white"
                        : "bg-gray-600 text-gray-400 group-hover:bg-primary-500/20 group-hover:text-primary-300"
                    }`}>
                      {type.value === "Technical" && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      )}
                      {type.value === "Behavioral" && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                      {type.value === "System Design" && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                      {type.value === "Case Study" && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {type.value === "Mixed" && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-200 transition-colors">
                        {type.label}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 1: // Job Role
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {jobRoles.map((role, index) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleInputChange("role", role)}
                  className={`group p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 text-sm font-medium ${
                    formData.role === role
                      ? "border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                      : "border-gray-600 bg-dark-300/50 text-gray-300 hover:border-primary-400/50 hover:bg-dark-300/80 hover:text-white"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{role}</span>
                    {formData.role === role && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Or type your own role..."
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className="bg-dark-300/50 border-gray-600 text-white placeholder-gray-400 rounded-xl px-4 py-3 text-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Experience Level
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experienceLevels.map((level, index) => (
                <div
                  key={level.value}
                  className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    formData.level === level.value
                      ? "border-primary-500 bg-gradient-to-br from-primary-500/20 to-primary-600/10 shadow-lg shadow-primary-500/25"
                      : "border-gray-600 bg-dark-300/50 hover:border-primary-400/50 hover:bg-dark-300/80"
                  }`}
                  onClick={() => handleInputChange("level", level.value)}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      formData.level === level.value
                        ? "bg-primary-500 text-white"
                        : "bg-gray-600 text-gray-400 group-hover:bg-primary-500/20 group-hover:text-primary-300"
                    }`}>
                      {level.value === "Junior" && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      {level.value === "Mid-Level" && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      )}
                      {level.value === "Senior" && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      )}
                      {level.value === "Lead" && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-200 transition-colors">
                        {level.label}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{level.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3: // Tech Stack
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Select Your Tech Stack</h3>
              <p className="text-gray-400">Choose technologies relevant to your role (optional)</p>
            </div>
            
            <div className="bg-dark-300/30 rounded-2xl p-6 border border-gray-600/30">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-80 overflow-y-auto custom-scrollbar">
                {techStacks.map((tech, index) => {
                  const isSelected = formData.techstack.split(",").includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => handleTechStackToggle(tech)}
                      className={`group p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 text-xs font-medium ${
                        isSelected
                          ? "border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                          : "border-gray-600 bg-dark-300/50 text-gray-300 hover:border-primary-400/50 hover:bg-dark-300/80 hover:text-white"
                      }`}
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>{tech}</span>
                        {isSelected && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {formData.techstack && (
              <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 rounded-2xl p-6 border border-primary-500/20">
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-lg font-semibold text-white">Selected Technologies</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {formData.techstack.split(",").filter(t => t.trim()).map((tech) => (
                    <span key={tech} className="px-4 py-2 bg-primary-500/20 text-primary-300 rounded-xl text-sm font-medium border border-primary-500/30">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4: // Question Count
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Choose Number of Questions</h3>
              <p className="text-gray-400">Select how many questions you'd like in your interview</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {questionAmounts.map((amount, index) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleInputChange("amount", amount)}
                  className={`group p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.amount === amount
                      ? "border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                      : "border-gray-600 bg-dark-300/50 text-gray-300 hover:border-primary-400/50 hover:bg-dark-300/80 hover:text-white"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{amount}</div>
                    <div className="text-sm font-medium">Questions</div>
                    {formData.amount === amount && (
                      <div className="mt-2">
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5: // Review & Create
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Review Your Interview</h3>
              <p className="text-gray-400">Everything looks good? Let's create your personalized interview!</p>
            </div>
            
            <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-3xl p-8 border border-primary-200/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-dark-200/50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Interview Type</div>
                      <div className="text-white font-semibold">{formData.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-dark-200/50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Job Role</div>
                      <div className="text-white font-semibold">{formData.role}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-dark-200/50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Experience Level</div>
                      <div className="text-white font-semibold">{formData.level}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-dark-200/50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Tech Stack</div>
                      <div className="text-white font-semibold">{formData.techstack || "General"}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-dark-200/50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Questions</div>
                      <div className="text-white font-semibold">{formData.amount} Questions</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-primary-500/10 to-primary-600/10 rounded-xl border border-primary-500/20">
                    <div className="text-sm text-gray-400 mb-2">Estimated Duration</div>
                    <div className="text-white font-semibold">~{Math.ceil(formData.amount * 2)} minutes</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || !formData.role}
              className="group w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-6 text-xl rounded-2xl transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Your Interview...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>🚀 Create My Interview</span>
                </div>
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-100 via-dark-200 to-dark-300 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header with Animation */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-6 shadow-lg shadow-primary-500/25">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-primary-100 to-primary-200 bg-clip-text text-transparent mb-4">
            Create Your Interview
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Build a personalized interview experience with AI-powered questions tailored to your role and expertise
          </p>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mb-12">
          <div className="bg-dark-200/50 backdrop-blur-sm rounded-2xl p-6 border border-primary-200/10">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                        index < currentStep
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 scale-110"
                          : index === currentStep
                          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 scale-110 animate-pulse"
                          : "bg-gray-600 text-gray-400"
                      }`}
                    >
                      {index < currentStep ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center max-w-20 ${
                      index <= currentStep ? "text-white" : "text-gray-500"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${
                            index < currentStep
                              ? "bg-gradient-to-r from-green-500 to-green-600"
                              : "bg-gray-600"
                          }`}
                          style={{ width: index < currentStep ? "100%" : "0%" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{steps[currentStep].title}</h3>
              <p className="text-gray-300 text-lg">{steps[currentStep].description}</p>
              <div className="mt-4 text-sm text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Step Content */}
        <form onSubmit={handleSubmit}>
          <div className="bg-gradient-to-br from-dark-200/80 to-dark-300/80 backdrop-blur-sm rounded-3xl border border-primary-200/20 p-8 md:p-12 mb-8 shadow-2xl">
            <div className="animate-fadeIn">
              {renderStepContent()}
            </div>
          </div>

          {/* Enhanced Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="group px-8 py-4 bg-gray-600/80 hover:bg-gray-700/80 disabled:bg-gray-800/50 disabled:text-gray-500 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-500/20 disabled:border-gray-700/20"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={currentStep === 0 && !formData.type}
                className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:shadow-none"
              >
                Next
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            ) : null}
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            Powered by advanced ML models for personalized interview experiences
          </p>
        </div>
      </div>
    </div>
  );
}
