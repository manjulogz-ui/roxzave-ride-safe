import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { getQueryClient } from "@/lib/queryClient";
import { PageLoader } from "@/components/system/PageStates";
import { Link } from "@tanstack/react-router";

function DefaultRouteError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            Retry
          </button>
          <Link to="/" className="rounded-xl border border-border px-4 py-2 text-sm font-bold">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

/** TanStack Start calls getRouter() with no arguments. */
export function getRouter() {
  const queryClient = getQueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: () => <PageLoader />,
    defaultErrorComponent: DefaultRouteError,
  });
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
