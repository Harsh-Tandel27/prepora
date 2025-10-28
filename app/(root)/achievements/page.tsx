import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { Trophy, Star, Target, Zap } from "lucide-react";

const AchievementsPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const achievements = [
    {
      id: 1,
      title: "First Interview",
      description: "Complete your first AI interview",
      icon: Star,
      unlocked: true,
      progress: 100,
    },
    {
      id: 2,
      title: "Interview Master",
      description: "Complete 10 interviews",
      icon: Trophy,
      unlocked: false,
      progress: 20,
    },
    {
      id: 3,
      title: "High Scorer",
      description: "Score 90+ on any interview",
      icon: Target,
      unlocked: false,
      progress: 0,
    },
    {
      id: 4,
      title: "Speed Demon",
      description: "Complete an interview in under 15 minutes",
      icon: Zap,
      unlocked: false,
      progress: 0,
    },
  ];

  return (
    <div className="root-layout">
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Achievements</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div 
                key={achievement.id} 
                className={`card p-6 transition-all duration-200 ${
                  achievement.unlocked 
                    ? 'border-primary/20 bg-primary/5' 
                    : 'opacity-60'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${
                    achievement.unlocked 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <div className="text-primary">
                      <Star className="h-5 w-5 fill-current" />
                    </div>
                  )}
                </div>
                
                {!achievement.unlocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">{achievement.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Keep Going!</h3>
          <p className="text-muted-foreground">
            Complete interviews and improve your skills to unlock more achievements. 
            Each achievement brings you closer to becoming an interview expert!
          </p>
        </div>
      </section>
    </div>
  );
};

export default AchievementsPage;
