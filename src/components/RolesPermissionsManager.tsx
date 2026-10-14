"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useConfirm, useToast } from "@/components/ToastProvider";
import {
  ApiError,
  createPermission,
  createRole,
  deletePermission,
  deleteRole,
  getCurrentPermissions,
  listPermissions,
  listRoles,
  syncRolePermissions,
  updatePermission,
  updateRole,
  type PermissionRecord,
  type RoleRecord,
} from "@/services/rolesPermissions";

type EditorState = {
  kind: "role" | "permission";
  id?: number;
  name: string;
  permissionIds: number[];
};

type DeleteTarget =
  | { kind: "role"; record: RoleRecord }
  | { kind: "permission"; record: PermissionRecord };

type PermissionGroup = { name: string; items: PermissionRecord[] };

const groupOrder = [
  "Marriage Profiles",
  "Members",
  "Matches",
  "Users & Staff",
  "Roles & Permissions",
];

function titleCase(value: string): string {
  return value
    .replaceAll(/[._-]+/g, " ")
    .replaceAll(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayRoleName(name: string): string {
  return name.toLowerCase() === "admin" ? "Administrator" : titleCase(name);
}

function describeRole(name: string): string {
  const normalized = name.toLowerCase();

  if (normalized.includes("admin")) return "Full access to marriage bureau operations.";
  if (normalized.includes("manager")) return "Oversees daily bureau operations and team workflows.";
  if (normalized.includes("reception")) return "Welcomes visitors and supports new member enquiries.";
  if (normalized.includes("counsel")) return "Guides members through introductions and next steps.";
  if (normalized.includes("entry")) return "Keeps member records accurate and up to date.";
  if (normalized.includes("viewer")) return "Read-only access to approved bureau information.";

  return "Access tailored to this staff role and its responsibilities.";
}

function permissionGroup(name: string): string {
  const prefix = name.split(".")[0]?.toLowerCase() ?? "other";

  if (["profile", "profiles", "marriage_profiles"].includes(prefix)) return "Marriage Profiles";
  if (prefix === "members") return "Members";
  if (prefix === "matches") return "Matches";
  if (prefix === "users") return "Users & Staff";
  if (["roles", "permissions"].includes(prefix)) return "Roles & Permissions";

  return titleCase(prefix);
}

function permissionLabel(name: string): string {
  const parts = name.split(".");
  const action = parts.pop() ?? "manage";
  let subject = parts.join(" ").replaceAll("_", " ");
  if (parts[0] === "users" && parts[1] === "roles") subject = "staff roles";
  if (parts[0] === "permissions") subject = "access options";
  const actionLabels: Record<string, string> = {
    view: "View",
    read: "View",
    create: "Create",
    edit: "Edit",
    update: "Edit",
    delete: "Delete",
    assign: "Assign",
    remove: "Remove",
    manage: "Manage",
  };

  return `${actionLabels[action] ?? titleCase(action)} ${titleCase(subject)}`.trim();
}

function groupPermissions(permissions: PermissionRecord[]): PermissionGroup[] {
  const groups = new Map<string, PermissionRecord[]>();

  for (const permission of permissions) {
    const name = permissionGroup(permission.name);
    groups.set(name, [...(groups.get(name) ?? []), permission]);
  }

  return [...groups.entries()]
    .sort(([first], [second]) => {
      const firstIndex = groupOrder.indexOf(first);
      const secondIndex = groupOrder.indexOf(second);
      return (firstIndex === -1 ? groupOrder.length : firstIndex) - (secondIndex === -1 ? groupOrder.length : secondIndex)
        || first.localeCompare(second);
    })
    .map(([name, items]) => ({ name, items }));
}

function RoleIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  const normalized = name.toLowerCase();
  let icon: ReactNode;

  if (normalized.includes("admin")) {
    icon = <><path d="M10 2.5 16 5v4.3c0 3.7-2.5 6.5-6 8.2-3.5-1.7-6-4.5-6-8.2V5l6-2.5Z" /><path d="m7.5 9.8 1.7 1.7 3.4-3.6" /></>;
  } else if (normalized.includes("manager")) {
    icon = <><rect x="2.5" y="6" width="15" height="11" rx="1.5" /><path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3h3A1.5 1.5 0 0 1 13 4.5V6m-10.5 4h15m-9-1v2h3v-2" /></>;
  } else if (normalized.includes("counsel")) {
    icon = <><path d="M10 16.8s-6.5-3.7-6.5-8.1A3.4 3.4 0 0 1 10 7.1a3.4 3.4 0 0 1 6.5 1.6c0 4.4-6.5 8.1-6.5 8.1Z" /><path d="M6.5 10h2l1-1.8 1.5 3 1-1.2h1.5" /></>;
  } else if (normalized.includes("entry")) {
    icon = <><path d="M5 3.5h7l3 3V17H5z" /><path d="M12 3.5V7h3M7.5 10h5m-5 2.5h5m-5 2.5h3" /></>;
  } else if (normalized.includes("viewer")) {
    icon = <><path d="M2.5 10s2.7-4.5 7.5-4.5 7.5 4.5 7.5 4.5-2.7 4.5-7.5 4.5S2.5 10 2.5 10Z" /><circle cx="10" cy="10" r="2" /></>;
  } else {
    icon = <><circle cx="10" cy="6.5" r="3" /><path d="M4 17a6 6 0 0 1 12 0" /></>;
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icon}
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <div role="status" aria-label="Loading role access" className="mx-auto w-full max-w-6xl animate-pulse">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-44 rounded bg-[#E9E4D9]" />
          <div className="h-7 w-64 rounded bg-[#E5E7EB]" />
          <div className="h-4 w-80 max-w-[75vw] rounded bg-[#E5E7EB]" />
        </div>
        <div className="h-11 w-32 rounded-md bg-[#E8E0D0]" />
      </div>
      <div className="mt-7 h-11 w-60 rounded-md bg-[#E5E7EB]" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-52 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)]">
            <div className="size-11 rounded-md bg-[#F1EEE6]" />
            <div className="mt-4 h-5 w-40 rounded bg-[#E5E7EB]" />
            <div className="mt-2 h-4 w-56 max-w-full rounded bg-[#E5E7EB]" />
            <div className="mt-6 h-8 w-full rounded bg-[#F1EEE6]" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading roles and permissions</span>
    </div>
  );
}

function friendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return error.message;
    if (error.status === 404) return "This item may have changed. Refresh the page and try again.";
    if (error.status === 422) return error.message;
  }

  return "Please try again.";
}

export default function RolesPermissionsManager() {
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [manageRole, setManageRole] = useState<RoleRecord | null>(null);
  const [permissionDraft, setPermissionDraft] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const { notify } = useToast();
  const requestConfirmation = useConfirm();
  const can = (permission: string) => capabilities.includes(permission);

  useEffect(() => {
    let isCurrent = true;

    async function load(): Promise<void> {
      try {
        const access = await getCurrentPermissions();
        if (!isCurrent) return;
        setCapabilities(access.permissions);

        if (!access.permissions.includes("roles.view")) {
          setHasAccess(false);
          return;
        }

        setHasAccess(true);
        const [roleResult, permissionResult] = await Promise.all([
          listRoles(),
          access.permissions.includes("permissions.view") ? listPermissions() : Promise.resolve({ permissions: [] }),
        ]);
        if (!isCurrent) return;
        setRoles(roleResult.roles);
        setPermissions(permissionResult.permissions);
      } catch (loadError) {
        if (isCurrent) {
          console.error("Unable to load role access", loadError);
          notify({
            variant: "error",
            title: "Unable to load roles and permissions",
            message: friendlyError(loadError),
          });
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    void load();
    return () => {
      isCurrent = false;
    };
  }, [notify]);

  async function refreshLists(): Promise<void> {
    const [roleResult, permissionResult] = await Promise.all([
      can("roles.view") ? listRoles() : Promise.resolve({ roles: [] }),
      can("permissions.view") ? listPermissions() : Promise.resolve({ permissions: [] }),
    ]);
    setRoles(roleResult.roles);
    setPermissions(permissionResult.permissions);
    if (manageRole) {
      setManageRole(roleResult.roles.find((role) => role.id === manageRole.id) ?? null);
    }
  }

  function reportError(title: string, cause: unknown): void {
    console.error(title, cause);
    notify({ variant: "error", title, message: friendlyError(cause) });
  }

  function announce(message: string): void {
    notify({ variant: "success", title: message });
  }

  function openEditor(kind: EditorState["kind"], record?: RoleRecord | PermissionRecord): void {
    setEditor({
      kind,
      id: record?.id,
      name: record?.name ?? "",
      permissionIds: [],
    });
  }

  function openPermissionManager(role: RoleRecord): void {
    setManageRole(role);
    setPermissionDraft(role.permissions.map((permission) => permission.id));
  }

  async function saveEditor(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!editor) return;

    const name = editor.name.trim();
    if (!name) {
      notify({ variant: "warning", title: "A name is required", message: "Enter a name before saving." });
      return;
    }

    setPending(true);

    try {
      if (editor.kind === "role") {
        const response = editor.id
          ? await updateRole(editor.id, name)
          : await createRole(name);
        if (!editor.id && editor.permissionIds.length && can("roles.edit")) {
          await syncRolePermissions(response.role.id, editor.permissionIds);
        }
        await refreshLists();
        announce(editor.id ? "Role updated successfully" : "Role created successfully");
      } else {
        if (editor.id) {
          await updatePermission(editor.id, name);
        } else {
          await createPermission(name);
        }
        await refreshLists();
        announce(editor.id ? "Permission updated successfully" : "Permission created successfully");
      }
      setEditor(null);
    } catch (saveError) {
      reportError(editor.kind === "role" ? "Unable to save role" : "Unable to save permission", saveError);
    } finally {
      setPending(false);
    }
  }

  function togglePermission(id: number): void {
    setPermissionDraft((current) => current.includes(id)
      ? current.filter((permissionId) => permissionId !== id)
      : [...current, id]);
  }

  function togglePermissionGroup(group: PermissionGroup): void {
    const groupIds = group.items.map((permission) => permission.id);
    const groupIsSelected = groupIds.every((id) => permissionDraft.includes(id));

    setPermissionDraft((current) => groupIsSelected
      ? current.filter((id) => !groupIds.includes(id))
      : [...new Set([...current, ...groupIds])]);
  }

  async function saveRolePermissions(): Promise<void> {
    if (!manageRole) return;

    setPending(true);
    try {
      const response = await syncRolePermissions(manageRole.id, permissionDraft);
      setRoles((current) => current.map((role) => role.id === response.role.id ? response.role : role));
      setManageRole(response.role);
      setPermissionDraft(response.role.permissions.map((permission) => permission.id));
      announce("Permissions updated successfully");
    } catch (saveError) {
      reportError("Unable to update permissions", saveError);
    } finally {
      setPending(false);
    }
  }

  function requestDelete(target: DeleteTarget): void {
    const isRole = target.kind === "role";
    const errorTitle = isRole ? "Unable to delete role" : "Unable to delete permission";

    requestConfirmation({
      title: isRole ? "Delete Role?" : "Delete Permission?",
      message: isRole
        ? `Are you sure you want to delete the "${displayRoleName(target.record.name)}" role? Users assigned to this role may lose their associated permissions.`
        : `Are you sure you want to delete the "${target.record.name}" permission? Roles using it will lose this access.`,
      confirmLabel: isRole ? "Delete Role" : "Delete Permission",
      pendingLabel: isRole ? "Deleting role..." : "Deleting permission...",
      destructive: true,
      onConfirm: async () => {
        if (target.kind === "role") {
          await deleteRole(target.record.id);
          if (manageRole?.id === target.record.id) setManageRole(null);
        } else {
          await deletePermission(target.record.id);
        }

        await refreshLists();
        announce(isRole ? "Role deleted successfully" : "Permission deleted successfully");
      },
      onError: (deleteError) => reportError(errorTitle, deleteError),
    });
  }

  const permissionGroups = groupPermissions(permissions);
  const roleCount = roles.length;
  const permissionCount = permissions.length;

  if (loading) return <LoadingSkeleton />;

  if (hasAccess === false) {
    return (
      <section className="mx-auto max-w-3xl rounded-lg border border-[#E5E7EB] bg-white p-7 shadow-[0_2px_8px_rgba(23,32,51,0.035)]">
        <h1 className="text-lg font-semibold text-[#172033]">Access unavailable</h1>
        <p className="mt-2 text-sm text-[#64748B]">Your account does not have access to staff roles.</p>
      </section>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] font-sans text-[#172033]">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#A47D25]">Trust Forever Marriage Bureau</p>
          <h1 className="mt-1.5 text-2xl font-semibold text-[#0B2A4A]">Roles &amp; Permissions</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#64748B]">Manage staff roles and control access across your marriage bureau.</p>
        </div>
        {activeTab === "roles" && can("roles.create") && (
          <button type="button" onClick={() => openEditor("role")} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0B2A4A] px-4 text-sm font-semibold text-white shadow-[0_2px_5px_rgba(11,42,74,0.12)] transition hover:bg-[#123E68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]">
            <span aria-hidden="true" className="text-lg leading-none">+</span>
            Create Role
          </button>
        )}
      </header>

      <nav aria-label="Access management sections" className="mt-6 flex gap-1 border-b border-[#DDE1E5]">
        <button type="button" aria-current={activeTab === "roles" ? "page" : undefined} onClick={() => setActiveTab("roles")} className={`relative min-h-11 px-4 text-sm font-semibold transition ${activeTab === "roles" ? "text-[#0B2A4A] after:absolute after:inset-x-3 after:bottom-[-1px] after:h-0.5 after:bg-[#C89B2C]" : "text-[#64748B] hover:text-[#0B2A4A]"}`}>
          Roles <span className="ml-1.5 text-xs font-medium text-[#94A3B8]">{roleCount}</span>
        </button>
        {can("permissions.view") && (
          <button type="button" aria-current={activeTab === "permissions" ? "page" : undefined} onClick={() => setActiveTab("permissions")} className={`relative min-h-11 px-4 text-sm font-semibold transition ${activeTab === "permissions" ? "text-[#0B2A4A] after:absolute after:inset-x-3 after:bottom-[-1px] after:h-0.5 after:bg-[#C89B2C]" : "text-[#64748B] hover:text-[#0B2A4A]"}`}>
            Permissions <span className="ml-1.5 text-xs font-medium text-[#94A3B8]">{permissionCount}</span>
          </button>
        )}
      </nav>

      {activeTab === "roles" ? (
        roles.length ? (
          <section aria-label="Staff roles" className="mt-5 grid gap-4 sm:grid-cols-2">
            {roles.map((role) => (
              <article key={role.id} className="flex min-w-0 flex-col rounded-lg border border-[#E4E5E2] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)] transition hover:border-[#D8C99F] hover:shadow-[0_4px_14px_rgba(23,32,51,0.06)] sm:p-6">
                <div className="flex min-w-0 items-start gap-3.5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-[#EFE8D5] bg-[#FBF8EF] text-[#9A7625]">
                    <RoleIcon name={role.name} />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h2 className="truncate text-base font-semibold text-[#0B2A4A]">{displayRoleName(role.name)}</h2>
                    <p className="mt-1 text-sm leading-5 text-[#64748B]">{describeRole(role.name)}</p>
                  </div>
                  {role.name.toLowerCase() === "admin" && <span className="shrink-0 rounded-full border border-[#E9DFC4] bg-[#FBF8EF] px-2.5 py-1 text-[11px] font-semibold text-[#8E6C20]">Core role</span>}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-[#EEF0F2] py-3.5 text-xs text-[#64748B]">
                  <span className="inline-flex items-center gap-2"><span className="flex size-6 items-center justify-center rounded bg-[#F7F7F5] text-[#8E6C20]"><RoleIcon name="viewer" className="size-3.5" /></span><strong className="font-semibold text-[#334155]">{role.permissions.length}</strong> permissions</span>
                  <span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#C89B2C]" />Staff access profile</span>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                  {can("roles.edit") && <button type="button" onClick={() => openEditor("role", role)} className="text-xs font-semibold text-[#475569] underline decoration-[#CBD5E1] underline-offset-4 transition hover:text-[#0B2A4A] hover:decoration-[#C89B2C]">Edit</button>}
                  {can("roles.view") && <button type="button" onClick={() => openPermissionManager(role)} className="text-xs font-semibold text-[#0B2A4A] underline decoration-[#C89B2C]/60 underline-offset-4 transition hover:text-[#9A7625]">Manage Permissions</button>}
                  {can("roles.delete") && role.name.toLowerCase() !== "admin" && <button type="button" onClick={() => requestDelete({ kind: "role", record: role })} className="ml-auto text-xs font-semibold text-[#8F514A] underline decoration-[#E8C7C2] underline-offset-4 transition hover:text-[#782E28]">Delete</button>}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-5 flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-[#D8D4C9] bg-white px-6 py-12 text-center shadow-[0_2px_8px_rgba(23,32,51,0.025)]">
            <span className="flex size-14 items-center justify-center rounded-full border border-[#EFE8D5] bg-[#FBF8EF] text-[#9A7625]"><RoleIcon name="admin" className="size-6" /></span>
            <h2 className="mt-4 text-base font-semibold text-[#172033]">No roles created yet</h2>
            <p className="mt-1.5 max-w-md text-sm leading-6 text-[#64748B]">Create roles to control what your marriage bureau staff can access.</p>
            {can("roles.create") && <button type="button" onClick={() => openEditor("role")} className="mt-5 min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-semibold text-white transition hover:bg-[#123E68]">Create First Role</button>}
          </section>
        )
      ) : (
        <section className="mt-5 space-y-4" aria-label="Available permissions">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#E9E3D6] bg-[#FBF8EF] px-4 py-3">
            <p className="text-sm text-[#5F6470]">Access options used across your staff roles.</p>
            {can("permissions.create") && <button type="button" onClick={() => openEditor("permission")} className="min-h-9 rounded-md border border-[#D7C89E] bg-white px-3.5 text-sm font-semibold text-[#0B2A4A] transition hover:bg-[#F7F2E5]">Create Permission</button>}
          </div>
          {permissionGroups.length ? permissionGroups.map((group) => (
            <section key={group.name} className="rounded-lg border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(23,32,51,0.03)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#EEF0F2] px-5 py-3.5">
                <div><h2 className="text-sm font-semibold text-[#0B2A4A]">{group.name}</h2><p className="mt-0.5 text-xs text-[#64748B]">{group.items.length} access options</p></div>
              </div>
              <ul className="divide-y divide-[#F0F1F2] px-5">
                {group.items.map((permission) => (
                  <li key={permission.id} className="flex min-h-12 items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0 text-sm text-[#334155]">{permissionLabel(permission.name)}</span>
                    <div className="flex shrink-0 items-center gap-3">
                      {can("permissions.edit") && <button type="button" onClick={() => openEditor("permission", permission)} className="text-xs font-semibold text-[#475569] hover:text-[#0B2A4A]">Edit</button>}
                      {can("permissions.delete") && <button type="button" onClick={() => requestDelete({ kind: "permission", record: permission })} className="text-xs font-semibold text-[#8F514A] hover:text-[#782E28]">Delete</button>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )) : (
            <section className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-[#D8D4C9] bg-white px-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#FBF8EF] text-[#9A7625]"><RoleIcon name="entry" /></span>
              <h2 className="mt-3 text-sm font-semibold text-[#172033]">No permissions available</h2>
              <p className="mt-1 text-sm text-[#64748B]">Create a permission to make it available to staff roles.</p>
            </section>
          )}
        </section>
      )}

      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2A4A]/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) setEditor(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="access-editor-title" className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_20px_60px_rgba(11,42,74,0.2)]">
            <div className="border-b border-[#EEF0F2] px-5 py-4 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#A47D25]">Staff access</p>
              <h2 id="access-editor-title" className="mt-1 text-lg font-semibold text-[#0B2A4A]">{editor.id ? "Edit" : "Create"} {editor.kind === "role" ? "Role" : "Permission"}</h2>
              <p className="mt-1 text-sm text-[#64748B]">{editor.kind === "role" ? "Give this staff group a clear name and access profile." : "Add an access option for your staff roles."}</p>
            </div>
            <form onSubmit={(event) => void saveEditor(event)} className="px-5 py-5 sm:px-6">
              <label htmlFor="access-name" className="block text-sm font-semibold text-[#334155]">{editor.kind === "role" ? "Role Name" : "Permission Name"}</label>
              <input id="access-name" autoFocus required maxLength={255} value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} className="mt-1.5 min-h-11 w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-sm text-[#172033] outline-none transition placeholder:text-[#94A3B8] focus:border-[#A47D25] focus:ring-2 focus:ring-[#C89B2C]/15" placeholder={editor.kind === "role" ? "e.g. Receptionist" : "e.g. profiles.view"} />
              {editor.kind === "role" && <p className="mt-2 text-xs leading-5 text-[#64748B]">{describeRole(editor.name || "staff")} Descriptions are suggested from the role name and are not stored by the current service.</p>}

              {editor.kind === "role" && !editor.id && can("roles.edit") && can("permissions.view") && permissions.length > 0 && (
                <details className="mt-5 rounded-md border border-[#E5E7EB] bg-[#FCFCFA]">
                  <summary className="cursor-pointer px-3.5 py-3 text-sm font-semibold text-[#334155]">Choose permissions now <span className="ml-1 text-xs font-normal text-[#64748B]">Optional</span></summary>
                  <div className="max-h-52 overflow-y-auto border-t border-[#E5E7EB] px-3.5 py-2">
                    {permissionGroups.map((group) => (
                      <fieldset key={group.name} className="py-2">
                        <legend className="text-xs font-semibold text-[#8E6C20]">{group.name}</legend>
                        <div className="mt-1 grid gap-x-3 sm:grid-cols-2">
                          {group.items.map((permission) => (
                            <label key={permission.id} className="flex min-h-9 items-center gap-2.5 text-xs text-[#475569]">
                              <input type="checkbox" checked={editor.permissionIds.includes(permission.id)} onChange={() => setEditor((current) => current ? { ...current, permissionIds: current.permissionIds.includes(permission.id) ? current.permissionIds.filter((id) => id !== permission.id) : [...current.permissionIds, permission.id] } : current)} className="size-4 accent-[#0B2A4A]" />
                              <span>{permissionLabel(permission.name)}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </details>
              )}

              <div className="mt-6 flex justify-end gap-2 border-t border-[#EEF0F2] pt-4">
                <button type="button" disabled={pending} onClick={() => setEditor(null)} className="min-h-10 rounded-md border border-[#CBD5E1] px-4 text-sm font-semibold text-[#475569] transition hover:bg-[#F7F7F5] disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={pending || !editor.name.trim()} className="min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-semibold text-white transition hover:bg-[#123E68] disabled:cursor-wait disabled:opacity-60">{pending ? "Saving..." : editor.id ? "Save Changes" : `Create ${editor.kind === "role" ? "Role" : "Permission"}`}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {manageRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2A4A]/40 p-3 sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) setManageRole(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="manage-permissions-title" className="flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#FCFCFA] shadow-[0_20px_60px_rgba(11,42,74,0.22)]">
            <header className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] bg-white px-5 py-4 sm:px-7 sm:py-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[#EFE8D5] bg-[#FBF8EF] text-[#9A7625]"><RoleIcon name={manageRole.name} /></span>
                <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#A47D25]">Role access</p><h2 id="manage-permissions-title" className="mt-0.5 truncate text-lg font-semibold text-[#0B2A4A]">Manage Permissions</h2><p className="mt-0.5 text-sm text-[#64748B]">{displayRoleName(manageRole.name)} · Manage access for this role</p></div>
              </div>
              <button type="button" aria-label="Close permissions" onClick={() => setManageRole(null)} disabled={pending} className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] text-[#64748B] transition hover:bg-[#F7F7F5] hover:text-[#172033] disabled:opacity-50"><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] bg-[#FBF8EF]/70 px-5 py-3 sm:px-7">
              <p aria-live="polite" className="text-sm font-medium text-[#475569]">{permissionDraft.length} of {permissions.length} permissions enabled</p>
              <div className="flex items-center gap-3">
                <button type="button" disabled={pending || !permissions.length} onClick={() => setPermissionDraft(permissions.map((permission) => permission.id))} className="text-xs font-semibold text-[#0B2A4A] underline decoration-[#C89B2C]/70 underline-offset-4 disabled:opacity-40">Select All Permissions</button>
                <span aria-hidden="true" className="h-4 border-l border-[#D8D4C9]" />
                <button type="button" disabled={pending || !permissionDraft.length} onClick={() => setPermissionDraft([])} className="text-xs font-semibold text-[#64748B] underline decoration-[#CBD5E1] underline-offset-4 disabled:opacity-40">Clear All</button>
              </div>
            </div>

            <div className="overflow-y-auto px-4 py-4 sm:px-7 sm:py-5">
              {permissionGroups.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {permissionGroups.map((group) => {
                    const groupIds = group.items.map((permission) => permission.id);
                    const allSelected = groupIds.every((id) => permissionDraft.includes(id));
                    return (
                      <section key={group.name} className="rounded-md border border-[#E4E5E2] bg-white">
                        <div className="flex items-center justify-between gap-3 border-b border-[#EEF0F2] px-4 py-3">
                          <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-[#0B2A4A]">{group.name}</h3><p className="mt-0.5 text-[11px] text-[#64748B]">{group.items.length} permissions</p></div>
                          <button type="button" disabled={pending || !can("roles.edit")} onClick={() => togglePermissionGroup(group)} className="shrink-0 text-[11px] font-semibold text-[#8E6C20] underline decoration-[#D8C99F] underline-offset-4 disabled:opacity-40">{allSelected ? "Clear group" : "Select all"}</button>
                        </div>
                        <div className="px-4 py-1.5">
                          {group.items.map((permission) => (
                            <label key={permission.id} className="flex min-h-10 items-center gap-3 border-b border-[#F3F3F1] py-2 last:border-0">
                              <input type="checkbox" checked={permissionDraft.includes(permission.id)} disabled={pending || !can("roles.edit")} onChange={() => togglePermission(permission.id)} className="size-4 shrink-0 accent-[#0B2A4A]" />
                              <span className="min-w-0 text-sm text-[#475569]">{permissionLabel(permission.name)}</span>
                            </label>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed border-[#D8D4C9] bg-white px-5 text-center">
                  <h3 className="text-sm font-semibold text-[#172033]">No permissions available</h3>
                  <p className="mt-1 text-sm text-[#64748B]">Create permissions before assigning access to this role.</p>
                </div>
              )}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] bg-white px-5 py-3.5 sm:px-7">
              <p className="text-xs text-[#64748B]">Changes apply to everyone assigned this role.</p>
              <div className="flex gap-2">
                <button type="button" disabled={pending} onClick={() => setManageRole(null)} className="min-h-10 rounded-md border border-[#CBD5E1] px-4 text-sm font-semibold text-[#475569] hover:bg-[#F7F7F5] disabled:opacity-50">Close</button>
                {can("roles.edit") && <button type="button" disabled={pending} onClick={() => void saveRolePermissions()} className="min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-semibold text-white transition hover:bg-[#123E68] disabled:cursor-wait disabled:opacity-60">{pending ? "Saving..." : "Save Permissions"}</button>}
              </div>
            </footer>
          </section>
        </div>
      )}

    </div>
  );
}
