import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "В обработке", color: "text-yellow-400" },
  completed: { label: "Выполнен", color: "text-green-400" },
  cancelled: { label: "Отменён", color: "text-red-400" },
};

export default function PurchasesPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.orders.list(),
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-800 border-t-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-blue-900/40"
          style={{ background: "hsl(220 38% 10%)" }}
        >
          <svg className="w-7 h-7 text-blue-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <div className="text-white/50 text-sm">У вас пока нет покупок</div>
        <div className="text-white/25 text-xs mt-1">Перейдите в каталог и выберите аккаунт</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-2">
      {orders.map(order => {
        const statusInfo = STATUS_MAP[order.status] ?? { label: order.status, color: "text-white/60" };
        const date = new Date(order.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

        return (
          <div
            key={order.id}
            className="rounded-xl px-4 py-4 border border-blue-900/30"
            style={{ background: "hsl(220 38% 8%)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{order.countryFlag ?? "🌍"}</div>
                <div>
                  <div className="font-medium text-sm text-white/90">{order.countryName}</div>
                  <div className="text-xs text-blue-400/50 mt-0.5">{order.category ?? "Авторег Telegram"}</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-semibold text-sm text-blue-300">{order.price} ₽</div>
                <div className={`text-xs mt-0.5 ${statusInfo.color}`}>{statusInfo.label}</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-900/25">
              <div className="text-xs text-white/20">#{order.id}</div>
              <div className="text-xs text-white/20">{date}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
