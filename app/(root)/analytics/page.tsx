import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { BarChart3, TrendingUp, Target, Clock } from "lucide-react";

const AnalyticsPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="root-layout">
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-foreground">Performance Trend</h3>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">85%</p>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-foreground">Interviews Taken</h3>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">12</p>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-foreground">Time Spent</h3>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">4.5h</p>
            <p className="text-sm text-muted-foreground">Practice Time</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Coming Soon</h3>
          <p className="text-muted-foreground">
            Detailed analytics and performance insights will be available soon. 
            Track your progress, identify areas for improvement, and see your interview skills grow over time.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;
