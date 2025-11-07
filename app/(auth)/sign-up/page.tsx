import AuthForm from "@/components/AuthForm";

const Page = () => {
  return (
    <div className="min-h-dvh relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-dvh px-4">
        <div className="w-full max-w-md">
          <AuthForm type="sign-up" />
        </div>
      </div>
    </div>
  );
};

export default Page;
