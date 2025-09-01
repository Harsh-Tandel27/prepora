import Image from "next/image";
import { redirect } from "next/navigation";

import { getRandomInterviewCover } from "@/lib/utils";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import InterviewWrapper from '@/components/InterviewWrapper';
import { getInterviewById } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";

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

  return (
    <>
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

      {questions && questions.length > 0 ? (
        <InterviewWrapper
          questions={questions}
          userName={userName}
        />
      ) : (
        <div>Loading questions...</div>
      )}
    </>
  );
};

export default InterviewDetails;
