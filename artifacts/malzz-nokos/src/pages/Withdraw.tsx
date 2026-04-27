import { useState } from "react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { useH2HProducts, useCheckRekening, useCreateWithdraw } from "@/hooks/use-nokos";
import { useWithdrawHistory } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRupiah } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Landmark, ArrowRight, UserCheck } from "lucide-react";

export default function Withdraw() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [withdraws, setWithdraws] = useWithdrawHistory();
  
  const { data: products, isLoading: isLoadingProducts } = useH2HProducts();
  const checkRekening = useCheckRekening();
  const createWithdraw = useCreateWithdraw();

  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [accountName, setAccountName] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!selectedProduct || !accountNumber) {
      toast({ title: "Inkomplit", description: "Pilih bank dan masukkan nomor rekening", variant: "destructive" });
      return;
    }
    
    try {
      const product = (products || []).find((p: any) => p.code === selectedProduct);
      if (!product) throw new Error("Produk tidak ditemukan");

      const res = await checkRekening.mutateAsync({
        bankCode: product.code,
        accountNumber
      });

      if (res && res.account_name) {
        setAccountName(res.account_name);
        toast({ title: "Rekening Valid", description: res.account_name });
      } else {
        toast({ title: "Tidak Ditemukan", description: "Rekening tidak dapat divalidasi", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Gagal Cek", description: e.message || "Gagal memvalidasi rekening", variant: "destructive" });
    }
  };

  const handleWithdraw = async () => {
    if (!selectedProduct || !accountNumber || !amount) return;
    const val = parseInt(amount.replace(/\D/g, ""));
    
    if (!val || val < 10000) {
      toast({ title: "Nominal tidak valid", description: "Minimal tarik Rp 10.000", variant: "destructive" });
      return;
    }

    try {
      const res = await createWithdraw.mutateAsync({
        target: accountNumber,
        id: selectedProduct
      });

      if (res && res.id) {
        const newWithdraw = {
          id: res.id,
          amount: res.amount || val,
          status: res.status || "pending",
          createdAt: new Date().toISOString()
        };
        setWithdraws([...withdraws, newWithdraw]);
        toast({ title: "Berhasil", description: "Penarikan sedang diproses" });
        setLocation(`/withdraw/${res.id}`);
      } else {
        throw new Error("Gagal membuat penarikan");
      }
    } catch (e: any) {
      toast({ title: "Gagal Tarik", description: e.message || "Terjadi kesalahan", variant: "destructive" });
    }
  };

  return (
    <PageTransition>
      <div className="p-4 pt-8 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Tarik Saldo</h1>
          <p className="text-sm text-muted-foreground mt-1">Transfer saldo ke rekening bank / e-wallet</p>
        </div>

        <Card className="border-none shadow-sm mb-4 bg-white dark:bg-card">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Landmark className="w-3 h-3" /> Bank / E-Wallet
              </label>
              <Select value={selectedProduct} onValueChange={(val) => { setSelectedProduct(val); setAccountName(null); }}>
                <SelectTrigger className="w-full h-12 bg-muted/30">
                  <SelectValue placeholder={isLoadingProducts ? "Memuat..." : "Pilih Tujuan"} />
                </SelectTrigger>
                <SelectContent>
                  {(products || []).map((p: any) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.name} {p.fee ? `(Biaya: ${formatRupiah(p.fee)})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                Nomor Rekening / HP
              </label>
              <div className="flex gap-2">
                <Input 
                  type="text" 
                  inputMode="numeric"
                  className="h-12 flex-1 bg-muted/30" 
                  placeholder="0812345..."
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value.replace(/\D/g, ""));
                    setAccountName(null);
                  }}
                />
                <Button 
                  variant="secondary" 
                  className="h-12 px-4" 
                  onClick={handleCheck}
                  disabled={checkRekening.isPending || !selectedProduct || !accountNumber}
                >
                  Cek
                </Button>
              </div>
            </div>

            {accountName && (
              <div className="bg-green-500/10 text-green-700 dark:text-green-500 p-3 rounded-xl flex items-center gap-3 text-sm font-semibold border border-green-500/20">
                <UserCheck className="w-5 h-5" />
                {accountName}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`border-none shadow-sm mb-6 transition-all duration-300 ${accountName ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                Nominal Penarikan
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
            <Button 
              className="w-full h-14 text-base font-bold rounded-2xl" 
              onClick={handleWithdraw}
              disabled={createWithdraw.isPending || !amount || !accountName}
            >
              {createWithdraw.isPending ? "Memproses..." : "Tarik Saldo"}
              {!createWithdraw.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="link" className="text-sm text-muted-foreground" onClick={() => setLocation("/admin")}>
            Riwayat Penarikan (Admin)
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
