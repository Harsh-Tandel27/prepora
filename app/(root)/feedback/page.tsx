import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/general.action";
import InterviewCard from "@/components/InterviewCard";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

const FeedbackPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userInterviews = await getInterviewsByUserId(user.id);
  const interviewsWithFeedback = userInterviews?.filter(interview => interview.feedback) || [];

  return (
    <div className="root-layout">
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Your Interview Feedback</h2>
          <Link 
            href="/interview" 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Take New Interview
          </Link>
        </div>

        <div className="interviews-section">
          {interviewsWithFeedback.length > 0 ? (
            interviewsWithFeedback.map((interview) => (
              <div key={interview.id} className="card-interview">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground capitalize">
                        {interview.role} Interview
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {interview.type}
                      </p>
                    </div>
                  </div>
                  <div className="badge-text bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {interview.feedback?.totalScore || 0}/100
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {interview.feedback?.finalAssessment || "No feedback available"}
                </p>
                
                <div className="flex gap-2">
                  <Link 
                    href={`/interview/${interview.id}/feedback`}
                    className="btn-primary flex-1 text-center"
                  >
                    View Full Feedback
                  </Link>
                  <Link 
                    href={`/interview/${interview.id}`}
                    className="btn-secondary flex-1 text-center"
                  >
                    Retake Interview
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Feedback Yet</h3>
              <p className="text-muted-foreground mb-6">
                Complete an interview to see your detailed feedback and performance analysis.
              </p>
              <Link 
                href="/interview" 
                className="btn-primary"
              >
                Start Your First Interview
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FeedbackPage;
