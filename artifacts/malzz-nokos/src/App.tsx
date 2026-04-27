import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileShell } from "@/components/MobileShell";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { HistorySync } from "@/components/HistorySync";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Order from "@/pages/Order";
import OrderDetail from "@/pages/OrderDetail";
import Orders from "@/pages/Orders";
import Deposit from "@/pages/Deposit";
import DepositDetail from "@/pages/DepositDetail";
import Deposits from "@/pages/Deposits";
import Withdraw from "@/pages/Withdraw";
import WithdrawDetail from "@/pages/WithdrawDetail";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import SignIn from "@/pages/SignIn";
import Docs from "@/pages/Docs";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    const redirect = encodeURIComponent(location);
    return <Redirect to={`/signin?from=${redirect}`} />;
  }
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Redirect to="/signin?from=%2Fadmin" />;
  if (!isAdmin) {
    return (
      <div className="p-6 pt-12 text-center">
        <h1 className="text-xl font-bold mb-2">Akses Ditolak</h1>
        <p className="text-sm text-muted-foreground">Halaman ini hanya untuk admin.</p>
      </div>
    );
  }
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/signin" component={SignIn} />
      <Route>
        <MobileShell>
          <HistorySync />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/docs" component={Docs} />
            <Route path="/order">
              <RequireAuth><Order /></RequireAuth>
            </Route>
            <Route path="/order/:orderId">
              <RequireAuth><OrderDetail /></RequireAuth>
            </Route>
            <Route path="/orders">
              <RequireAuth><Orders /></RequireAuth>
            </Route>
            <Route path="/deposit">
              <RequireAuth><Deposit /></RequireAuth>
            </Route>
            <Route path="/deposit/:depositId">
              <RequireAuth><DepositDetail /></RequireAuth>
            </Route>
            <Route path="/deposits">
              <RequireAuth><Deposits /></RequireAuth>
            </Route>
            <Route path="/withdraw">
              <RequireAdmin><Withdraw /></RequireAdmin>
            </Route>
            <Route path="/withdraw/:transaksiId">
              <RequireAdmin><WithdrawDetail /></RequireAdmin>
            </Route>
            <Route path="/admin">
              <RequireAdmin><Admin /></RequireAdmin>
            </Route>
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </MobileShell>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
