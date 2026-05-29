// Route tree — organized in order of specificity
// More specific routes (with path) should come after less specific ones
// Auth routes (/login, /register, etc.) come before admin routes

import { createRootRoute, createRoute } from "@tanstack/react-router";
import { RootLayout } from "./routes/__root";
import { DashboardPage } from "./routes/index";
import { UsersPage } from "./routes/users/index";
import { SettingsPage } from "./routes/settings";
import { LoginPage } from "./routes/login";
import { RegisterPage } from "./routes/register";
import { RecoveryPage } from "./routes/recovery";
import { VerificationPage } from "./routes/verification";
import { ErrorPage } from "./routes/error";

// Root route
export const rootRoute = createRootRoute({
  component: RootLayout,
});

// Auth routes (no sidebar/navbar)
export const LoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

export const RegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

export const RecoveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recovery",
  component: RecoveryPage,
});

export const VerificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verification",
  component: VerificationPage,
});

export const ErrorRouteAlt = createRoute({
  getParentRoute: () => rootRoute,
  path: "/error",
  component: ErrorPage,
});

// Admin routes (with sidebar/navbar)
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

export const UsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: UsersPage,
});

export const SettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

// Build the route tree
export const routeTree = rootRoute.addChildren([
  // Auth routes first
  LoginRoute,
  RegisterRoute,
  RecoveryRoute,
  VerificationRoute,
  ErrorRouteAlt,
  // Admin routes
  indexRoute,
  UsersRoute,
  SettingsRoute,
]);
