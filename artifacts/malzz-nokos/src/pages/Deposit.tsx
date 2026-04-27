import { useState } from "react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { useCreateDeposit } from "@/hooks/use-nokos";
import { useDepositHistory } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Wallet, QrCode } from "lucide-react";

const CHIPS = [10000, 25000, 50000, 100000, 250000];

export default function Deposit() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deposits, setDeposits] = useDepositHistory();
  const [amount, setAmount] = useState<string>("");
  
  const createDeposit = useCreateDeposit();

  const handleCreate = async () => {
    const val = parseInt(amount.replace(/\D/g, ""));
    if (!val || val < 10000) {
      toast({ title: "Nominal tidak valid", description: "Minimal deposit Rp 10.000", variant: "destructive" });
      return;
    }

    try {
      const res = await createDeposit.mutateAsync(val);
      if (res && res.id) {
        const newDeposit = {
          id: res.id,
          amount: res.amount || val,
          status: res.status || "pending",
          createdAt: new Date().toISOString(),
          qrImage: res.qrImage,
          qrString: res.qrString,
          total: res.total,
          fee: res.fee,
        };
        setDeposits([...deposits, newDeposit]);
        toast({ title: "Berhasil", description: "Silakan scan QRIS untuk membayar" });
        setLocation(`/deposit/${res.id}`);
      } else {
        throw new Error("Gagal membuat deposit");
      }
    } catch (e: any) {
      toast({ title: "Gagal Deposit", description: e.message || "Terjadi kesalahan", variant: "destructive" });
    }
  };

  return (
    <PageTransition>
      <div className="p-4 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Deposit Saldo</h1>
          <p className="text-sm text-muted-foreground mt-1">Top up saldo melalui QRIS Otomatis</p>
        </div>

        <Card className="border-none shadow-sm mb-6 bg-white dark:bg-card">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-center mb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Wallet className="w-3 h-3" /> Nominal Deposit
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Rp</span>
                <Input 
                  type="text" 
                  inputMode="numeric"
                  className="h-14 pl-12 text-lg font-bold bg-muted/30" 
                  placeholder="10.000"
                  value={amount}
                  onChange={(e) => {
                    const num = e.target.value.replace(/\D/g, "");
                    setAmount(num ? new Intl.NumberFormat('id-ID').format(parseInt(num)) : "");
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {CHIPS.map((chip) => (
                <Button 
                  key={chip} 
                  variant="outline" 
                  className={`h-10 text-xs font-semibold rounded-xl border-dashed hover:bg-primary/5 hover:text-primary hover:border-primary/50 ${amount.replace(/\D/g,"") === String(chip) ? "bg-primary/10 border-primary text-primary" : ""}`}
                  onClick={() => setAmount(new Intl.NumberFormat('id-ID').format(chip))}
                >
                  {chip / 1000}k
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full h-14 text-base font-bold rounded-2xl" 
          onClick={handleCreate}
          disabled={createDeposit.isPending || !amount}
        >
          {createDeposit.isPending ? "Memproses..." : "Buat QRIS"}
        </Button>

        <div className="mt-4 flex justify-center">
          <Button variant="link" className="text-sm text-muted-foreground" onClick={() => setLocation("/deposits")}>
            Lihat Riwayat Deposit
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
