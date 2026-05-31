import type { ReactNode } from "react";
import { Suspense } from "react";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteBoundary } from "@/components/system/RouteBoundary";
import { PageLoader } from "@/components/system/PageStates";

type AppPageProps = {
  title: string;
  subtitle?: string;
  backTo?: string;
  children: ReactNode;
  loadingLabel?: string;
};

export function AppPage({ title, subtitle, backTo = "/", children, loadingLabel }: AppPageProps) {
  return (
    <MobileShell>
      <RouteBoundary title={title}>
        <PageHeader title={title} subtitle={subtitle} backTo={backTo} />
        <Suspense fallback={<PageLoader label={loadingLabel} />}>{children}</Suspense>
      </RouteBoundary>
    </MobileShell>
  );
}
