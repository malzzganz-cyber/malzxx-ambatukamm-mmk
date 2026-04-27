import { PageTransition } from "@/components/PageTransition";
import { useAdminBalance } from "@/hooks/use-nokos";
import { useWithdrawHistory } from "@/hooks/use-local-storage";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ShieldAlert, ArrowUpRight, CheckCircle2, Clock, XCircle, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { formatRupiah } from "@/lib/api";

export default function Admin() {
  const { data: balanceData } = useAdminBalance();
  const [withdraws] = useWithdrawHistory();

  const sortedWithdraws = [...withdraws].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <PageTransition>
      <div className="p-4 pt-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 text-purple-500 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola saldo & penarikan</p>
          </div>
        </div>

        <Card className="border-none shadow-md mb-8 bg-gradient-to-br from-purple-500 to-indigo-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
          <CardContent className="p-6">
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-2">Saldo Pusat H2H</p>
            <h2 className="text-3xl font-bold tracking-tight">
              {balanceData?.balance !== undefined ? formatRupiah(balanceData.balance) : "Memuat..."}
            </h2>
          </CardContent>
        </Card>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Riwayat Penarikan</h3>
        </div>

        <div className="space-y-3">
          {sortedWithdraws.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-card rounded-2xl border shadow-sm">
              <ArrowUpRight className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Belum ada transaksi</p>
            </div>
          ) : (
            sortedWithdraws.map((w) => {
              const st = w.status?.toLowerCase();
              const isSuccess = st === 'success' || st === 'completed';
              const isFailed = st === 'cancel' || st === 'expired' || st === 'failed';
              
              return (
                <Link key={w.id} href={`/withdraw/${w.id}`}>
                  <Card className="border-none shadow-sm hover-elevate active:scale-[0.98] transition-all cursor-pointer bg-white dark:bg-card">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isSuccess ? 'bg-green-500/10 text-green-500' : isFailed ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : isFailed ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm text-foreground">Tarik Saldo</h4>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(w.createdAt), "dd MMM HH:mm")}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-orange-500">{formatRupiah(w.amount)}</p>
                          <span className={`text-[10px] font-bold uppercase ${isSuccess ? 'text-green-500' : isFailed ? 'text-red-500' : 'text-blue-500'}`}>
                            {w.status}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </PageTransition>
  );
}
