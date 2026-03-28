import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GlobalLoadingBar from "@/components/GlobalLoadingBar";
import CookieConsent from "@/components/CookieConsent";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load pages
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Support = lazy(() => import("./pages/Support"));
const PatientPage = lazy(() => import("./pages/PatientPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Stats = lazy(() => import("./pages/Stats"));
const Pricing = lazy(() => import("./pages/Pricing"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const AdminFoods = lazy(() => import("./pages/AdminFoods"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminFinanceiro = lazy(() => import("./pages/AdminFinanceiro"));
const ReferralRedirect = lazy(() => import("./pages/ReferralRedirect"));
const ShareKit = lazy(() => import("./pages/ShareKit"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Billing = lazy(() => import("./pages/Billing"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      networkMode: 'offlineFirst',
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="animate-spin h-8 w-8 text-primary" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GlobalLoadingBar />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<PatientPage />} />
                <Route path="/lp" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/planos" element={<Pricing />} />
                <Route path="/assinatura/sucesso" element={<SubscriptionSuccess />} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/ref/:code" element={<ReferralRedirect />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/dashboard/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
                <Route path="/dashboard/financeiro" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                <Route path="/dashboard/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                <Route path="/compartilhar" element={<ProtectedRoute><ShareKit /></ProtectedRoute>} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="/admin/suporte" element={<AdminRoute><AdminSupport /></AdminRoute>} />
                <Route path="/admin/alimentos" element={<AdminRoute><AdminFoods /></AdminRoute>} />
                <Route path="/admin/categorias" element={<AdminRoute><AdminCategories /></AdminRoute>} />
                <Route path="/admin/financeiro" element={<AdminRoute><AdminFinanceiro /></AdminRoute>} />
                <Route path="/novidades" element={<Changelog />} />
                <Route path="/:slug" element={<PatientPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <CookieConsent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
