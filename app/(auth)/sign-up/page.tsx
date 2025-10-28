import AuthForm from "@/components/AuthForm";

const Page = () => {
  return (
    <div className="min-h-dvh bg-[#0b0f1a] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(#111827_1px,transparent_1px),linear-gradient(90deg,#111827_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_80%_10%,#7c3aed22,transparent_60%),radial-gradient(600px_300px_at_20%_90%,#2563eb22,transparent_60%)]" />
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-dvh px-4">
        <div className="w-full max-w-md">
          <AuthForm type="sign-up" />
        </div>
      </div>
    </div>
  );
};

export default Page;
