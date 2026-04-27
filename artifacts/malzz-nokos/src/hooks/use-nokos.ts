import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pickArray, pickObject } from "@/lib/api";
import { getIdToken } from "@/lib/firebase";

const fetcher = async (url: string, options?: RequestInit) => {
  const token = await getIdToken().catch(() => null);
  const headers = new Headers(options?.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(json?.error?.message || json?.message || `Gagal memuat ${url}`);
  }
  if (json && typeof json === "object" && json.success === false) {
    throw new Error(json.error?.message || "Permintaan gagal");
  }
  return json;
};

export interface NormalizedService {
  id: string;
  name: string;
  image?: string;
  raw: any;
}

export interface NormalizedCountryProvider {
  countryName: string;
  numberId: string;
  countryImg?: string;
  prefix?: string;
  isoCode?: string;
  providerId: string;
  serverId?: number;
  stock?: number;
  rate?: number;
  price?: number;
  priceFormat?: string;
  available: boolean;
}

export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => fetcher("/api/stats"),
  });
};

export const useTestimonials = () => {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: () => fetcher("/api/testimonials").then(data => pickArray(data, ["items", "data"])),
  });
};

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; rating: number; comment: string }) =>
      fetcher("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
};

export const useServices = () => {
  return useQuery<NormalizedService[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const json = await fetcher("/api/rumahotp/services");
      const arr = pickArray(json, ["data", "services"]);
      return arr.map((s: any) => ({
        id: String(s.service_code ?? s.id ?? ""),
        name: String(s.service_name ?? s.name ?? "Unknown"),
        image: s.service_img ?? s.image,
        raw: s,
      })).filter((s: NormalizedService) => s.id);
    },
  });
};

export const useCountries = (serviceId: string) => {
  return useQuery<NormalizedCountryProvider[]>({
    queryKey: ["countries", serviceId],
    queryFn: async () => {
      const json = await fetcher(`/api/rumahotp/countries?service_id=${serviceId}`);
      const countries = pickArray(json, ["data"]);
      const out: NormalizedCountryProvider[] = [];
      for (const c of countries) {
        const pricelist = Array.isArray(c?.pricelist) ? c.pricelist : [];
        if (pricelist.length === 0) {
          // Some countries may not have pricelist; emit a single placeholder row
          out.push({
            countryName: String(c?.name ?? "Unknown"),
            numberId: String(c?.number_id ?? c?.id ?? ""),
            countryImg: c?.img,
            prefix: c?.prefix,
            isoCode: c?.iso_code,
            providerId: "",
            available: false,
          });
          continue;
        }
        for (const p of pricelist) {
          out.push({
            countryName: String(c?.name ?? "Unknown"),
            numberId: String(c?.number_id ?? c?.id ?? ""),
            countryImg: c?.img,
            prefix: c?.prefix,
            isoCode: c?.iso_code,
            providerId: String(p?.provider_id ?? ""),
            serverId: p?.server_id,
            stock: typeof p?.stock === "number" ? p.stock : undefined,
            rate: typeof p?.rate === "number" ? p.rate : undefined,
            price: typeof p?.price === "number" ? p.price : undefined,
            priceFormat: p?.price_format,
            available: p?.available !== false,
          });
        }
      }
      // Sort: available first, then cheapest price first
      out.sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1;
        return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER);
      });
      return out;
    },
    enabled: !!serviceId,
  });
};

export const useOperators = (countryName: string, providerId: string) => {
  return useQuery({
    queryKey: ["operators", countryName, providerId],
    queryFn: () => fetcher(`/api/rumahotp/operators?country=${countryName}&provider_id=${providerId}`).then(data => pickArray(data, ["data"])),
    enabled: !!countryName && !!providerId,
  });
};

function normalizeOrder(raw: any) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: String(raw.id ?? raw.order_id ?? raw.orderId ?? ""),
    number: String(raw.number ?? raw.phone_number ?? raw.phone ?? ""),
    status: String(raw.status ?? "pending"),
    otp: raw.otp ?? raw.sms ?? raw.code ?? null,
    createdAt: raw.created_at ?? raw.createdAt ?? null,
    expiredAt: raw.expired_at ?? raw.expiredAt ?? null,
    serviceName: raw.service_name ?? raw.serviceName,
    raw,
  };
}

export const useOrderNumber = () => {
  return useMutation({
    mutationFn: async ({ serviceId, providerId, operatorId }: { serviceId: string; providerId: string; operatorId: string }) => {
      const json = await fetcher(`/api/rumahotp/order?number_id=${serviceId}&provider_id=${providerId}&operator_id=${operatorId}`);
      return normalizeOrder(pickObject(json, ["data", "result"]));
    },
  });
};

export const useOrderStatus = (orderId: string) => {
  return useQuery({
    queryKey: ["order-status", orderId],
    queryFn: async () => {
      const json = await fetcher(`/api/rumahotp/order-status?order_id=${orderId}`);
      return normalizeOrder(pickObject(json, ["data", "result"]));
    },
    enabled: !!orderId,
    refetchInterval: (query) => {
      const status = (query.state?.data as any)?.status?.toLowerCase() || "";
      if (["success", "completed", "expired", "cancel"].includes(status)) {
        return false;
      }
      return 15000;
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => fetcher(`/api/rumahotp/order-cancel?order_id=${orderId}`),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["order-status", orderId] });
    }
  });
};

function normalizeDeposit(raw: any) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: String(raw.id ?? raw.deposit_id ?? raw.depositId ?? ""),
    status: String(raw.status ?? "pending"),
    method: raw.method ?? "qris",
    amount: Number(raw.diterima ?? raw.amount ?? raw.currency?.diterima ?? 0),
    total: Number(raw.total ?? raw.currency?.total ?? 0),
    fee: Number(raw.fee ?? raw.currency?.fee ?? 0),
    qrImage: raw.qr_image ?? raw.qrImage ?? raw.image_url ?? "",
    qrString: raw.qr_string ?? raw.qrString ?? "",
    createdAt: raw.created_at ?? raw.createdAt ?? null,
    expiredAt: raw.expired_at ?? raw.expiredAt ?? null,
    raw,
  };
}

export const useCreateDeposit = () => {
  return useMutation({
    mutationFn: async (amount: number) => {
      const json = await fetcher(`/api/rumahotp/deposit-create?amount=${amount}`);
      return normalizeDeposit(pickObject(json, ["data", "result"]));
    },
  });
};

export const useDepositStatus = (depositId: string) => {
  return useQuery({
    queryKey: ["deposit-status", depositId],
    queryFn: async () => {
      const json = await fetcher(`/api/rumahotp/deposit-status?deposit_id=${depositId}`);
      return normalizeDeposit(pickObject(json, ["data", "result"]));
    },
    enabled: !!depositId,
    refetchInterval: (query) => {
      const status = (query.state?.data as any)?.status?.toLowerCase() || "";
      if (["success", "completed", "expired", "cancel", "failed"].includes(status)) {
        return false;
      }
      return 15000;
    },
  });
};

export const useCancelDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (depositId: string) => fetcher(`/api/rumahotp/deposit-cancel?deposit_id=${depositId}`),
    onSuccess: (_, depositId) => {
      queryClient.invalidateQueries({ queryKey: ["deposit-status", depositId] });
    }
  });
};

export const useAdminBalance = () => {
  return useQuery({
    queryKey: ["admin-balance"],
    queryFn: () => fetcher("/api/rumahotp/admin-balance").then(data => pickObject(data, ["data", "result"])),
  });
};

export const useH2HProducts = () => {
  return useQuery({
    queryKey: ["h2h-products"],
    queryFn: () => fetcher("/api/rumahotp/h2h-product").then(data => pickArray(data, ["data"])),
  });
};

export const useCheckRekening = () => {
  return useMutation({
    mutationFn: ({ bankCode, accountNumber }: { bankCode: string; accountNumber: string }) =>
      fetcher(`/api/rumahotp/h2h-check-rekening?bank_code=${bankCode}&account_number=${accountNumber}`).then(data => pickObject(data, ["data", "result"])),
  });
};

function normalizeWithdraw(raw: any) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: String(raw.id ?? raw.transaksi_id ?? raw.transaksiId ?? ""),
    status: String(raw.status ?? "pending"),
    target: raw.target ?? raw.account_number ?? "",
    productName: raw.product_name ?? raw.productName ?? "",
    accountName: raw.account_name ?? raw.accountName ?? "",
    amount: Number(raw.amount ?? raw.nominal ?? 0),
    fee: Number(raw.fee ?? 0),
    createdAt: raw.created_at ?? raw.createdAt ?? null,
    raw,
  };
}

export const useCreateWithdraw = () => {
  return useMutation({
    mutationFn: async ({ target, id }: { target: string; id: string }) => {
      const json = await fetcher(`/api/rumahotp/h2h-create?target=${target}&id=${id}`);
      return normalizeWithdraw(pickObject(json, ["data", "result"]));
    },
  });
};

export const useWithdrawStatus = (transaksiId: string) => {
  return useQuery({
    queryKey: ["withdraw-status", transaksiId],
    queryFn: async () => {
      const json = await fetcher(`/api/rumahotp/h2h-status?transaksi_id=${transaksiId}`);
      return normalizeWithdraw(pickObject(json, ["data", "result"]));
    },
    enabled: !!transaksiId,
    refetchInterval: (query) => {
      const status = (query.state?.data as any)?.status?.toLowerCase() || "";
      if (["success", "completed", "expired", "cancel", "failed"].includes(status)) {
        return false;
      }
      return 15000;
    },
  });
};
