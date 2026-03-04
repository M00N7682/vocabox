import { Sidebar } from "@/components/layout/sidebar";
import { getUnresolvedCount } from "@/lib/actions/risk-alerts";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const riskCount = await getUnresolvedCount();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar riskCount={riskCount} />
      <main className="flex flex-col flex-1 overflow-auto bg-eo-bg-page">
        {children}
      </main>
    </div>
  );
}
