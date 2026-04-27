import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderHistory, useDepositHistory, useWithdrawHistory } from "@/hooks/use-local-storage";

const KEY_LAST_SYNCED = "malzz:lastSyncedSig";

function sig(items: Array<{ id: string; status?: string }>): string {
  return items.map((x) => `${x.id}:${x.status ?? ""}`).join("|");
}

export function HistorySync() {
  const { user, getToken } = useAuth();
  const [orders] = useOrderHistory();
  const [deposits] = useDepositHistory();
  const [withdraws] = useWithdrawHistory();
  const lastSentRef = useRef<string>("");

  useEffect(() => {
    if (!user) return;
    const fullSig = `${sig(orders)}#${sig(deposits)}#${sig(withdraws)}`;
    const stored = window.localStorage.getItem(KEY_LAST_SYNCED) || "";
    if (fullSig === stored && fullSig === lastSentRef.current) return;
    lastSentRef.current = fullSig;

    (async () => {
      const token = await getToken();
      if (!token) return;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const post = (kind: string, item: object) =>
        fetch(`/api/me/${kind}`, { method: "POST", headers, body: JSON.stringify(item) }).catch(() => {});
      await Promise.all([
        ...orders.map((o) => post("orders", o)),
        ...deposits.map((d) => post("deposits", d)),
        ...withdraws.map((w) => post("withdraws", w)),
      ]);
      window.localStorage.setItem(KEY_LAST_SYNCED, fullSig);
    })();
  }, [user, orders, deposits, withdraws, getToken]);

  return null;
}
