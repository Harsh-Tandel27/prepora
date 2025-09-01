import InterviewForm from "@/components/InterviewForm";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <h3>Interview generation</h3>
      
      <InterviewForm 
        userId={user?.id!} 
        userName={user?.name!} 
      />
    </>
  );
};

export default Page;
