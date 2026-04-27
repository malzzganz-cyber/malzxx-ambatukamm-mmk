import { Link, useLocation } from "wouter";
import { Home, ShoppingCart, Wallet, User, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/order", icon: ShoppingCart, label: "Order" },
    { href: "/deposit", icon: Wallet, label: "Deposit" },
    { href: "/docs", icon: BookOpen, label: "Panduan" },
    { href: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <div className="mx-auto max-w-[420px] bg-background min-h-[100dvh] relative shadow-2xl overflow-hidden flex flex-col">
      <main className="flex-1 overflow-y-auto pb-[80px] scroll-smooth">
        {children}
      </main>

      <nav className="absolute bottom-0 left-0 right-0 h-[72px] bg-background/80 backdrop-blur-xl border-t z-50 flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  isActive ? "bg-primary/10" : "bg-transparent",
                )}
              >
                <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
