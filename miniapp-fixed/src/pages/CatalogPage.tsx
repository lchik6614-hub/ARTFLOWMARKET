import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Product } from "../lib/api";
import { useUser } from "../context/UserContext";
import { tg } from "../lib/telegram";

interface BuyModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

function BuyModal({ product, onClose, onSuccess }: BuyModalProps) {
  const { user, refetch } = useUser();
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [finalPrice, setFinalPrice] = useState(product.price);
  const [promoError, setPromoError] = useState("");
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => api.orders.create({
      productId: product.id,
      promoCode: promo || null,
      telegramId: user?.telegramId,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      refetch();
      tg?.HapticFeedback?.notificationOccurred("success");
      onSuccess();
    },
  });

  const applyPromoMutation = useMutation({
    mutationFn: () => api.promo.apply({ code: promo, productId: product.id, telegramId: user?.telegramId }),
    onSuccess: (data) => {
      setFinalPrice(data.finalPrice);
      setPromoApplied(true);
      setPromoError("");
    },
    onError: (e: Error) => {
      setPromoError(e.message);
    },
  });

  const balance = user?.balance ?? 0;
  const canAfford = balance >= finalPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-t-2xl px-5 pt-3 pb-8 animate-in slide-in-from-bottom-4 border-t border-x border-blue-900/40"
        style={{ background: "hsl(220 38% 9%)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-blue-800/60 rounded-full mx-auto mb-6" />

        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{product.countryFlag}</div>
          <div className="text-xl font-semibold">{product.countryName}</div>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <span className="text-sm text-white/40">Telegram аккаунт</span>
            {product.isPremium && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-medium">
                ⭐ Premium
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ПРОМОКОД"
              value={promo}
              onChange={e => { setPromo(e.target.value.toUpperCase()); setPromoError(""); setPromoApplied(false); setFinalPrice(product.price); }}
              className="flex-1 border border-blue-900/50 rounded-xl px-4 py-3 text-sm placeholder-white/20 outline-none focus:border-blue-600/60 uppercase tracking-widest"
              style={{ background: "hsl(220 35% 11%)" }}
            />
            <button
              onClick={() => applyPromoMutation.mutate()}
              disabled={!promo || applyPromoMutation.isPending}
              className="border border-blue-900/50 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-40 hover:bg-blue-900/30 transition-colors"
              style={{ background: "hsl(220 35% 11%)" }}
            >
              ОК
            </button>
          </div>
          {promoError && <p className="text-red-400 text-xs mt-1.5 px-1">{promoError}</p>}
          {promoApplied && <p className="text-green-400 text-xs mt-1.5 px-1">Промокод применён</p>}
        </div>

        <div className="flex justify-between items-center py-3 border-t border-blue-900/30">
          <span className="text-white/50 text-sm">К оплате</span>
          <span className="font-semibold text-blue-300">{finalPrice} ₽</span>
        </div>
        <div className="flex justify-between items-center py-3 border-t border-blue-900/30 mb-5">
          <span className="text-white/50 text-sm">Ваш баланс</span>
          <span className={`font-semibold ${canAfford ? "text-white" : "text-red-400"}`}>{balance.toFixed(0)} ₽</span>
        </div>

        {createMutation.isError && (
          <p className="text-red-400 text-sm text-center mb-3">{(createMutation.error as Error).message}</p>
        )}

        <button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending || !canAfford}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-2xl text-base disabled:opacity-40 active:scale-[0.98] transition-all mb-3"
        >
          {createMutation.isPending ? "Создаём заказ..." : "Купить за баланс"}
        </button>
        <button
          onClick={onClose}
          className="w-full border border-blue-900/50 text-white/70 font-medium py-4 rounded-2xl text-base active:scale-[0.98] transition-transform hover:bg-blue-900/20"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

function SuccessModal({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative rounded-2xl p-6 w-full max-w-sm animate-in zoom-in-95 border border-blue-900/40"
        style={{ background: "hsl(220 38% 9%)" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Заказ создан!</h2>
          <div className="text-white/50 text-sm mb-4">{product.countryFlag} {product.countryName} — {product.price} ₽</div>
          <p className="text-white/70 text-sm leading-relaxed mb-6">
            С вами свяжется в течение 1-2 минут наш менеджер и выдаст аккаунт.
            Можете отписать ему сами:{" "}
            <span className="text-blue-400 font-medium">@flowart_support</span>
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}

type SortKey = "cheap" | "expensive" | "popular";
type CategoryFilter = "all" | "standard" | "premium";

export default function CatalogPage() {
  const [sort, setSort] = useState<SortKey>("popular");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [successProduct, setSuccessProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", sort, search],
    queryFn: () => api.products.list({ sort, search: search || undefined }),
  });

  const filtered = products.filter(p => {
    if (categoryFilter === "premium") return p.isPremium;
    if (categoryFilter === "standard") return !p.isPremium;
    return true;
  });

  const handleBuy = useCallback((product: Product) => {
    tg?.HapticFeedback?.impactOccurred("light");
    setSelectedProduct(product);
  }, []);

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: "popular", label: "Популярные" },
    { key: "cheap", label: "Дешевле" },
    { key: "expensive", label: "Дороже" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 space-y-3 flex-shrink-0">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Поиск страны..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-blue-900/40 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-white/25 outline-none focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/20"
            style={{ background: "hsl(220 35% 10%)" }}
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2">
          {([["all", "Все"], ["standard", "Авторег"], ["premium", "⭐ Premium"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === key
                  ? key === "premium"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-blue-600 text-white"
                  : "border border-blue-900/40 text-white/50 hover:text-white/70"
              }`}
              style={categoryFilter !== key ? { background: "hsl(220 35% 10%)" } : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          {sortButtons.map(b => (
            <button
              key={b.key}
              onClick={() => setSort(b.key)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                sort === b.key
                  ? "bg-blue-600 text-white"
                  : "border border-blue-900/40 text-white/50 hover:text-white/70"
              }`}
              style={sort !== b.key ? { background: "hsl(220 35% 10%)" } : undefined}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 mt-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-blue-800 border-t-blue-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">Ничего не найдено</div>
        ) : (
          filtered.map(product => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 border border-blue-900/30"
              style={{ background: "hsl(220 38% 8%)" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0 font-bold"
                style={{ background: "hsl(220 35% 12%)" }}
              >
                {product.countryFlag}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate text-white/90">{product.countryName}</div>
                {product.isPremium && (
                  <div className="text-[10px] text-yellow-400/70 mt-0.5">⭐ Premium подписка</div>
                )}
              </div>
              <div className="text-blue-300 text-sm font-semibold mr-2">{product.price} ₽</div>
              <button
                onClick={() => handleBuy(product)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg active:scale-95 transition-all flex-shrink-0"
              >
                Купить
              </button>
            </div>
          ))
        )}
      </div>

      {selectedProduct && (
        <BuyModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => {
            const p = selectedProduct;
            setSelectedProduct(null);
            setSuccessProduct(p);
          }}
        />
      )}

      {successProduct && (
        <SuccessModal
          product={successProduct}
          onClose={() => setSuccessProduct(null)}
        />
      )}
    </div>
  );
}
