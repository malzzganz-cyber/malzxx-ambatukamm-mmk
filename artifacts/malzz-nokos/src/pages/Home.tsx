import { PageTransition } from "@/components/PageTransition";
import { useStats, useTestimonials } from "@/hooks/use-nokos";
import { StatsCard } from "@/components/StatsCard";
import { Users, ShoppingCart, Activity, PlusCircle, Wallet, ArrowUpRight, ShieldAlert, Star, type LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/api";
import { useState } from "react";
import { TestimonialDialog } from "@/components/TestimonialDialog";

export default function Home() {
  const { data: stats } = useStats();
  const { data: testimonials } = useTestimonials();
  const [isTestiOpen, setIsTestiOpen] = useState(false);

  return (
    <PageTransition>
      <div className="pb-10">
        {/* Hero Section */}
        <div className="bg-gradient-primary pt-12 pb-20 px-6 rounded-b-[2rem] text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Malzz Nokos</h1>
            <p className="text-white/80 text-sm font-medium">Layanan OTP & Nomor Virtual Terpercaya</p>
            
            <div className="mt-8">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">TOTAL TRANSAKSI</p>
              <h2 className="text-4xl font-bold">{stats?.totalTransactions ? formatRupiah(stats.totalTransactions) : "Rp 0"}</h2>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-4 -mt-10 relative z-20 grid grid-cols-2 gap-3">
          <StatsCard title="Pengguna" value={stats?.totalUsers || 0} icon={Users} />
          <StatsCard title="Order" value={stats?.totalOrders || 0} icon={ShoppingCart} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 mt-8">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 px-1">Menu Utama</h3>
          <div className="grid grid-cols-4 gap-4">
            <QuickAction href="/order" icon={ShoppingCart} label="Order" color="bg-blue-500" />
            <QuickAction href="/deposit" icon={Wallet} label="Deposit" color="bg-green-500" />
            <QuickAction href="/withdraw" icon={ArrowUpRight} label="Tarik" color="bg-orange-500" />
            <QuickAction href="/admin" icon={ShieldAlert} label="Admin" color="bg-purple-500" />
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-10 pl-4 pr-0">
          <div className="flex items-center justify-between pr-4 mb-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Testimoni</h3>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setIsTestiOpen(true)}>Tulis Testimoni</Button>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar pr-4">
            {(testimonials || []).map((t: any, i: number) => (
              <div key={i} className="snap-center shrink-0 w-[280px] bg-white dark:bg-card p-4 rounded-2xl shadow-sm border">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`w-4 h-4 ${j < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 mb-3 line-clamp-3">"{t.comment}"</p>
                <p className="text-xs font-bold text-foreground">{t.name}</p>
              </div>
            ))}
            {(!testimonials || testimonials.length === 0) && (
              <div className="snap-center shrink-0 w-[280px] bg-white dark:bg-card p-4 rounded-2xl shadow-sm border flex items-center justify-center text-muted-foreground text-sm">
                Belum ada testimoni.
              </div>
            )}
          </div>
        </div>
      </div>
      <TestimonialDialog open={isTestiOpen} onOpenChange={setIsTestiOpen} />
    </PageTransition>
  );
}

function QuickAction({ href, icon: Icon, label, color }: { href: string; icon: LucideIcon; label: string; color: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-[11px] font-semibold text-foreground/80">{label}</span>
    </Link>
  );
}
