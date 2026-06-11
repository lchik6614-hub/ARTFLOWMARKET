declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        BackButton: { show: () => void; hide: () => void; onClick: (fn: () => void) => void; };
        HapticFeedback: { impactOccurred: (style: string) => void; notificationOccurred: (type: string) => void; };
        colorScheme: string;
        themeParams: Record<string, string>;
      };
    };
  }
}

export const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

export function getTelegramUser() {
  const user = tg?.initDataUnsafe?.user;
  return user ?? null;
}

export function getTelegramId(): number | null {
  return getTelegramUser()?.id ?? null;
}

export function initTelegram() {
  if (tg) {
    tg.ready();
    tg.expand();
  }
}
