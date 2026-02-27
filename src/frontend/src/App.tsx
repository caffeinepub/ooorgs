import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  Outlet,
  Navigate,
} from "@tanstack/react-router";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import CharitablePage from "./pages/CharitablePage";
import CorporationsPage from "./pages/CorporationsPage";
import CooperativesPage from "./pages/CooperativesPage";
import DaoPage from "./pages/DaoPage";

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

const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => <Navigate to="/" />,
});

// ─── Router ──────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  charitableRoute,
  corporationsRoute,
  cooperativesRoute,
  daoRoute,
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
