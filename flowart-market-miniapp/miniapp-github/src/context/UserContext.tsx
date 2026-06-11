import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, User } from "../lib/api";
import { getTelegramUser, initTelegram } from "../lib/telegram";

interface UserContextType {
  user: User | null;
  loading: boolean;
  refetch: () => void;
}

const UserContext = createContext<UserContextType>({ user: null, loading: true, refetch: () => {} });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      initTelegram();
      const tgUser = getTelegramUser();
      if (tgUser) {
        const u = await api.users.register({
          telegramId: tgUser.id,
          username: tgUser.username ?? null,
          firstName: tgUser.first_name ?? null,
        });
        setUser(u);
      } else {
        // Dev fallback: use a demo user
        try {
          const u = await api.users.register({ telegramId: 999999, username: "demo", firstName: "Demo" });
          setUser(u);
        } catch {
          setUser(null);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  return (
    <UserContext.Provider value={{ user, loading, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
