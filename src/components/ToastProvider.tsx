"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastOptions = {
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
};

export type ConfirmationOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  pendingLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onError?: (error: unknown) => void;
};

type ToastItem = ToastOptions & { id: number };

type FeedbackContextValue = {
  notify: (options: ToastOptions) => void;
  requestConfirmation: (options: ConfirmationOptions) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const toastStyles: Record<ToastVariant, {
  border: string;
  iconBackground: string;
  iconText: string;
  icon: string;
}> = {
  success: {
    border: "border-[#C9DFD1]",
    iconBackground: "bg-[#EAF3ED]",
    iconText: "text-[#286344]",
    icon: "✓",
  },
  error: {
    border: "border-[#E8C7C2]",
    iconBackground: "bg-[#FBF0EE]",
    iconText: "text-[#8F3028]",
    icon: "×",
  },
  warning: {
    border: "border-[#E8D9AA]",
    iconBackground: "bg-[#FBF5E4]",
    iconText: "text-[#8E6C20]",
    icon: "!",
  },
  info: {
    border: "border-[#CBD8E8]",
    iconBackground: "bg-[#EEF3F8]",
    iconText: "text-[#0B2A4A]",
    icon: "i",
  },
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const [isClosing, setIsClosing] = useState(false);
  const closing = useRef(false);
  const duration = toast.duration ?? (toast.variant === "error" ? 7000 : 4200);

  const dismiss = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setIsClosing(true);
    window.setTimeout(() => onDismiss(toast.id), 160);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(dismiss, duration);
    return () => window.clearTimeout(timeoutId);
  }, [dismiss, duration]);

  const styles = toastStyles[toast.variant];

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
      className={`flex w-full items-center gap-3 rounded-xl border ${styles.border} bg-white px-4 py-3.5 text-[#172033] shadow-[0_10px_32px_rgba(23,32,51,0.16)] sm:gap-4 sm:px-5 ${isClosing ? "animate-[toast-exit_160ms_ease-in_forwards]" : "animate-[toast-enter_180ms_ease-out]"} motion-reduce:animate-none`}
    >
      <Image src="/images/signup-logo.png" alt="Trust Forever Marriage Bureau" width={220} height={110} className="h-auto w-[76px] shrink-0 object-contain sm:w-[92px]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${styles.iconBackground} ${styles.iconText}`}>
            {styles.icon}
          </span>
          <p className="text-sm font-semibold leading-5">{toast.title}</p>
        </div>
        {toast.message && <p className="mt-1 text-sm leading-5 text-[#64748B]">{toast.message}</p>}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={dismiss}
        className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-md text-lg leading-none text-[#64748B] transition hover:bg-[#F7F7F5] hover:text-[#172033] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#C89B2C]"
      >
        ×
      </button>
    </div>
  );
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationOptions | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const nextId = useRef(0);
  const confirmingRef = useRef(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const notify = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    setToasts((current) => [...current, { ...options, id: nextId.current }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const requestConfirmation = useCallback((options: ConfirmationOptions) => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setConfirmation(options);
  }, []);

  const closeConfirmation = useCallback(() => {
    if (!confirmingRef.current) {
      setConfirmation(null);
    }
  }, []);

  useEffect(() => {
    if (!confirmation) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }

    cancelButtonRef.current?.focus();
  }, [confirmation]);

  async function handleConfirm(): Promise<void> {
    if (!confirmation || confirmingRef.current) return;

    confirmingRef.current = true;
    setIsConfirming(true);

    try {
      await confirmation.onConfirm();
      setConfirmation(null);
    } catch (error) {
      if (confirmation.onError) {
        confirmation.onError(error);
      } else {
        notify({
          variant: "error",
          title: "Unable to complete this action",
          message: "Please try again.",
        });
      }
    } finally {
      confirmingRef.current = false;
      setIsConfirming(false);
    }
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.key === "Escape") {
      event.preventDefault();
      closeConfirmation();
      return;
    }

    if (event.key === "Tab") {
      const firstButton = cancelButtonRef.current;
      const lastButton = confirmButtonRef.current;
      if (!firstButton || !lastButton) return;

      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton.focus();
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault();
        firstButton.focus();
      }
    }
  }

  const contextValue: FeedbackContextValue = { notify, requestConfirmation };

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <div aria-label="Notifications" className="pointer-events-none fixed right-4 top-[84px] z-[100] flex w-[min(30rem,calc(100vw-2rem))] flex-col gap-3 sm:right-6">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastCard toast={toast} onDismiss={removeToast} />
          </div>
        ))}
      </div>

      {confirmation && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0B2A4A]/40 p-4 animate-[dialog-enter_160ms_ease-out] motion-reduce:animate-none"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeConfirmation();
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="global-confirm-title"
            aria-describedby="global-confirm-message"
            onKeyDown={handleDialogKeyDown}
            className="w-full max-w-md rounded-lg border border-[#E8E0D0] bg-white p-6 shadow-[0_20px_60px_rgba(11,42,74,0.22)] sm:p-7"
          >
            <div className="flex justify-center">
              <Image src="/images/signup-logo.png" alt="Trust Forever Marriage Bureau" width={220} height={110} className="h-auto w-[min(13rem,75vw)] object-contain" />
            </div>
            <h2 id="global-confirm-title" className="mt-4 text-lg font-semibold text-[#172033]">{confirmation.title}</h2>
            <p id="global-confirm-message" className="mt-2 text-sm leading-6 text-[#64748B]">{confirmation.message}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                ref={cancelButtonRef}
                type="button"
                disabled={isConfirming}
                onClick={closeConfirmation}
                className="min-h-11 rounded-md border border-[#CBD5E1] px-4 text-sm font-semibold text-[#475569] transition hover:bg-[#F7F7F5] disabled:opacity-60"
              >
                {confirmation.cancelLabel ?? "Cancel"}
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                disabled={isConfirming}
                onClick={() => void handleConfirm()}
                className={`min-h-11 rounded-md px-4 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-60 ${confirmation.destructive ? "bg-[#8F3028] hover:bg-[#782E28]" : "bg-[#0B2A4A] hover:bg-[#123E68]"}`}
              >
                {isConfirming ? confirmation.pendingLabel ?? "Working..." : confirmation.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </section>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

function useFeedbackContext(): FeedbackContextValue {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("Feedback hooks must be used inside ToastProvider.");
  }

  return context;
}

export function useToast(): Pick<FeedbackContextValue, "notify"> {
  const { notify } = useFeedbackContext();
  return { notify };
}

export function useConfirm(): Pick<FeedbackContextValue, "requestConfirmation">["requestConfirmation"] {
  return useFeedbackContext().requestConfirmation;
}
