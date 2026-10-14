"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";

const rememberedEmailKey = "trust-forever-remembered-email";

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0 text-[#D9A93E]" fill="currentColor">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0 text-[#D9A93E]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 9-9m-3 3 3 3m-6-0 2 2" />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const rememberedEmail = window.localStorage.getItem(rememberedEmailKey);

      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberDevice(true);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      if (rememberDevice) {
        window.localStorage.setItem(rememberedEmailKey, email.trim());
      } else {
        window.localStorage.removeItem(rememberedEmailKey);
      }
      router.replace("/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClass =
    "flex h-12 items-center gap-3 rounded-full border border-white/35 bg-black/25 px-4 transition focus-within:border-[#D9A93E] focus-within:ring-2 focus-within:ring-[#D9A93E]/30";
  const inputClass =
    "w-full bg-transparent text-sm text-white outline-none placeholder:text-[#F1D9A0]";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#2a1410] px-4 py-12">
      {/* Background photo */}
      <Image
        src="/images/background.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />

      {/* Glass card */}
      <section className="relative z-10 w-full max-w-[320px] rounded-2xl border border-white/30 bg-white/15 px-7 pb-8 pt-[12.5rem] shadow-[0_12px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl min-[600px]:max-w-[400px] sm:pt-56 lg:max-w-[440px]">
        <Image
          src="/images/signup-logo.png"
          alt="Trust Forever Marriage Bureau"
          width={220}
          height={110}
          priority
          className="absolute left-1/2 top-0 z-20 h-auto w-[min(88vw,20rem)] max-w-[85%] -translate-x-1/2 -translate-y-[20%] object-contain"
        />

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label htmlFor="email" className="sr-only">
            Account profile or email
          </label>
          <div className={fieldClass}>
            <UserIcon />
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="username"
              required
              placeholder="Account Profile / Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </div>

          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <div className={fieldClass}>
            <KeyIcon />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#F1D9A0] transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9A93E]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {showPassword ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.1-2.3 3.1M6.2 6.2C3.9 7.7 2.8 9.7 2.5 12c.5 1.3 1.5 2.8 3.1 4.1A10.2 10.2 0 0 0 12 19c1 0 2-.2 2.9-.5" /></> : <><path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="3" /></>}
              </svg>
            </button>
          </div>

          {error && (
            <div role="alert" className="flex w-full min-w-0 items-start gap-2.5 rounded-xl border border-[#F3A49A]/50 bg-[#3B1717]/85 px-3.5 py-3 text-left shadow-sm sm:px-4">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-[#FFB4AA]" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7.5v5m0 3.5h.01" strokeLinecap="round" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-5 text-[#FFE4DF]">Sign-in unsuccessful</p>
                <p className="mt-0.5 break-words text-sm leading-5 text-[#FFD0C9]">{error}</p>
              </div>
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-2 px-1 text-sm text-white">
            <input
              type="checkbox"
              name="rememberDevice"
              checked={rememberDevice}
              onChange={(event) => setRememberDevice(event.target.checked)}
              className="size-4 accent-[#D9A93E]"
            />
            Remember this device
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#B8862B] via-[#E6BD62] to-[#B8862B] text-sm font-medium uppercase tracking-wide text-[#2a1a05] shadow-[0_4px_14px_rgba(200,155,44,0.45)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? "Connecting..." : "Connect now"}
          </button>
        </form>

      </section>
    </main>
  );
}
