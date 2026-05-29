export const config = {
  appName: "Admin Dashboard",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api",
  authEndpoint: import.meta.env.VITE_AUTH_ENDPOINT ?? "/.ory/kratos/public",
  oathkeeperEndpoint: import.meta.env.VITE_OATHKEEPER_ENDPOINT ?? "/.oathkeeper",
  version: "1.0.0",
} as const;

export type AppConfig = typeof config;
