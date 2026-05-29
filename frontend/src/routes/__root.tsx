import { Outlet, useLocation } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { AuthProvider } from "../context/auth-context";

// Routes that should NOT show the sidebar/navbar (auth pages)
const AUTH_ROUTES = ["/login", "/register", "/recovery", "/verification", "/error"];

export function RootLayout() {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  return (
    <AuthProvider>
      {isAuthPage ? (
        <Outlet />
      ) : (
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-6">
              <Outlet />
            </main>
          </div>
        </div>
      )}
    </AuthProvider>
  );
}
