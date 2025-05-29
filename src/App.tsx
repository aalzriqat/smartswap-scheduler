import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute, ManagerRoute, WorkFlowManagementRoute } from "@/components/auth/ProtectedRoute";
import { AuthPage } from "@/components/auth/AuthPage";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />

              {/* Manager and above routes */}
              <Route
                path="/team"
                element={
                  <ManagerRoute>
                    <div>Team Management Page (Coming Soon)</div>
                  </ManagerRoute>
                }
              />

              {/* WorkFlowManagement and above routes */}
              <Route
                path="/users"
                element={
                  <WorkFlowManagementRoute>
                    <div>User Management Page (Coming Soon)</div>
                  </WorkFlowManagementRoute>
                }
              />

              <Route
                path="/workflow-settings"
                element={
                  <WorkFlowManagementRoute>
                    <div>Workflow Settings Page (Coming Soon)</div>
                  </WorkFlowManagementRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
