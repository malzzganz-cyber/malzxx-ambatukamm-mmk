import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { useOrderStatus, useCancelOrder } from "@/hooks/use-nokos";
import { useOrderHistory } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrderDetail() {
  const { orderId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orders, setOrders] = useOrderHistory();
  
  const { data: statusData, isLoading } = useOrderStatus(orderId || "");
  const cancelOrder = useCancelOrder();

  const [timeLeft, setTimeLeft] = useState(20 * 60);

  const currentOrder = orders.find(o => o.id == orderId);

  useEffect(() => {
    if (!currentOrder) return;
    const createdAt = new Date(currentOrder.createdAt).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - createdAt) / 1000);
    const remaining = Math.max(0, (20 * 60) - diff);
    setTimeLeft(remaining);
  }, [currentOrder]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (statusData && statusData.status && currentOrder) {
      if (statusData.status !== currentOrder.status) {
        const newOrders = orders.map(o => o.id == orderId ? { ...o, status: statusData.status } : o);
        setOrders(newOrders);
      }
    }
  }, [statusData, orderId, currentOrder, orders, setOrders]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Tersalin", description: `${type} berhasil disalin` });
  };

  const handleCancel = async () => {
    if (!orderId) return;
    try {
      await cancelOrder.mutateAsync(orderId);
      toast({ title: "Dibatalkan", description: "Pesanan telah dibatalkan" });
      setLocation("/orders");
    } catch (e) {
      toast({ title: "Gagal membatalkan", variant: "destructive" });
    }
  };

  if (!orderId || !currentOrder) {
    return (
      <PageTransition>
        <div className="p-4 pt-12 flex flex-col items-center justify-center text-center h-[50vh]">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Pesanan tidak ditemukan</p>
          <Button variant="link" onClick={() => setLocation("/orders")}>Kembali ke Riwayat</Button>
        </div>
      </PageTransition>
    );
  }

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");
  
  const isFinished = ["success", "completed", "cancel", "expired"].includes(statusData?.status?.toLowerCase() || "");

  return (
    <PageTransition>
      <div className="p-4 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Detail Pesanan</h1>
          <p className="text-sm text-muted-foreground mt-1">ID: {orderId}</p>
        </div>

        <Card className="border-primary/20 shadow-md mb-6 overflow-hidden bg-primary/5">
          <div className="bg-primary px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-bold text-primary-foreground uppercase tracking-wider">
              {currentOrder.serviceName}
            </span>
            <span className="text-xs font-bold text-primary-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {mins}:{secs}
            </span>
          </div>
          <CardContent className="p-6 text-center space-y-4">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Nomor Handphone</p>
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl font-mono font-bold tracking-tight">+{statusData?.number || currentOrder.number || "..."}</h2>
                <button onClick={() => handleCopy(`+${statusData?.number || currentOrder.number}`, "Nomor")} className="p-2 bg-white dark:bg-card rounded-full shadow-sm active:scale-95 transition-transform text-primary">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm mb-6 bg-white dark:bg-card">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Kode OTP</p>
              {statusData?.otp ? (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center justify-center gap-4">
                  <span className="text-4xl font-mono font-bold text-green-600 dark:text-green-500 tracking-widest">{statusData.otp}</span>
                  <button onClick={() => handleCopy(statusData.otp, "OTP")} className="p-2 bg-white dark:bg-card rounded-full shadow-sm active:scale-95 transition-transform text-green-600">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="bg-muted/30 p-6 rounded-xl flex flex-col items-center justify-center border border-dashed">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-sm font-medium text-muted-foreground">Menunggu SMS/OTP...</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-sm border-t pt-4 mt-4">
              <span className="text-muted-foreground">Status</span>
              <span className="font-bold uppercase flex items-center gap-1">
                {statusData?.status?.toLowerCase() === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : null}
                {statusData?.status || currentOrder.status}
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
              disabled={cancelOrder.isPending}
            >
              {cancelOrder.isPending ? "Membatalkan..." : "Batalkan Pesanan"}
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full h-12 font-bold rounded-xl bg-white dark:bg-card"
            onClick={() => setLocation("/orders")}
          >
            Kembali ke Riwayat
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
