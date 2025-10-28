import { redirect } from "next/navigation";
import InterviewForm from "@/components/InterviewForm";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-2xl font-bold text-white mb-8">Create New Interview</h3>
        <InterviewForm 
          userId={user.id} 
          userName={user.name} 
        />
      </div>
    </div>
  );
};

export default Page;
