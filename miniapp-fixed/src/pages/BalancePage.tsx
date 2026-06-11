import { useState } from "react";
import { useUser } from "../context/UserContext";

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2000];

export default function BalancePage() {
  const { user } = useUser();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"sbp" | "crypto" | "stars">("sbp");

  const balance = user?.balance ?? 0;
  const purchasesCount = user?.purchasesCount ?? 0;
  const totalSpent = user?.totalSpent ?? 0;

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount ?? 0;

  const handleTopup = () => {
    alert("Пополнение баланса временно недоступно. Скоро будет подключён способ оплаты.");
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
      {/* Balance card */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden border border-blue-800/30"
        style={{ background: "linear-gradient(135deg, hsl(220 50% 10%) 0%, hsl(217 70% 14%) 100%)" }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 30%, #3b82f6 0%, transparent 70%)" }} />
        <div className="text-xs text-blue-400/60 uppercase tracking-widest mb-1">Текущий баланс</div>
        <div className="text-5xl font-bold mb-4 text-white">{balance.toFixed(0)} <span className="text-3xl text-blue-300">₽</span></div>
        <div className="flex gap-6">
          <div>
            <div className="text-xl font-semibold text-white">{purchasesCount}</div>
            <div className="text-xs text-blue-400/60 uppercase tracking-wider mt-0.5">Покупок</div>
          </div>
          <div className="w-px bg-blue-800/40" />
          <div>
            <div className="text-xl font-semibold text-white">{totalSpent.toFixed(0)} ₽</div>
            <div className="text-xs text-blue-400/60 uppercase tracking-wider mt-0.5">Потрачено</div>
          </div>
        </div>
      </div>

      {/* Amount selector */}
      <div>
        <div className="text-xs text-blue-400/50 uppercase tracking-widest mb-3">Сумма пополнения</div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {PRESET_AMOUNTS.map(a => (
            <button
              key={a}
              onClick={() => { setSelectedAmount(a); setCustomAmount(""); }}
              className={`py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border ${
                selectedAmount === a && !customAmount
                  ? "bg-blue-600 text-white border-blue-500"
                  : "border-blue-900/40 text-white/70 hover:border-blue-700/50"
              }`}
              style={!(selectedAmount === a && !customAmount) ? { background: "hsl(220 35% 10%)" } : undefined}
            >
              {a.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="number"
            placeholder="Другая сумма"
            value={customAmount}
            onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
            className="w-full border border-blue-900/40 rounded-xl px-4 py-3.5 text-sm placeholder-white/25 outline-none focus:border-blue-600/60 pr-8"
            style={{ background: "hsl(220 35% 10%)" }}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">₽</span>
        </div>
      </div>

      {/* Pay method */}
      <div>
        <div className="text-xs text-blue-400/50 uppercase tracking-widest mb-3">Способ оплаты</div>
        <div className="space-y-2">
          <PayMethod id="sbp" title="СБП / Карта" subtitle="Platega" selected={payMethod === "sbp"} disabled onSelect={() => {}} />
          <PayMethod id="crypto" title="Криптовалюта" subtitle="USDT · CryptoBot" selected={payMethod === "crypto"} disabled onSelect={() => setPayMethod("crypto")} />
          <PayMethod id="stars" title="Telegram Stars" subtitle="курс 1 ₽/★" selected={payMethod === "stars"} disabled onSelect={() => setPayMethod("stars")} />
        </div>
      </div>

      <button
        onClick={handleTopup}
        disabled={finalAmount <= 0}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-2xl text-base disabled:opacity-30 active:scale-[0.98] transition-all"
      >
        Пополнить {finalAmount > 0 ? `${finalAmount.toLocaleString()} ₽` : ""}
      </button>

      <div>
        <div className="text-xs text-blue-400/50 uppercase tracking-widest mb-3">История операций</div>
        <div className="text-center py-8 text-white/25 text-sm">Операций пока нет</div>
      </div>

      <div className="pt-2 flex flex-col items-center gap-2">
        <div className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Документы</div>
        <a
          href="https://telegra.ph/Politika-konfidencialnosti-04-01-26"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400/50 hover:text-blue-400 transition-colors underline underline-offset-2"
        >
          Политика конфиденциальности
        </a>
        <a
          href="https://telegra.ph/Polzovatelskoe-soglashenie-04-01-19"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400/50 hover:text-blue-400 transition-colors underline underline-offset-2"
        >
          Пользовательское соглашение
        </a>
      </div>
    </div>
  );
}

function PayMethod({ id, title, subtitle, selected, disabled, onSelect }: {
  id: string; title: string; subtitle: string; selected: boolean; disabled?: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors disabled:opacity-50 border ${
        selected ? "border-blue-600/50 bg-blue-900/20" : "border-blue-900/30"
      }`}
      style={!selected ? { background: "hsl(220 38% 8%)" } : undefined}
    >
      <div className="text-left">
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="text-xs text-blue-400/50 mt-0.5">{subtitle}</div>
      </div>
      {selected && <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0" />}
      {disabled && <span className="text-[10px] text-white/25 border border-white/10 px-1.5 py-0.5 rounded">Скоро</span>}
    </button>
  );
}
