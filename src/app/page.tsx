import DashboardHome from "@/components/DashboardHome";
import DashboardShell from "@/components/DashboardShell";

export default function Home() {
  return (
    <DashboardShell>
      <DashboardHome />
    </DashboardShell>
  );
}