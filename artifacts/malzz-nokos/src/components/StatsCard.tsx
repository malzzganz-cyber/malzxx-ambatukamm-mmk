import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/api";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  isCurrency?: boolean;
}

export function StatsCard({ title, value, icon: Icon, isCurrency = false }: StatsCardProps) {
  const displayValue = isCurrency && typeof value === 'number' ? formatRupiah(value) : value;
  
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-card">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <h4 className="text-lg font-bold text-foreground">{displayValue}</h4>
        </div>
      </CardContent>
    </Card>
  );
}
