import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./context/UserContext";
import CatalogPage from "./pages/CatalogPage";
import BalancePage from "./pages/BalancePage";
import PurchasesPage from "./pages/PurchasesPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

type Tab = "catalog" | "balance" | "purchases";

const TABS: { id: Tab; label: string; icon: (active: boolean) => React.ReactElement }[] = [
  {
    id: "catalog",
    label: "Каталог",
    icon: (a) => (
      <svg className={`w-5 h-5 ${a ? "text-blue-400" : "text-white/30"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: "balance",
    label: "Баланс",
    icon: (a) => (
      <svg className={`w-5 h-5 ${a ? "text-blue-400" : "text-white/30"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    id: "purchases",
    label: "Покупки",
    icon: (a) => (
      <svg className={`w-5 h-5 ${a ? "text-blue-400" : "text-white/30"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
];

function Header({ balance }: { balance: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 world-bg border-b border-blue-900/30">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
          <span className="text-xs font-bold text-blue-400">FM</span>
        </div>
        <div>
          <div className="text-xs font-bold leading-none text-white">FLOWART MARKET</div>
          <div className="text-[10px] text-blue-400/70 leading-none mt-0.5">PREMIUM ACCOUNTS</div>
        </div>
      </div>
      <div className="bg-blue-950/60 border border-blue-800/40 rounded-lg px-3 py-1.5">
        <div className="text-[9px] text-blue-400/60 uppercase leading-none">Баланс</div>
        <div className="text-xs font-bold mt-0.5 text-white">{balance.toFixed(0)} ₽</div>
      </div>
    </div>
  );
}

function MainApp() {
  const [tab, setTab] = useState<Tab>("catalog");

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden" style={{ background: "hsl(222 40% 5%)" }}>
      <Header balance={0} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {tab === "catalog" && <CatalogPage />}
        {tab === "balance" && <BalancePage />}
        {tab === "purchases" && <PurchasesPage />}
      </div>

      <div className="flex-shrink-0 border-t border-blue-900/30" style={{ background: "hsl(220 38% 7%)" }}>
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative ${tab === t.id ? "text-blue-400" : "text-white/30"}`}
            >
              {tab === t.id && (
                <div className="absolute top-0 inset-x-4 h-px bg-blue-500/50 rounded-full" />
              )}
              {t.icon(tab === t.id)}
              <span className="text-[10px]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <MainApp />
      </UserProvider>
    </QueryClientProvider>
  );
}
