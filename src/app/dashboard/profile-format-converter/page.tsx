"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { convertMatrimonialProfileText } from "@/lib/convertMatrimonialProfile";

type Screen = "input" | "processing" | "result";

export default function ProfileFormatConverterPage() {
  const [screen, setScreen] = useState<Screen>("input");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { notify } = useToast();

  function formatProfile(): void {
    if (!input.trim() || screen === "processing") return;
    setOutput("");
    setWarnings([]);
    setError("");
    setScreen("processing");

    // Yield through a paint so the animated processing scene is visible while
    // the existing synchronous, local converter runs on the next task.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          try {
            const result = convertMatrimonialProfileText(input);
            setOutput(result.text);
            setWarnings(result.warnings);
            setScreen("result");
          } catch {
            setError("We couldn't format this profile. Please review the pasted text and try again.");
            setScreen("input");
          }
        }, 0);
      });
    });
  }

  async function copyOutput(): Promise<void> {
    try {
      await navigator.clipboard.writeText(output);
      notify({ variant: "success", title: "Profile copied", message: "The formatted profile is ready to paste into Auto-Fill." });
    } catch {
      notify({ variant: "error", title: "Copy unavailable", message: "Select and copy the formatted text manually." });
    }
  }

  function editInput(): void {
    setScreen("input");
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  function clearInput(): void {
    setInput("");
    setOutput("");
    setWarnings([]);
    setError("");
  }

  const frame = "mx-auto flex h-[calc(100dvh-100px)] min-h-[440px] w-full max-w-6xl flex-col overflow-hidden lg:h-[calc(100dvh-132px)]";
  const textarea = "min-h-0 w-full flex-1 resize-none rounded-lg border border-[#D8D2C5] bg-white px-4 py-3.5 text-sm leading-6 text-[#172033] outline-none transition placeholder:text-[#9A9A92] focus:border-[#B18A31] focus:ring-4 focus:ring-[#C89B2C]/10 motion-reduce:transition-none";

  return (
    <main className={frame}>
      <header className="flex shrink-0 items-center justify-between gap-3 px-1 pb-3 sm:pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#E7DFC9] bg-white shadow-sm sm:size-11"><Image src="/images/logo-icon.png" alt="Trust Forever" width={34} height={34} className="size-8 object-contain" priority /></span>
          <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#9A7625]">TRUST FOREVER · PROFILE TOOLS</p><h1 className="mt-0.5 truncate text-lg font-semibold tracking-[-0.02em] text-[#0B2A4A] sm:text-xl">Profile Format Converter</h1></div>
        </div>
        <div className="hidden items-center gap-1.5 text-[11px] font-medium text-[#707782] sm:flex">
          {(["Paste", "Format", "Copy"] as const).map((step, index) => <span key={step} className="inline-flex items-center gap-1.5"><span className={`flex size-5 items-center justify-center rounded-full text-[10px] ${screen === "input" && index === 0 || screen === "processing" && index === 1 || screen === "result" && index === 2 ? "bg-[#0B2A4A] text-white" : "bg-[#EEE9DB] text-[#80621F]"}`}>{index + 1}</span>{step}{index < 2 && <span className="mx-1 text-[#C9B981]">/</span>}</span>)}
        </div>
      </header>

      <section aria-label="Profile formatting workspace" className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E4DDCC] bg-white shadow-[0_12px_38px_rgba(23,32,51,0.08)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0B2A4A_0%,#B28A2E_48%,#E9DFC3_100%)]" />

        {screen === "input" && <div key="input" className="flex min-h-0 flex-1 flex-col p-4 pt-5 motion-safe:animate-[converter-enter_240ms_ease-out_both] sm:p-6 sm:pt-7 lg:p-7 lg:pt-8">
          <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A7625]">Step 1 · Original details</p><h2 className="mt-1 text-lg font-semibold text-[#0B2A4A] sm:text-xl">Paste your profile</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[#687180] sm:text-sm">Add the full text from WhatsApp or another source. We’ll organize recognized details and flag anything uncertain.</p></div>
            <span className="hidden shrink-0 rounded-full border border-[#E8E0D0] bg-[#FCFBF8] px-3 py-1.5 text-[10px] font-medium text-[#77766E] md:inline-flex">Processed privately on this device</span>
          </div>
          <label htmlFor="profile-format-input" className="sr-only">Original profile text</label>
          <textarea ref={inputRef} id="profile-format-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Paste the complete matrimonial profile here…" className={textarea} />
          {error && <p role="alert" className="mt-3 shrink-0 rounded-lg border border-[#E8C7C2] bg-[#FBF2F0] px-3 py-2 text-sm text-[#8F3028]">{error}</p>}
          <div className="mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-[#F0EDE6] pt-4">
            <button type="button" onClick={clearInput} disabled={!input && !output && !error} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D8D6CF] px-3.5 text-sm font-medium text-[#526071] transition hover:bg-[#FAF9F6] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none motion-reduce:transform-none"><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4"><path d="M4.5 5.5h11m-9.5 0 .7 11h7.6l.7-11M8 5.5V3.8h4v1.7m-3 3v5m2-5v5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg>Clear</button>
            <button type="button" onClick={formatProfile} disabled={!input.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0B2A4A] px-5 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(11,42,74,0.17)] transition hover:bg-[#123E68] hover:shadow-[0_5px_14px_rgba(11,42,74,0.2)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 sm:min-w-44 motion-reduce:transition-none motion-reduce:transform-none"><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-[18px]"><path d="M10 2.5v3m0 9v3m7.5-7.5h-3m-9 0h-3m13.8-5.3-2.1 2.1m-6.4 6.4-2.1 2.1m10.6 0-2.1-2.1m-6.4-6.4L5.7 3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.4"/></svg>Format Profile</button>
          </div>
        </div>}

        {screen === "processing" && <div key="processing" role="status" aria-live="polite" className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#FFFEFA_0%,#F7F3E8_70%,#F2EDDF_100%)] motion-safe:animate-[converter-enter_220ms_ease-out_both]">
          <div aria-hidden="true" className="absolute left-[18%] top-[25%] size-1 rounded-full bg-[#C89B2C] motion-safe:animate-[converter-drift_3.6s_ease-in-out_infinite] motion-reduce:animate-none" />
          <div aria-hidden="true" className="absolute right-[21%] top-[31%] size-1.5 rounded-full bg-[#D8C68F] motion-safe:animate-[converter-drift_4.2s_ease-in-out_infinite_-1.2s] motion-reduce:animate-none" />
          <div aria-hidden="true" className="absolute bottom-[28%] left-[27%] size-1 rounded-full bg-[#D8C68F] motion-safe:animate-[converter-drift_3.9s_ease-in-out_infinite_-2s] motion-reduce:animate-none" />
          <div className="relative flex size-44 items-center justify-center sm:size-52">
            <span aria-hidden="true" className="absolute inset-2 rounded-full border border-[#D8C68F]/70 motion-safe:animate-[converter-orbit_12s_linear_infinite] motion-reduce:animate-none"><i className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-[#B28A2E] shadow-[0_0_14px_3px_rgba(178,138,46,0.25)]" /></span>
            <span aria-hidden="true" className="absolute inset-5 rounded-full border border-dashed border-[#0B2A4A]/20 motion-safe:animate-[converter-orbit_19s_linear_infinite_reverse] motion-reduce:animate-none"><i className="absolute bottom-[12%] right-[12%] size-1.5 rounded-full bg-[#0B2A4A]/55" /></span>
            <span aria-hidden="true" className="absolute inset-10 rounded-full border border-[#D8C68F]/55 motion-safe:animate-[converter-breathe_2.6s_ease-in-out_infinite] motion-reduce:animate-none" />
            <span className="relative z-10 flex size-[76px] items-center justify-center rounded-2xl border border-[#E7DFC9] bg-white shadow-[0_8px_24px_rgba(11,42,74,0.1)] sm:size-[88px]"><Image src="/images/logo-icon.png" alt="" width={64} height={64} className="size-14 object-contain sm:size-16" priority /></span>
          </div>
          <div className="relative mt-2 text-center"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7625]">TRUST FOREVER</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#0B2A4A] sm:text-2xl">Preparing Your Profile</h2><p className="mt-2 text-sm text-[#687180]">Arranging the details into a clear, consistent format.</p><div aria-hidden="true" className="mx-auto mt-5 flex gap-1.5"><span className="size-1.5 rounded-full bg-[#B28A2E] motion-safe:animate-[converter-breathe_1s_ease-in-out_infinite] motion-reduce:animate-none"/><span className="size-1.5 rounded-full bg-[#B28A2E]/70 motion-safe:animate-[converter-breathe_1s_ease-in-out_infinite_150ms] motion-reduce:animate-none"/><span className="size-1.5 rounded-full bg-[#B28A2E]/45 motion-safe:animate-[converter-breathe_1s_ease-in-out_infinite_300ms] motion-reduce:animate-none"/></div></div>
        </div>}

        {screen === "result" && <div key="result" className="flex min-h-0 flex-1 flex-col p-4 pt-5 motion-safe:animate-[converter-enter_280ms_cubic-bezier(0.2,0.7,0.2,1)_both] sm:p-6 sm:pt-7 lg:p-7 lg:pt-8">
          <div className="mb-3 flex shrink-0 flex-wrap items-start justify-between gap-3">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A7625]">Step 3 · Ready to review</p><h2 className="mt-1 text-lg font-semibold text-[#0B2A4A] sm:text-xl">Formatted Profile</h2><p className="mt-1 text-xs text-[#687180] sm:text-sm">Review or edit the text before copying it into Auto-Fill.</p></div>
            <div className="flex gap-2"><button type="button" onClick={editInput} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#D8D6CF] px-3 text-xs font-semibold text-[#526071] transition hover:bg-[#FAF9F6] active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none"><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-3.5"><path d="m12.8 4.2 3 3M3.5 16.5l3.7-.8L16 6.9a2.1 2.1 0 0 0-3-3l-8.8 8.8-.7 3.8Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Edit Input</button><button type="button" onClick={() => void copyOutput()} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#0B2A4A] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123E68] active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none"><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-3.5"><rect x="7" y="6" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M12 6V4.5A1.5 1.5 0 0 0 10.5 3h-6A1.5 1.5 0 0 0 3 4.5v8A1.5 1.5 0 0 0 4.5 14H7" stroke="currentColor" strokeWidth="1.4"/></svg>Copy Output</button></div>
          </div>
          <label htmlFor="profile-format-output" className="sr-only">Formatted profile text</label>
          <textarea id="profile-format-output" value={output} onChange={(event) => setOutput(event.target.value)} className={`${textarea} bg-[#FCFBF8]`} />
          {warnings.length > 0 && <div className="mt-2 max-h-24 shrink-0 overflow-y-auto rounded-lg border border-[#E9D9A7] bg-[#FBF8EF] px-3 py-2" role="status"><p className="text-xs font-semibold text-[#745A1B]">Please review uncertain details</p><ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs leading-4 text-[#6B5A31]">{warnings.map((warning, index) => <li key={`${index}-${warning}`}>{warning}</li>)}</ul></div>}
        </div>}
      </section>
      <p className="shrink-0 pt-2 text-center text-[10px] text-[#858982]">Your profile text is formatted locally and is not sent to an external service.</p>
    </main>
  );
}
