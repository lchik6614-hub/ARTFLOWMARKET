import { getTelegramId } from "./telegram";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const tid = getTelegramId();
  if (tid) headers["x-telegram-id"] = String(tid);
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as any).error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface Product {
  id: number;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  price: number;
  category: string;
  popular: boolean;
  isPremium: boolean;
  features: string[];
}

export interface User {
  id: number;
  telegramId: number;
  username: string | null;
  firstName: string | null;
  balance: number;
  purchasesCount: number;
  totalSpent: number;
}

export interface Order {
  id: number;
  productId: number;
  countryName: string;
  countryCode: string;
  price: number;
  status: string;
  createdAt: string;
}

export const api = {
  products: {
    list: (params?: { sort?: string; search?: string }) => {
      const qs = new URLSearchParams();
      if (params?.sort) qs.set("sort", params.sort);
      if (params?.search) qs.set("search", params.search);
      const q = qs.toString();
      return apiGet<Product[]>(`/api/products${q ? `?${q}` : ""}`);
    },
    get: (id: number) => apiGet<Product>(`/api/products/${id}`),
  },
  users: {
    register: (data: { telegramId: number; username?: string | null; firstName?: string | null }) =>
      apiPost<User>("/api/users/register", data),
    me: () => apiGet<User>("/api/users/me"),
  },
  orders: {
    list: () => apiGet<Order[]>("/api/orders"),
    create: (data: { productId: number; promoCode?: string | null; telegramId?: number }) =>
      apiPost<Order>("/api/orders", data),
  },
  promo: {
    apply: (data: { code: string; productId: number; telegramId?: number }) =>
      apiPost<{ discount: number; finalPrice: number; message: string }>("/api/promo", data),
  },
};
