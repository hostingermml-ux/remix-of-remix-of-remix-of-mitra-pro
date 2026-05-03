import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import AppLayout from "./layouts/AppLayout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Profile from "./pages/Profile.tsx";
import Staff from "./pages/master/Staff.tsx";
import Affiliates from "./pages/master/Affiliates.tsx";
import Customers from "./pages/master/Customers.tsx";
import Permissions from "./pages/master/Permissions.tsx";
import Campaigns from "./pages/campaign/Campaigns.tsx";
import Blast from "./pages/campaign/Blast.tsx";
import Approval from "./pages/campaign/Approval.tsx";
import Running from "./pages/campaign/Running.tsx";
import Reports from "./pages/campaign/Reports.tsx";
import Payments from "./pages/Payments.tsx";

const queryClient = new QueryClient();

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/app" replace />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="staff" element={<RequireAdmin><Staff /></RequireAdmin>} />
              <Route path="affiliates" element={<RequireAdmin><Affiliates /></RequireAdmin>} />
              <Route path="customers" element={<RequireAdmin><Customers /></RequireAdmin>} />
              <Route path="permissions" element={<RequireAdmin><Permissions /></RequireAdmin>} />
              <Route path="campaigns" element={<RequireAdmin><Campaigns /></RequireAdmin>} />
              <Route path="blast" element={<Blast />} />
              <Route path="approval" element={<RequireAdmin><Approval /></RequireAdmin>} />
              <Route path="running" element={<Running />} />
              <Route path="reports" element={<Reports />} />
              <Route path="payments" element={<Payments />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
