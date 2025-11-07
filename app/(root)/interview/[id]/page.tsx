import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";

import { getRandomInterviewCover } from "@/lib/utils";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import InterviewWrapper from '@/components/InterviewWrapper';
import { getInterviewById } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Mic, Target, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

const InterviewDetails = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const interview = await getInterviewById(id);
  if (!interview) {
    redirect("/");
  }

  const questions = interview.questions;
  const userName = user?.name || 'User';
  const analysis = interview.analysis;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "destructive";
  };

  return (
    <div className="root-layout">
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={40}
              height={40}
              className="rounded-full object-cover size-[40px]"
            />
            <h3 className="capitalize">{interview.role} Interview</h3>
          </div>

          <DisplayTechIcons techStack={interview.techstack} />
        </div>

        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit">
          {interview.type}
        </p>
      </div>

      {analysis ? (
        // Show Analysis Results
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -m-4 p-8">
          <div className="container mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Interview Analysis Results
              </h1>
              <div className="flex items-center justify-center gap-4 text-lg text-gray-300">
                <Badge variant="outline" className="text-white border-white/20">
                  {interview.role}
                </Badge>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {analysis.createdAt
                    ? new Date(analysis.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>

            {/* Overall Score Card */}
            <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white text-center">
                  Overall Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold mb-4">
                  <span className={getScoreColor(analysis.totalScore || 0)}>
                    {analysis.totalScore || 0}
                  </span>
                  <span className="text-4xl text-gray-400">/100</span>
                </div>
                <Progress 
                  value={analysis.totalScore || 0} 
                  className="w-full h-3 mb-4"
                />
                <Badge 
                  variant={getScoreBadgeVariant(analysis.totalScore || 0)}
                  className="text-lg px-4 py-2"
                >
                  {analysis.totalScore >= 80 ? "Excellent" : 
                   analysis.totalScore >= 60 ? "Good" : "Needs Improvement"}
                </Badge>
              </CardContent>
            </Card>

            {/* Final Assessment */}
            <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  AI Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 text-lg leading-relaxed">
                  {analysis.finalAssessment || "No assessment available."}
                </p>
              </CardContent>
            </Card>

            {/* Category Scores */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {analysis.categoryScores?.map((category, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center justify-between">
                      <span>{category.name}</span>
                      <Badge variant={getScoreBadgeVariant(category.score)}>
                        {category.score}/100
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={category.score} className="w-full h-2 mb-3" />
                    <p className="text-gray-300 text-sm">{category.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ML Analysis Insights */}
            {analysis.mlAnalysis && (
              <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Mic className="w-6 h-6" />
                    ML Analysis Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {analysis.mlAnalysis.wordCount}
                      </div>
                      <div className="text-sm text-gray-400">Words Spoken</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {analysis.mlAnalysis.speechAnalysis?.quality_score?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">Speech Quality</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {analysis.mlAnalysis.interviewPrediction?.success_probability ? 
                          (analysis.mlAnalysis.interviewPrediction.success_probability * 100).toFixed(1) + '%' : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">Success Probability</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Strengths and Areas for Improvement */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Strengths */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-200">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.areasForImprovement?.map((area, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-200">
                        <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                <Link href={`/interview/${id}`} className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Retake Interview
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Show Interview Interface
        questions && questions.length > 0 ? (
          <InterviewWrapper
            questions={questions}
            userName={userName}
            interviewId={id}
            userId={user.id}
            interviewData={{
              role: interview.role,
              level: interview.level,
              techstack: interview.techstack,
              type: interview.type
            }}
          />
        ) : (
          <div>Loading questions...</div>
        )
      )}
    </div>
  );
};

export default InterviewDetails;
