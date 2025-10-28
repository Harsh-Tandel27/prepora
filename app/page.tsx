import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/actions/auth.action";

export default async function RootPage() {
  const isUserAuthenticated = await isAuthenticated();
  
  if (isUserAuthenticated) {
    // If authenticated, redirect to main dashboard
    redirect("/dashboard");
  } else {
    // If not authenticated, redirect to landing page
    redirect("/landing");
  }
}
