import { PageTransition } from "@/components/PageTransition";
import { useDepositHistory } from "@/hooks/use-local-storage";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Wallet, ChevronRight, CheckCircle2, Clock, XCircle, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { formatRupiah } from "@/lib/api";

export default function Deposits() {
  const [deposits] = useDepositHistory();

  const sortedDeposits = [...deposits].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <PageTransition>
      <div className="p-4 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Riwayat Deposit</h1>
            <p className="text-sm text-muted-foreground mt-1">{deposits.length} transaksi</p>
          </div>
          <Link href="/deposit" className="p-3 bg-primary/10 rounded-full text-primary hover:bg-primary/20 transition-colors">
            <PlusCircle className="w-5 h-5" />
          </Link>
        </div>

        <div className="space-y-3">
          {sortedDeposits.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-card rounded-2xl border shadow-sm">
              <Wallet className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Belum ada deposit</p>
            </div>
          ) : (
            sortedDeposits.map((deposit) => {
              const st = deposit.status?.toLowerCase();
              const isSuccess = st === 'success' || st === 'completed';
              const isFailed = st === 'cancel' || st === 'expired' || st === 'failed';
              
              return (
                <Link key={deposit.id} href={`/deposit/${deposit.id}`}>
                  <Card className="border-none shadow-sm hover-elevate active:scale-[0.98] transition-all cursor-pointer bg-white dark:bg-card">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isSuccess ? 'bg-green-500/10 text-green-500' : isFailed ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : isFailed ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm">QRIS Deposit</h4>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(deposit.createdAt), "dd MMM HH:mm")}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-foreground">{formatRupiah(deposit.amount)}</p>
                          <span className={`text-[10px] font-bold uppercase ${isSuccess ? 'text-green-500' : isFailed ? 'text-red-500' : 'text-blue-500'}`}>
                            {deposit.status}
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
