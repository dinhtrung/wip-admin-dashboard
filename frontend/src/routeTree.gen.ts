// Route tree — auth routes first, then admin routes
// User sub-routes nested under /users

import { createRootRoute, createRoute } from "@tanstack/react-router";
import { RootLayout } from "./routes/__root";
import { DashboardPage } from "./routes/index";
import { UsersPage } from "./routes/users/index";
import { UserDetailPage } from "./routes/users/$userId";
import { RolesPage } from "./routes/users/roles";
import { ActivityPage } from "./routes/users/activity";
import { BulkPage } from "./routes/users/bulk";
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

export const ErrorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/error",
  component: ErrorPage,
});

// Dashboard route
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

// Users parent route (layout-less, just a grouping)
export const UsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
});

// Users sub-routes
export const UsersIndexRoute = createRoute({
  getParentRoute: () => UsersRoute,
  path: "/",
  component: UsersPage,
});

export const UserDetailRoute = createRoute({
  getParentRoute: () => UsersRoute,
  path: "/$userId",
  component: UserDetailPage,
});

export const RolesRoute = createRoute({
  getParentRoute: () => UsersRoute,
  path: "/roles",
  component: RolesPage,
});

export const ActivityLogRoute = createRoute({
  getParentRoute: () => UsersRoute,
  path: "/activity",
  component: ActivityPage,
});

export const BulkRoute = createRoute({
  getParentRoute: () => UsersRoute,
  path: "/bulk",
  component: BulkPage,
});

// Settings route
export const SettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

// Build the route tree
export const routeTree = rootRoute.addChildren([
  // Auth routes
  LoginRoute,
  RegisterRoute,
  RecoveryRoute,
  VerificationRoute,
  ErrorRoute,
  // Admin routes
  indexRoute,
  UsersRoute.addChildren([
    UsersIndexRoute,
    UserDetailRoute,
    RolesRoute,
    ActivityLogRoute,
    BulkRoute,
  ]),
  SettingsRoute,
]);
