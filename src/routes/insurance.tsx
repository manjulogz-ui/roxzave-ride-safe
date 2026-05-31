import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppPage } from "@/components/layout/AppPage";
import { api } from "@/lib/api/client";
import { requireAuth } from "@/lib/auth/route-guard";
import { PageError, PageLoader } from "@/components/system/PageStates";
import { Link } from "@tanstack/react-router";
import { featureRoute } from "@/lib/navigation/app-routes";

export const Route = createFileRoute("/insurance")({
  beforeLoad: requireAuth,
  component: InsurancePage,
});

function InsurancePage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["insurance-dashboard"],
    queryFn: async () => {
      const { data: driver } = await api.get("/api/analytics/driver");
      const { data: rec } = await api.get("/api/ai/insurance-telematics/recommendations");
      return { driver, recommendations: rec as { items: string[] } };
    },
    retry: 1,
  });

  if (isLoading) return <AppPage title="Insurance" backTo="/"><PageLoader /></AppPage>;
  if (isError) {
    return (
      <AppPage title="Insurance" backTo="/">
        <PageError message="Could not load insurance insights." onRetry={() => refetch()} />
      </AppPage>
    );
  }

  const score = data?.driver?.safety_score ?? 0;
  const discount = score >= 85 ? "Up to 15%" : score >= 70 ? "Up to 8%" : "Improve score";

  return (
    <AppPage title="Insurance Dashboard" subtitle="Telematics" backTo="/">
      <div className="glass rounded-2xl p-5">
        <p className="text-[10px] uppercase text-muted-foreground">Safety impact</p>
        <p className="text-4xl font-black text-electric">{score}/100</p>
        <p className="mt-2 text-sm font-bold text-success">Discount opportunity: {discount}</p>
      </div>
      <ul className="mt-4 space-y-2">
        {(data?.recommendations?.items ?? []).map((item) => (
          <li key={item} className="glass rounded-xl px-3 py-2 text-[12px]">
            {item}
          </li>
        ))}
      </ul>
      <Link
        to={featureRoute("insurance-telematics").to}
        params={featureRoute("insurance-telematics").params}
        className="glass mt-4 block rounded-xl py-3 text-center text-sm font-bold text-electric"
      >
        Full telematics module →
      </Link>
    </AppPage>
  );
}
