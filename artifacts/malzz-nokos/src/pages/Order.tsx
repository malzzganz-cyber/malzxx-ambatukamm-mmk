import { useState } from "react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { useServices, useCountries, useOperators, useOrderNumber } from "@/hooks/use-nokos";
import { useOrderHistory } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, PhoneCall, Globe2, Signal } from "lucide-react";

export default function Order() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orders, setOrders] = useOrderHistory();

  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedCountryKey, setSelectedCountryKey] = useState<string>("");
  const [selectedOperator, setSelectedOperator] = useState<string>("");

  const { data: services, isLoading: isLoadingServices } = useServices();
  const { data: countries, isLoading: isLoadingCountries } = useCountries(selectedService);

  const selectedCountry = (countries || []).find((c) => `${c.numberId}|${c.providerId}` === selectedCountryKey);
  const { data: operators, isLoading: isLoadingOperators } = useOperators(
    selectedCountry?.countryName || "",
    selectedCountry?.providerId || ""
  );

  const orderNumber = useOrderNumber();

  const handleOrder = async () => {
    if (!selectedService || !selectedCountry || !selectedCountry.providerId) {
      toast({ title: "Pilih layanan", description: "Harap pilih layanan dan negara/provider", variant: "destructive" });
      return;
    }

    try {
      const res = await orderNumber.mutateAsync({
        serviceId: selectedService,
        providerId: selectedCountry.providerId,
        operatorId: selectedOperator || ""
      });

      const orderId = res?.id;
      if (orderId) {
        const serviceName = services?.find((s) => s.id === selectedService)?.name || selectedCountry?.countryName || "Pesanan";

        const newOrder = {
          id: orderId,
          number: res?.number || "",
          serviceName,
          status: res?.status || "pending",
          createdAt: new Date().toISOString()
        };

        setOrders([...orders, newOrder]);
        toast({ title: "Pesanan Dibuat", description: "Berhasil memesan nomor" });
        setLocation(`/order/${orderId}`);
      } else {
        throw new Error("Gagal mendapatkan order_id");
      }
    } catch (error: any) {
      toast({ title: "Gagal Pesan", description: error.message || "Terjadi kesalahan sistem", variant: "destructive" });
    }
  };

  const currentPrice = selectedCountry?.price;
  const currentPriceFormat = selectedCountry?.priceFormat;

  return (
    <PageTransition>
      <div className="p-4 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Order Nokos</h1>
          <p className="text-sm text-muted-foreground mt-1">Pilih layanan yang Anda butuhkan</p>
        </div>

        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <PhoneCall className="w-3 h-3" /> Layanan Aplikasi
              </label>
              <Select value={selectedService} onValueChange={(val) => { setSelectedService(val); setSelectedCountryKey(""); setSelectedOperator(""); }}>
                <SelectTrigger className="w-full h-12 bg-muted/30">
                  <SelectValue placeholder={isLoadingServices ? "Memuat..." : "Pilih Aplikasi (WhatsApp, Telegram...)"} />
                </SelectTrigger>
                <SelectContent>
                  {(services || []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Globe2 className="w-3 h-3" /> Negara &amp; Provider
              </label>
              <Select value={selectedCountryKey} onValueChange={(val) => {
                setSelectedCountryKey(val);
                setSelectedOperator("");
              }} disabled={!selectedService}>
                <SelectTrigger className="w-full h-12 bg-muted/30">
                  <SelectValue placeholder={isLoadingCountries ? "Memuat..." : "Pilih Negara"} />
                </SelectTrigger>
                <SelectContent>
                  {(countries || []).map((c, i) => {
                    const key = `${c.numberId}|${c.providerId}`;
                    const priceLabel = c.priceFormat || (typeof c.price === "number" ? formatRupiah(c.price) : "");
                    const stockLabel = typeof c.stock === "number" ? ` (stok ${c.stock})` : "";
                    return (
                      <SelectItem key={`${key}-${i}`} value={key} disabled={!c.providerId || !c.available}>
                        {c.countryName} {priceLabel ? `- ${priceLabel}` : ""}{stockLabel}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Signal className="w-3 h-3" /> Operator (opsional)
              </label>
              <Select value={selectedOperator} onValueChange={setSelectedOperator} disabled={!selectedCountry?.providerId}>
                <SelectTrigger className="w-full h-12 bg-muted/30">
                  <SelectValue placeholder={isLoadingOperators ? "Memuat..." : "Pilih Operator (opsional)"} />
                </SelectTrigger>
                <SelectContent>
                  {(operators || []).map((o: any, i: number) => {
                    const opId = String(o?.id ?? o?.operator_id ?? `auto-${i}`);
                    return (
                      <SelectItem key={`${opId}-${i}`} value={opId}>
                        {o?.name || o?.operator_name || `Operator ${i + 1}`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {(currentPriceFormat || typeof currentPrice === "number") && (
          <div className="flex items-center justify-between mb-6 p-4 bg-primary/10 rounded-2xl border border-primary/20">
            <span className="text-sm font-semibold text-primary">Estimasi Harga</span>
            <span className="text-lg font-bold text-primary">
              {currentPriceFormat || formatRupiah(currentPrice as number)}
            </span>
          </div>
        )}

        <Button
          className="w-full h-14 text-base font-bold rounded-2xl"
          onClick={handleOrder}
          disabled={!selectedCountry?.providerId || orderNumber.isPending}
        >
          {orderNumber.isPending ? "Memproses..." : "Pesan Nomor Sekarang"}
        </Button>
        
        <div className="mt-4 flex justify-center">
          <Button variant="link" className="text-sm text-muted-foreground" onClick={() => setLocation("/orders")}>
            Lihat Riwayat Pesanan
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
