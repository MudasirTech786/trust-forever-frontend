"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentPermissions, type AuthenticatedUser } from "@/services/rolesPermissions";

type AuthUser = AuthenticatedUser;

type AuthContextValue = {
  user: AuthUser | null;
  permissions: string[];
  updateUser: (user: AuthUser) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const defaultApiBaseUrl = typeof window === "undefined"
  ? "http://localhost:8000"
  : `http://${window.location.hostname}:8000`;
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? defaultApiBaseUrl).replace(/\/$/, "");

function xsrfToken(): string {
  const token = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("XSRF-TOKEN="))
    ?.slice("XSRF-TOKEN=".length);

  return token ? decodeURIComponent(token) : "";
}

async function initializeCsrf(): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to start a secure sign-in session.");
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const [checkedPath, setCheckedPath] = useState<string | null>(null);
  const permissionsLoaded = useRef(false);

  useEffect(() => {
    let isCurrent = true;

    fetch(`${apiBaseUrl}/api/me`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then(async (response) => {
        if (!isCurrent) return;

        if (response.ok) {
          const payload = (await response.json()) as { user: AuthUser };

          if (!permissionsLoaded.current) {
            try {
              const access = await getCurrentPermissions();
              if (isCurrent) {
                setPermissions(access.permissions);
              }
            } catch {
              if (isCurrent) {
                setPermissions([]);
              }
            }

            permissionsLoaded.current = true;
          }

          if (!isCurrent) return;

          setUser(payload.user);
          setCheckedPath(pathname);
          setIsChecking(false);

          if (pathname === "/login") {
            router.replace("/");
          }

          return;
        }

        setUser(null);
        setPermissions([]);
        permissionsLoaded.current = false;
        setCheckedPath(pathname);
        setIsChecking(false);

        if (pathname !== "/login") {
          router.replace("/login");
        }
      })
      .catch(() => {
        if (!isCurrent) return;
        setUser(null);
        setPermissions([]);
        permissionsLoaded.current = false;
        setCheckedPath(pathname);
        setIsChecking(false);

        if (pathname !== "/login") {
          router.replace("/login");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [pathname, router]);

  async function login(email: string, password: string): Promise<void> {
    await initializeCsrf();
    const response = await fetch(`${apiBaseUrl}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": xsrfToken(),
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(response.status === 422
        ? "The email or password is incorrect."
        : "Unable to sign in. Please try again.");
    }

    const payload = (await response.json()) as { user: AuthUser };
    setUser(payload.user);
  }

  async function logout(): Promise<void> {
    await initializeCsrf();
    const response = await fetch(`${apiBaseUrl}/api/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-XSRF-TOKEN": xsrfToken(),
      },
    });

    if (!response.ok) {
      throw new Error("Unable to sign out. Please try again.");
    }

    setUser(null);
    setPermissions([]);
    permissionsLoaded.current = false;
    router.replace("/login");
  }

  const contextValue: AuthContextValue = {
    user,
    permissions,
    updateUser: (updatedUser) => setUser(updatedUser),
    login,
    logout,
  };

  if (isChecking || (pathname === "/login" && user) || (pathname !== "/login" && (!user || checkedPath !== pathname))) {
    return (
      <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center bg-[#F7F7F5]">
        <span className="size-8 animate-spin rounded-full border-2 border-[#E8E0D0] border-t-[#0B2A4A]" />
        <span className="sr-only">Checking administrator session</span>
      </div>
    );
  }

  if (pathname === "/login") {
    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
