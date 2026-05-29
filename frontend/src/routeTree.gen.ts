// Route tree — organized in order of specificity
// More specific routes (with path) should come after less specific ones
// /users and /settings must appear after / in the children array

import { createRootRoute, createRoute } from "@tanstack/react-router";
import { RootLayout } from "./routes/__root";
import { DashboardPage } from "./routes/index";
import { UsersPage } from "./routes/users/index";
import { SettingsPage } from "./routes/settings";

// Root route
export const rootRoute = createRootRoute({
  component: RootLayout,
});

// Index (Dashboard) route
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

// Users route
export const UsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: UsersPage,
});

// Settings route
export const SettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

// Build the route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  UsersRoute,
  SettingsRoute,
]);
