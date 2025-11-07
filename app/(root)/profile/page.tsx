import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { User, Mail, Calendar } from "lucide-react";
import ProfileCompletionForm from "@/components/profile/ProfileCompletionForm";

const ProfilePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="root-layout">
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Profile</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">{user.email}</span>
                </div>
                {user.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="card p-4">
              <h4 className="font-semibold text-foreground mb-2">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interviews</span>
                  <span className="text-foreground font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Score</span>
                  <span className="text-foreground font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Spent</span>
                  <span className="text-foreground font-medium">0h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Form */}
        <ProfileCompletionForm 
          userId={user.id} 
          initialProfile={user.profile}
        />
      </section>
    </div>
  );
};

export default ProfilePage;

