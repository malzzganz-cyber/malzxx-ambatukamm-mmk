import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { useDepositStatus, useCancelDeposit } from "@/hooks/use-nokos";
import { useDepositHistory } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Clock, AlertTriangle, CheckCircle2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah } from "@/lib/api";

export default function DepositDetail() {
  const { depositId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deposits, setDeposits] = useDepositHistory();
  
  const { data: statusData } = useDepositStatus(depositId || "");
  const cancelDeposit = useCancelDeposit();

  const currentDeposit = deposits.find(d => d.id == depositId);
  const [timeLeft, setTimeLeft] = useState(5 * 60);

  useEffect(() => {
    if (!currentDeposit) return;
    const createdAt = new Date(currentDeposit.createdAt).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - createdAt) / 1000);
    const remaining = Math.max(0, (5 * 60) - diff);
    setTimeLeft(remaining);
  }, [currentDeposit]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (statusData && statusData.status && currentDeposit) {
      if (statusData.status !== currentDeposit.status) {
        const newDeposits = deposits.map(d => d.id == depositId ? { ...d, status: statusData.status } : d);
        setDeposits(newDeposits);
      }
    }
  }, [statusData, depositId, currentDeposit, deposits, setDeposits]);

  const handleCancel = async () => {
    if (!depositId) return;
    try {
      await cancelDeposit.mutateAsync(depositId);
      toast({ title: "Dibatalkan", description: "Deposit telah dibatalkan" });
      setLocation("/deposits");
    } catch (e) {
      toast({ title: "Gagal membatalkan", variant: "destructive" });
    }
  };

  if (!depositId || !currentDeposit) {
    return (
      <PageTransition>
        <div className="p-4 pt-12 flex flex-col items-center justify-center text-center h-[50vh]">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Deposit tidak ditemukan</p>
          <Button variant="link" onClick={() => setLocation("/deposits")}>Kembali ke Riwayat</Button>
        </div>
      </PageTransition>
    );
  }

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");
  const isFinished = ["success", "completed", "cancel", "expired"].includes(statusData?.status?.toLowerCase() || "");
  const qrImage = (currentDeposit as any).qrImage;

  return (
    <PageTransition>
      <div className="p-4 pt-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Pembayaran QRIS</h1>
          <p className="text-sm text-muted-foreground mt-1">Selesaikan pembayaran sebelum waktu habis</p>
        </div>

        <Card className="border-none shadow-md mb-6 overflow-hidden bg-white dark:bg-card relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-primary" />
          <CardContent className="p-6 text-center space-y-6">
            {!isFinished && (
              <div className="inline-flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full font-mono text-sm font-bold mx-auto mb-2 border border-red-200 dark:border-red-500/20">
                <Clock className="w-4 h-4" /> {mins}:{secs}
              </div>
            )}
            
            <div className="flex justify-center">
              {qrImage ? (
                <div className="p-2 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white">
                  <img src={qrImage} alt="QRIS" className="w-48 h-48 object-contain" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-muted/30 rounded-2xl flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed">
                  <QrCode className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-xs">QRIS tidak tersedia</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
              <h2 className="text-3xl font-bold text-primary">{formatRupiah(currentDeposit.amount)}</h2>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-dashed pt-4 mt-4">
              <span className="text-muted-foreground">Status</span>
              <span className="font-bold uppercase flex items-center gap-1">
                {statusData?.status?.toLowerCase() === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : null}
                {statusData?.status || currentDeposit.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {!isFinished && (
            <Button 
              variant="destructive" 
              className="w-full h-12 font-bold rounded-xl"
              onClick={handleCancel}
              disabled={cancelDeposit.isPending}
            >
              {cancelDeposit.isPending ? "Membatalkan..." : "Batalkan Deposit"}
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full h-12 font-bold rounded-xl bg-white dark:bg-card"
            onClick={() => setLocation("/deposits")}
          >
            Lihat Riwayat Deposit
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
