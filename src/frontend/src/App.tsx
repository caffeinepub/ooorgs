import { useEffect } from "react";
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  Outlet,
  Navigate,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import CharitablePage from "./pages/CharitablePage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import CorporationsPage from "./pages/CorporationsPage";
import CooperativesPage from "./pages/CooperativesPage";
import DaoPage from "./pages/DaoPage";
import VolunteerBoardPage from "./pages/VolunteerBoardPage";
import { useActor } from "./hooks/useActor";

// ─── FinFranFran seed settings ────────────────────────────────────────────────
// Seeds fractionalization settings for the first 3 campaigns if they don't exist.
const FFF_SEEDS: Array<{ campaignId: bigint; totalUnits: bigint; pricePerUnit: number }> = [
  { campaignId: 1n, totalUnits: 1000n, pricePerUnit: 25 },
  { campaignId: 2n, totalUnits: 500n,  pricePerUnit: 100 },
  { campaignId: 3n, totalUnits: 2000n, pricePerUnit: 10 },
];

function FFFSeeder() {
  const { actor, isFetching } = useActor();

  useEffect(() => {
    if (!actor || isFetching) return;

    // Run seed checks in parallel; only set if not already configured
    Promise.all(
      FFF_SEEDS.map(async (seed) => {
        try {
          const existing = await actor.getFractionalizationSettings(seed.campaignId);
          if (existing === null) {
            await actor.setFractionalizationSettings(seed.campaignId, seed.totalUnits, seed.pricePerUnit);
          }
        } catch (err) {
          // Non-fatal: campaign may not exist yet
          console.warn(`FinFranFran seed skipped for campaign ${seed.campaignId}:`, err);
        }
      })
    ).catch((err) => {
      console.warn("FinFranFran seed error:", err);
    });
  }, [actor, isFetching]);

  return null;
}

// ─── Root layout (NavBar + footer wrapping all routes) ────────────────────────
const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "oklch(0.97 0.02 88)",
      }}
    >
      <FFFSeeder />
      <Toaster richColors position="top-right" />
      <NavBar />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <footer
        style={{
          padding: "24px",
          textAlign: "center",
          fontSize: "0.75rem",
          background: "oklch(0.93 0.02 88)",
          color: "oklch(0.18 0.01 200)",
          fontFamily: "'Inter', system-ui, sans-serif",
          opacity: 0.7,
          borderTop: "1px solid oklch(0.88 0.03 88)",
        }}
      >
        © 2026. Built with{" "}
        <span style={{ color: "oklch(0.72 0.14 72)" }}>♥</span> using{" "}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "oklch(0.38 0.12 155)",
            textDecoration: "underline",
            opacity: 1,
          }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

// ─── Routes ──────────────────────────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const charitableRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/charitable",
  component: CharitablePage,
});

const campaignDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/charitable/$campaignId",
  component: CampaignDetailPage,
});

const corporationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/corporations",
  component: CorporationsPage,
});

const cooperativesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cooperatives",
  component: CooperativesPage,
});

const daoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dao",
  component: DaoPage,
});

const volunteersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/volunteers",
  component: VolunteerBoardPage,
});

const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => <Navigate to="/" />,
});

// ─── Router ──────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  charitableRoute,
  campaignDetailRoute,
  corporationsRoute,
  cooperativesRoute,
  daoRoute,
  volunteersRoute,
  catchAllRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
