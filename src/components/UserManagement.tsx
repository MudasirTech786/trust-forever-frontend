"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useConfirm, useToast } from "@/components/ToastProvider";
import {
  ApiError,
  createManagedUser,
  deleteManagedUser,
  listManagedUsers,
  listUserRoleOptions,
  updateManagedUser,
  updateManagedUserPassword,
  type ManagedUser,
  type UserRoleOption,
} from "@/services/rolesPermissions";

type Editor = { mode: "create" } | { mode: "edit" | "password"; user: ManagedUser };

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

const protectedAdminEmail = "trustforevermarriagebureau@gmail.com";

function LoadingUsers() {
  return <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-48 animate-pulse rounded-lg border border-[#E8E0D0] bg-white p-5"><div className="h-4 w-1/2 rounded bg-[#EEEAE0]" /><div className="mt-4 h-3 w-3/4 rounded bg-[#EEEAE0]" /><div className="mt-3 h-3 w-1/3 rounded bg-[#EEEAE0]" /></div>)}</div>;
}

export default function UserManagement() {
  const { permissions, user: currentUser } = useAuth();
  const { notify } = useToast();
  const requestConfirmation = useConfirm();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<UserRoleOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const canView = permissions.includes("user.view");
  const canCreate = permissions.includes("user.create");
  const canUpdate = permissions.includes("user.update");
  const canDelete = permissions.includes("user.delete");
  const canAssignRoles = permissions.includes("users.roles.assign");
  const roleIsProtected = editor?.mode === "edit"
    && (editor.user.id === currentUser?.id || editor.user.email.toLowerCase() === protectedAdminEmail);

  const loadUsers = useCallback(async (query: string): Promise<void> => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await listManagedUsers(query);
      setUsers(result.users);
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : "Unable to load users. Please try again.";
      setLoadError(message);
      notify({ variant: "error", title: "Unable to load users", message });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (!canView) return;
    const timeoutId = window.setTimeout(() => { void loadUsers(search); }, search ? 250 : 0);
    return () => window.clearTimeout(timeoutId);
  }, [canView, loadUsers, search]);

  useEffect(() => {
    if ((!canCreate && !canUpdate) || !canAssignRoles) return;
    let isCurrent = true;
    void listUserRoleOptions().then((result) => {
      if (isCurrent) setRoles(result.roles);
    }).catch((cause: unknown) => {
      if (isCurrent) {
        const message = cause instanceof ApiError ? cause.message : "Unable to load available roles.";
        notify({ variant: "error", title: "Unable to load roles", message });
      }
    });
    return () => { isCurrent = false; };
  }, [canAssignRoles, canCreate, canUpdate, notify]);

  function beginCreate(): void {
    setName("");
    setEmail("");
    setRoleId("");
    setPassword("");
    setPasswordConfirmation("");
    setFormError("");
    setEditor({ mode: "create" });
  }

  function beginEdit(target: ManagedUser): void {
    setName(target.name);
    setEmail(target.email);
    setRoleId(String(roles.find((role) => target.roles.includes(role.name))?.id ?? ""));
    setPassword("");
    setPasswordConfirmation("");
    setFormError("");
    setEditor({ mode: "edit", user: target });
  }

  function beginPasswordChange(target: ManagedUser): void {
    setPassword("");
    setPasswordConfirmation("");
    setFormError("");
    setEditor({ mode: "password", user: target });
  }

  function closeEditor(): void {
    if (saving) return;
    setEditor(null);
    setPassword("");
    setPasswordConfirmation("");
    setFormError("");
  }

  async function saveUser(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!editor) return;
    setSaving(true);
    setFormError("");
    try {
      if (editor.mode === "create") {
        await createManagedUser({
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
          ...(canAssignRoles && roleId ? { role_id: Number(roleId) } : {}),
        });
        notify({ variant: "success", title: "User created", message: `${name.trim()} can now sign in with the assigned role.` });
      } else if (editor.mode === "edit") {
        await updateManagedUser(editor.user.id, {
          name: name.trim(),
          email: email.trim(),
          ...(canAssignRoles ? { role_id: Number(roleId) } : {}),
        });
        notify({ variant: "success", title: "User updated", message: `${name.trim()}’s account details were saved.` });
      } else {
        await updateManagedUserPassword(editor.user.id, password, passwordConfirmation);
        notify({ variant: "success", title: "Password changed", message: `A new password was set for ${editor.user.name}.` });
      }
      setEditor(null);
      setPassword("");
      setPasswordConfirmation("");
      await loadUsers(search);
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : "Please review the information and try again.";
      setFormError(message);
      notify({ variant: "error", title: "Unable to save user changes", message });
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(target: ManagedUser): void {
    requestConfirmation({
      title: "Delete User?",
      message: `Are you sure you want to delete ${target.name} (${target.email})? This action cannot be undone.`,
      confirmLabel: "Delete User",
      pendingLabel: "Deleting user...",
      cancelLabel: "Cancel",
      destructive: true,
      onConfirm: async () => {
        await deleteManagedUser(target.id);
        setUsers((current) => current.filter((item) => item.id !== target.id));
        notify({ variant: "success", title: "User deleted", message: `${target.name}’s account was removed.` });
      },
      onError: (cause) => notify({
        variant: "error",
        title: "Unable to delete user",
        message: cause instanceof ApiError ? cause.message : "Please try again.",
      }),
    });
  }

  if (!canView) {
    return <section className="mx-auto max-w-3xl rounded-lg border border-[#E5E7EB] bg-white p-7 shadow-[0_2px_8px_rgba(23,32,51,0.035)]"><h1 className="text-lg font-semibold text-[#172033]">Access unavailable</h1><p className="mt-2 text-sm text-[#64748B]">Your account does not have access to User Management.</p></section>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7625]">Trust Forever Marriage Bureau</p><h1 className="mt-1 text-2xl font-semibold text-[#0B2A4A] sm:text-3xl">User Management</h1><p className="mt-2 text-sm text-[#64748B]">Manage staff accounts and their access to bureau records.</p></div>
        {canCreate && <button type="button" onClick={beginCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0B2A4A] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123E68]"><span aria-hidden="true" className="text-lg leading-none">+</span>Add User</button>}
      </header>

      <section className="rounded-lg border border-[#E8E0D0] bg-white p-4 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-5" aria-label="Search users">
        <label className="block max-w-xl text-xs font-medium text-[#64748B]">Search by name or email<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Enter a name or email address" className="mt-1.5 min-h-11 w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-sm text-[#172033] outline-none transition placeholder:text-[#94A3B8] focus:border-[#C89B2C] focus:ring-2 focus:ring-[#C89B2C]/15" /></label>
        {!loading && !loadError && <p className="mt-3 text-xs text-[#94A3B8]">Showing {users.length} {users.length === 1 ? "user" : "users"}</p>}
      </section>

      {loading ? <LoadingUsers /> : loadError ? <section className="rounded-lg border border-[#E8C7C2] bg-white p-8 text-center"><p className="text-sm text-[#8F3028]">{loadError}</p><button type="button" onClick={() => void loadUsers(search)} className="mt-4 min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-medium text-white">Try again</button></section>
        : users.length === 0 ? <section className="rounded-lg border border-[#E8E0D0] bg-white px-6 py-14 text-center shadow-[0_2px_8px_rgba(23,32,51,0.035)]"><div aria-hidden="true" className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#FBF8EF] text-[#9A7625]"><svg viewBox="0 0 24 24" fill="none" className="size-7"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0m2-9a3 3 0 1 0 0-6m1 9a5 5 0 0 1 3 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></div><h2 className="mt-4 text-lg font-semibold text-[#0B2A4A]">{search ? "No matching users" : "No staff users yet"}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">{search ? "Try a different name or email address." : "Staff accounts created for the bureau will appear here."}</p></section>
          : <section aria-label="Staff users" className="grid gap-4 md:grid-cols-2">{users.map((item) => {
            const isCurrentUser = item.id === currentUser?.id;
            const isProtectedAdmin = item.email.toLowerCase() === protectedAdminEmail;
            const isLastAdmin = item.roles.includes("admin") && users.filter((candidate) => candidate.roles.includes("admin")).length <= 1;
            return <article key={item.id} className="flex min-w-0 flex-col rounded-lg border border-[#E8E0D0] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-6">
              <div className="flex min-w-0 items-start gap-3"><div aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#E8DDBF] bg-[#FBF8EF] text-sm font-semibold text-[#9A7625]">{item.name.trim().slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><h2 className="break-words text-base font-semibold text-[#0B2A4A]">{item.name}{isCurrentUser && <span className="ml-2 text-xs font-medium text-[#9A7625]">You</span>}</h2><p className="mt-1 break-all text-sm text-[#64748B]">{item.email}</p></div></div>
              <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-[#F0ECE3] pt-4 text-sm sm:grid-cols-2"><div><dt className="text-xs text-[#94A3B8]">Assigned role</dt><dd className="mt-1 break-words font-medium text-[#334155]">{item.roles.length ? item.roles.join(", ") : "No role assigned"}</dd></div><div><dt className="text-xs text-[#94A3B8]">Created</dt><dd className="mt-1 font-medium text-[#334155]">{formatDate(item.created_at)}</dd></div><div><dt className="text-xs text-[#94A3B8]">Last updated</dt><dd className="mt-1 font-medium text-[#334155]">{formatDate(item.updated_at)}</dd></div></dl>
              <div className="mt-auto flex flex-wrap gap-2 border-t border-[#F0ECE3] pt-4">{canUpdate && <><button type="button" onClick={() => beginEdit(item)} className="min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-medium text-white transition hover:bg-[#123E68]">Edit</button><button type="button" onClick={() => beginPasswordChange(item)} className="min-h-10 rounded-md border border-[#CBD5E1] px-4 text-sm font-medium text-[#334155] transition hover:bg-[#F7F7F5]">Change Password</button></>}{canDelete && !isCurrentUser && !isProtectedAdmin && !isLastAdmin && <button type="button" onClick={() => confirmDelete(item)} className="min-h-10 rounded-md border border-[#E8C7C2] px-4 text-sm font-medium text-[#8F3028] transition hover:bg-[#FBF0EE]">Delete</button>}</div>
            </article>;
          })}</section>}

      {editor && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B2A4A]/40 p-3 sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) closeEditor(); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="user-editor-title" className="my-auto w-full max-w-xl rounded-lg border border-[#E8E0D0] bg-white shadow-[0_20px_60px_rgba(11,42,74,0.22)]">
          <header className="border-b border-[#F0ECE3] px-5 py-4 sm:px-6"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A7625]">Staff account</p><h2 id="user-editor-title" className="mt-1 text-lg font-semibold text-[#0B2A4A]">{editor.mode === "create" ? "Add User" : editor.mode === "edit" ? "Edit User" : "Change Password"}</h2></header>
          <form onSubmit={(event) => void saveUser(event)} className="space-y-4 px-5 py-5 sm:px-6">
            {editor.mode !== "password" ? <>
              <label className="block text-sm font-medium text-[#334155]">Name<input required maxLength={255} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-[#CBD5E1] px-3.5 text-sm outline-none focus:border-[#C89B2C] focus:ring-2 focus:ring-[#C89B2C]/15" /></label>
              <label className="block text-sm font-medium text-[#334155]">Email<input required type="email" maxLength={255} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-[#CBD5E1] px-3.5 text-sm outline-none focus:border-[#C89B2C] focus:ring-2 focus:ring-[#C89B2C]/15" /></label>
              {canAssignRoles && <label className="block text-sm font-medium text-[#334155]">Role<select required={editor.mode === "create"} value={roleId} disabled={roleIsProtected} onChange={(event) => setRoleId(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-sm outline-none focus:border-[#C89B2C] focus:ring-2 focus:ring-[#C89B2C]/15 disabled:bg-[#F7F7F5]"> <option value="">Select a role</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>{roleIsProtected && <span className="mt-1 block text-xs font-normal text-[#64748B]">This administrator role is protected to preserve account access.</span>}</label>}
              {editor.mode === "create" && <><label className="block text-sm font-medium text-[#334155]">Password<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-[#CBD5E1] px-3.5 text-sm outline-none focus:border-[#C89B2C] focus:ring-2 focus:ring-[#C89B2C]/15" /><span className="mt-1 block text-xs font-normal text-[#64748B]">Use at least 8 characters, including letters and numbers.</span></label><label className="block text-sm font-medium text-[#334155]">Confirm Password<input required type="password" minLength={8} autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-[#CBD5E1] px-3.5 text-sm outline-none focus:border-[#C89B2C] focus:ring-2 focus:ring-[#C89B2C]/15" /></label></>}
            </> : <><p className="text-sm leading-6 text-[#64748B]">Set a new sign-in password for <span className="font-medium text-[#334155]">{editor.user.name}</span>. The current password cannot be viewed.</p><label className="block text-sm font-medium text-[#334155]">New Password<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-[#CBD5E1] px-3.5 text-sm outline-none focus:border-[#C89B2C] focus:ring-2 focus:ring-[#C89B2C]/15" /><span className="mt-1 block text-xs font-normal text-[#64748B]">Use at least 8 characters, including letters and numbers.</span></label><label className="block text-sm font-medium text-[#334155]">Confirm New Password<input required type="password" minLength={8} autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-[#CBD5E1] px-3.5 text-sm outline-none focus:border-[#C89B2C] focus:ring-2 focus:ring-[#C89B2C]/15" /></label></>}
            {formError && <p role="alert" className="rounded-md border border-[#E8C7C2] bg-[#FBF0EE] px-3.5 py-2.5 text-sm leading-5 text-[#8F3028]">{formError}</p>}
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end"><button type="button" disabled={saving} onClick={closeEditor} className="min-h-11 rounded-md border border-[#CBD5E1] px-4 text-sm font-semibold text-[#475569] transition hover:bg-[#F7F7F5] disabled:opacity-60">Cancel</button><button type="submit" disabled={saving || (editor.mode === "create" && canAssignRoles && !roleId)} className="min-h-11 rounded-md bg-[#0B2A4A] px-5 text-sm font-semibold text-white transition hover:bg-[#123E68] disabled:cursor-wait disabled:opacity-60">{saving ? "Saving..." : editor.mode === "create" ? "Create User" : editor.mode === "edit" ? "Save Changes" : "Set New Password"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}
