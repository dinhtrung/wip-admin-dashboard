import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { AuthProvider } from "../context/auth-context";

export function RootLayout() {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
