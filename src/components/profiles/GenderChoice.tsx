"use client";

export type ProfileGender = "male" | "female";

export default function GenderChoice({
  selected,
  onSelect,
  label = "Browse profiles by gender",
  variant = "compact",
}: {
  selected?: ProfileGender;
  onSelect: (gender: ProfileGender) => void;
  label?: string;
  variant?: "compact" | "cards";
}) {
  const isCard = variant === "cards";
  return <div className={isCard ? "grid w-full grid-cols-2 gap-3 sm:max-w-md" : "flex items-center gap-2"} role="group" aria-label={label}>
    {(["male", "female"] as const).map((gender) => {
      const isSelected = selected === gender;
      const name = gender === "male" ? "Male" : "Female";
      return <button key={gender} type="button" aria-label={`Show ${gender} profiles`} aria-pressed={isSelected} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onSelect(gender); }} className={`${isCard ? "min-h-[76px] justify-start rounded-xl px-4 text-sm" : "min-h-10 rounded-full px-3 py-1.5 text-xs"} inline-flex items-center gap-3 border font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C] ${isSelected ? "border-[#0B2A4A] bg-[#0B2A4A] text-white shadow-[0_6px_18px_rgba(11,42,74,0.16)]" : "border-[#E1E6EC] bg-white text-[#334155] hover:border-[#C89B2C] hover:bg-[#FBF8EF]"}`}>
        <span aria-hidden="true" className={`${isCard ? "size-11" : "size-6"} flex shrink-0 items-center justify-center rounded-full ${isSelected ? "bg-white/15 text-white" : gender === "male" ? "bg-[#EAF2FC] text-[#32629A]" : "bg-[#FAEAF0] text-[#A54B70]"}`}>
          {gender === "male" ? <svg viewBox="0 0 24 24" fill="none" className={isCard ? "size-6" : "size-4"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="5"/><path d="m14 10 6-6m-5 0h5v5"/></svg> : <svg viewBox="0 0 24 24" fill="none" className={isCard ? "size-6" : "size-4"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M12 13v8m-3-3h6"/></svg>}
        </span><span className={isCard ? "flex flex-col items-start gap-1" : ""}>{name}{isCard && <span className={`text-xs font-normal ${isSelected ? "text-white/70" : "text-[#94A3B8]"}`}>{isSelected ? "Selected" : "View profiles"}</span>}</span>
      </button>;
    })}
  </div>;
}
