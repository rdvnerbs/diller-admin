import DashboardSidebar from "@/components/dashboard-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
