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
import {
  ApiError,
  getCurrentPermissions,
  getCurrentUser,
  loginAdmin,
  logoutAdmin,
  type AuthenticatedUser,
} from "@/services/rolesPermissions";

type AuthUser = AuthenticatedUser;

type AuthContextValue = {
  user: AuthUser | null;
  permissions: string[];
  updateUser: (user: AuthUser) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authCheckError: string | null;
  retryAuthCheck: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const [authCheckError, setAuthCheckError] = useState<string | null>(null);
  const [checkedPath, setCheckedPath] = useState<string | null>(null);
  const [authCheckAttempt, setAuthCheckAttempt] = useState(0);
  const permissionsLoaded = useRef(false);

  useEffect(() => {
    let isCurrent = true;

    getCurrentUser()
      .then(async ({ user: authenticatedUser }) => {
        if (!isCurrent) return;
        setAuthCheckError(null);

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

        setUser(authenticatedUser);
        setCheckedPath(pathname);
        setIsChecking(false);

        if (pathname === "/login") {
          router.replace("/");
        }
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setUser(null);
        setPermissions([]);
        permissionsLoaded.current = false;
        setCheckedPath(pathname);
        setIsChecking(false);

        if (error instanceof ApiError && error.status !== 401) {
          setAuthCheckError(error.message);
          return;
        }

        setAuthCheckError(null);
        if (pathname !== "/login") {
          router.replace("/login");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [authCheckAttempt, pathname, router]);

  async function login(email: string, password: string): Promise<void> {
    try {
      const payload = await loginAdmin(email, password);
      setUser(payload.user);
      setAuthCheckError(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        throw new Error("The email or password is incorrect.");
      }

      if (error instanceof ApiError) {
        throw new Error(error.message);
      }

      throw new Error("Unable to sign in. Please try again.");
    }
  }

  async function logout(): Promise<void> {
    try {
      await logoutAdmin();
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        throw new Error(error instanceof Error ? error.message : "Unable to sign out. Please try again.");
      }
    }

    setUser(null);
    setPermissions([]);
    permissionsLoaded.current = false;
    setAuthCheckError(null);
    router.replace("/login");
  }

  function retryAuthCheck(): void {
    setAuthCheckError(null);
    setIsChecking(true);
    setAuthCheckAttempt((attempt) => attempt + 1);
  }

  const contextValue: AuthContextValue = {
    user,
    permissions,
    updateUser: (updatedUser) => setUser(updatedUser),
    login,
    logout,
    authCheckError,
    retryAuthCheck,
  };

  if (authCheckError && checkedPath === pathname && pathname !== "/login") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-6">
        <section className="max-w-lg rounded-2xl border border-[#E8E0D0] bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-[#0B2A4A]">Unable to verify your session</h1>
          <p className="mt-3 text-sm text-[#5F6670]">{authCheckError}</p>
          <button
            type="button"
            onClick={retryAuthCheck}
            className="mt-6 rounded-full bg-[#0B2A4A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#123B64]"
          >
            Retry
          </button>
        </section>
      </main>
    );
  }

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
