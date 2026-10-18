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
};

const AuthContext = createContext<AuthContextValue | null>(null);

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

    getCurrentUser()
      .then(async ({ user: authenticatedUser }) => {
        if (!isCurrent) return;

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
    try {
      const payload = await loginAdmin(email, password);
      setUser(payload.user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        throw new Error("The email or password is incorrect.");
      }

      if (error instanceof ApiError && error.status === 401) {
        throw new Error("Sign-in could not be verified. Please try again.");
      }

      throw new Error("Unable to sign in. Please try again.");
    }
  }

  async function logout(): Promise<void> {
    try {
      await logoutAdmin();
    } catch {
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
