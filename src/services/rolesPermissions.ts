export type PermissionRecord = {
  id: number;
  name: string;
  guard_name: string;
};

export type RoleRecord = {
  id: number;
  name: string;
  guard_name: string;
  permissions: Array<Pick<PermissionRecord, "id" | "name">>;
};

export type CurrentPermissions = {
  roles: string[];
  permissions: string[];
};

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  profile_picture_url: string | null;
};

export type MatrimonialProfile = {
  id: number;
  profile_id: string;
  profile_picture_url: string | null;
  name: string;
  gender: "female" | "male";
  marital_status: "unmarried" | "married" | "divorced" | "widowed";
  date_of_birth: string;
  age: number;
  height: string | null;
  sect: string | null;
  caste: string | null;
  language: string | null;
  qualification: string | null;
  educational_institution: string | null;
  employed: boolean | null;
  job: string | null;
  business: string | null;
  income: string | null;
  father_details: string | null;
  father_name: string | null;
  father_occupation: string | null;
  mother_details: string | null;
  other_details: string | null;
  house_size: string | null;
  society: string | null;
  city: string | null;
  sisters_count: number;
  sisters_details: string | null;
  married_sisters_count: number;
  brothers_count: number;
  brothers_details: string | null;
  married_brothers_count: number;
  partner_requirements: string | null;
  father_whatsapp: string | null;
  mother_whatsapp: string | null;
  whatsapp_number: string | null;
  parents_whatsapp: string | null;
};

export type ProfileFilters = Partial<Pick<MatrimonialProfile, "gender" | "marital_status" | "city" | "sect" | "caste">> & {
  search?: string;
  employed?: "true" | "false";
};

export type DashboardRecentProfile = Pick<MatrimonialProfile,
  "id" | "profile_id" | "profile_picture_url" | "name" | "gender" | "date_of_birth" | "age" | "city" | "qualification" | "caste" | "sect"
>;

export type DashboardProfileSummary = {
  statistics: {
    total_profiles: number;
    male_profiles: number;
    female_profiles: number;
    unmarried_profiles: number;
    married_profiles: number;
  };
  recent_profiles: DashboardRecentProfile[];
};

export type ManagedUser = {
  id: number;
  name: string;
  email: string;
  roles: string[];
  created_at: string;
  updated_at: string;
};

export type UserRoleOption = { id: number; name: string };

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const defaultApiBaseUrl = process.env.NODE_ENV === "development"
  ? typeof window === "undefined" ? "http://localhost:8000" : `http://${window.location.hostname}:8000`
  : "";
export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL?.trim() || defaultApiBaseUrl)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

export function resolvePublicImageUrl(imagePath: string | null | undefined): string {
  const fallbackPath = "storage/matrimonial-profiles/avatar.jpg";
  const path = imagePath?.trim() || fallbackPath;

  if (!apiBaseUrl) return fallbackPath;

  try {
    const resolvedUrl = new URL(path, `${apiBaseUrl}/`);

    // Laravel's Storage::url() uses APP_URL. If production APP_URL was left
    // pointing at a developer machine, browsers cannot reach that host.
    // Keep the path but serve it from the API host configured for this app.
    if (["localhost", "127.0.0.1", "::1", "[::1]"].includes(resolvedUrl.hostname)) {
      const apiUrl = new URL(`${apiBaseUrl}/`);
      resolvedUrl.protocol = apiUrl.protocol;
      resolvedUrl.host = apiUrl.host;
    }

    return resolvedUrl.toString();
  } catch {
    return new URL(fallbackPath, `${apiBaseUrl}/`).toString();
  }
}

async function fetchApi(url: string, init: RequestInit): Promise<Response> {
  if (!apiBaseUrl) {
    throw new ApiError(0, "The admin API URL is not configured. Set NEXT_PUBLIC_API_URL for this deployment.");
  }

  try {
    return await fetch(url, init);
  } catch {
    throw new ApiError(0, "Unable to reach the admin API. Check your connection and the API CORS configuration, then try again.");
  }
}

function xsrfToken(): string {
  const token = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("XSRF-TOKEN="))
    ?.slice("XSRF-TOKEN=".length);

  return token ? decodeURIComponent(token) : "";
}

async function initializeCsrf(): Promise<string> {
  const response = await fetchApi(`${apiBaseUrl}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = response.status === 419
      ? "The secure session expired. Refresh the page and try again."
      : response.status === 401
        ? "Your session has expired. Sign in again to continue."
        : "Unable to start a secure request. Please try again.";
    throw new ApiError(response.status, message);
  }

  const token = xsrfToken();

  if (!token) {
    throw new ApiError(419, "Your secure session has expired. Refresh the page and try again.");
  }

  return token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  if (init.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set("X-XSRF-TOKEN", await initializeCsrf());
  }

  const response = await fetchApi(`${apiBaseUrl}/api${path}`, {
    ...init,
    method,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null) as {
    message?: string;
    errors?: Record<string, string[]>;
  } | null;

  if (!response.ok) {
    if (process.env.NODE_ENV === "development") {
      console.error("API request failed", {
        method,
        url: `${apiBaseUrl}/api${path}`,
        status: response.status,
      });
    }

    const validationMessage = payload?.errors
      ? Object.values(payload.errors).flat()[0]
      : undefined;
    const statusMessage: Record<number, string> = {
      401: "Your session has expired. Sign in again to continue.",
      419: "The secure session expired. Refresh the page and try again.",
      403: "You do not have permission to perform this action.",
      404: "The requested item could not be found.",
      422: "Please review the submitted values.",
      500: "The server could not complete the request. Try again later.",
    };

    throw new ApiError(
      response.status,
      validationMessage ?? payload?.message ?? statusMessage[response.status] ?? "The request could not be completed.",
    );
  }

  return payload as T;
}

export function getCurrentPermissions(): Promise<CurrentPermissions> {
  return request<CurrentPermissions>("/me/permissions");
}

export function getCurrentUser(): Promise<{ user: AuthenticatedUser }> {
  return request<{ user: AuthenticatedUser }>("/me");
}

export async function loginAdmin(email: string, password: string): Promise<{ user: AuthenticatedUser }> {
  await request<{ user: AuthenticatedUser }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  try {
    return await getCurrentUser();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new ApiError(
        401,
        `Laravel accepted the login request, but /api/me returned 401 (${error.message}). The browser session was not established; verify the session cookie and Sanctum stateful-domain configuration.`,
      );
    }

    throw error;
  }
}

export function logoutAdmin(): Promise<void> {
  return request<void>("/logout", { method: "POST" });
}

export function updateCurrentProfile(formData: FormData): Promise<{ user: AuthenticatedUser }> {
  return request<{ user: AuthenticatedUser }>("/me", {
    method: "POST",
    body: formData,
  });
}

export function listProfiles(filters: ProfileFilters = {}): Promise<{ profiles: MatrimonialProfile[] }> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) query.set(key, value);
  }
  const suffix = query.size ? `?${query.toString()}` : "";
  return request<{ profiles: MatrimonialProfile[] }>(`/profiles${suffix}`);
}

export function getDashboardProfileSummary(): Promise<DashboardProfileSummary> {
  return request<DashboardProfileSummary>("/dashboard/profile-summary");
}

export function getProfile(id: number): Promise<{ profile: MatrimonialProfile }> {
  return request<{ profile: MatrimonialProfile }>(`/profiles/${id}`);
}

export function createProfile(formData: FormData): Promise<{ profile: MatrimonialProfile }> {
  return request<{ profile: MatrimonialProfile }>("/profiles", { method: "POST", body: formData });
}

export function updateProfile(id: number, formData: FormData): Promise<{ profile: MatrimonialProfile }> {
  formData.set("_method", "PUT");
  return request<{ profile: MatrimonialProfile }>(`/profiles/${id}`, { method: "POST", body: formData });
}

export function deleteProfile(id: number): Promise<void> {
  return request<void>(`/profiles/${id}`, { method: "DELETE" });
}

export function listManagedUsers(search = ""): Promise<{ users: ManagedUser[] }> {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return request<{ users: ManagedUser[] }>(`/users${query}`);
}

export function listUserRoleOptions(): Promise<{ roles: UserRoleOption[] }> {
  return request<{ roles: UserRoleOption[] }>("/user-management/roles");
}

export function createManagedUser(input: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id?: number;
}): Promise<{ user: ManagedUser }> {
  return request<{ user: ManagedUser }>("/users", { method: "POST", body: JSON.stringify(input) });
}

export function updateManagedUser(id: number, input: { name: string; email: string; role_id?: number }): Promise<{ user: ManagedUser }> {
  return request<{ user: ManagedUser }>(`/users/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function updateManagedUserPassword(id: number, password: string, password_confirmation: string): Promise<void> {
  return request<void>(`/users/${id}/password`, {
    method: "PUT",
    body: JSON.stringify({ password, password_confirmation }),
  });
}

export function deleteManagedUser(id: number): Promise<void> {
  return request<void>(`/users/${id}`, { method: "DELETE" });
}

export async function listRoles(): Promise<{ roles: RoleRecord[] }> {
  return request<{ roles: RoleRecord[] }>("/roles");
}

export async function listPermissions(): Promise<{ permissions: PermissionRecord[] }> {
  return request<{ permissions: PermissionRecord[] }>("/permissions");
}

export function createRole(name: string): Promise<{ role: RoleRecord }> {
  return request<{ role: RoleRecord }>("/roles", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function updateRole(id: number, name: string): Promise<{ role: RoleRecord }> {
  return request<{ role: RoleRecord }>(`/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export function deleteRole(id: number): Promise<void> {
  return request<void>(`/roles/${id}`, { method: "DELETE" });
}

export function syncRolePermissions(id: number, permissions: number[]): Promise<{ role: RoleRecord }> {
  return request<{ role: RoleRecord }>(`/roles/${id}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissions }),
  });
}

export function createPermission(name: string): Promise<{ permission: PermissionRecord }> {
  return request<{ permission: PermissionRecord }>("/permissions", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function updatePermission(id: number, name: string): Promise<{ permission: PermissionRecord }> {
  return request<{ permission: PermissionRecord }>(`/permissions/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export function deletePermission(id: number): Promise<void> {
  return request<void>(`/permissions/${id}`, { method: "DELETE" });
}
