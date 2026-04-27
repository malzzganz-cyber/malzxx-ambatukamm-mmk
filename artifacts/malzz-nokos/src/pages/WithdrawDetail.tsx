import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { useWithdrawStatus } from "@/hooks/use-nokos";
import { useWithdrawHistory } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, ArrowUpRight, Clock, XCircle } from "lucide-react";
import { formatRupiah } from "@/lib/api";

export default function WithdrawDetail() {
  const { transaksiId } = useParams();
  const [, setLocation] = useLocation();
  const [withdraws, setWithdraws] = useWithdrawHistory();
  
  const { data: statusData } = useWithdrawStatus(transaksiId || "");

  const currentWithdraw = withdraws.find(w => w.id == transaksiId);

  useEffect(() => {
    if (statusData && statusData.status && currentWithdraw) {
      if (statusData.status !== currentWithdraw.status) {
        const newWithdraws = withdraws.map(w => w.id == transaksiId ? { ...w, status: statusData.status } : w);
        setWithdraws(newWithdraws);
      }
    }
  }, [statusData, transaksiId, currentWithdraw, withdraws, setWithdraws]);

  if (!transaksiId || !currentWithdraw) {
    return (
      <PageTransition>
        <div className="p-4 pt-12 flex flex-col items-center justify-center text-center h-[50vh]">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Transaksi tidak ditemukan</p>
          <Button variant="link" onClick={() => setLocation("/admin")}>Kembali</Button>
        </div>
      </PageTransition>
    );
  }

  const st = (statusData?.status || currentWithdraw.status).toLowerCase();
  const isSuccess = st === 'success' || st === 'completed';
  const isFailed = st === 'cancel' || st === 'expired' || st === 'failed';

  return (
    <PageTransition>
      <div className="p-4 pt-8">
        <div className="mb-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isSuccess ? 'bg-green-500/20 text-green-500' : isFailed ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
            {isSuccess ? <CheckCircle2 className="w-8 h-8" /> : isFailed ? <XCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-foreground">Status Penarikan</h1>
          <p className="text-sm text-muted-foreground mt-1">ID: {transaksiId}</p>
        </div>

        <Card className="border-none shadow-md mb-6 overflow-hidden bg-white dark:bg-card">
          <CardContent className="p-6 text-center space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nominal Tarik</p>
              <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                {formatRupiah(currentWithdraw.amount)}
                <ArrowUpRight className="w-6 h-6 text-orange-500" />
              </h2>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-dashed pt-4 mt-4">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-bold uppercase flex items-center gap-1 ${isSuccess ? 'text-green-500' : isFailed ? 'text-red-500' : 'text-blue-500'}`}>
                {statusData?.status || currentWithdraw.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          className="w-full h-12 font-bold rounded-xl bg-white dark:bg-card"
          onClick={() => setLocation("/admin")}
        >
          Lihat Riwayat Penarikan
        </Button>
      </div>
    </PageTransition>
  );
}
