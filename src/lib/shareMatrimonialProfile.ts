import { resolvePublicImageUrl, type MatrimonialProfile } from "@/services/rolesPermissions";

export async function shareMatrimonialProfile(profile: MatrimonialProfile): Promise<boolean> {
  const section = (title: string, entries: Array<[string, unknown]>) => {
    const rows = entries
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
      .map(([label, value]) => `${label}: ${String(value)}`);
    return rows.length ? `${title}\n${"━".repeat(24)}\n${rows.join("\n")}` : "";
  };
  const message = [
    "Trust Forever Marriage Bureau",
    `Profile ID: ${profile.profile_id}`,
    section("📝 PERSONAL INFORMATION", [
      ["Name", profile.name], ["Gender", profile.gender], ["Marital Status", profile.marital_status], ["Age", profile.age], ["Height", profile.height], ["Sect", profile.sect], ["Caste", profile.caste], ["Language", profile.language], ["Qualifications", profile.qualification], ["Educational Institution", profile.educational_institution], ["Employed", profile.employed === null ? null : profile.employed ? "Yes" : "No"], ["Job", profile.job], ["Business", profile.business], ["Income", profile.income],
    ]),
    section("👨‍👩‍👧‍👦 FAMILY DETAILS", [
      ["Father", profile.father_name], ["Father Occupation", profile.father_occupation], ["Father Details", profile.father_details], ["Mother", profile.mother_details], ["House Size", profile.house_size], ["Society", profile.society], ["City", profile.city], ["Sisters", profile.sisters_count], ["Sisters Details", profile.sisters_details], ["Married Sisters", profile.married_sisters_count], ["Brothers", profile.brothers_count], ["Brothers Details", profile.brothers_details], ["Married Brothers", profile.married_brothers_count], ["Other Details", profile.other_details],
    ]),
    section("❓ LIFE PARTNER REQUIREMENTS", [["Requirements", profile.partner_requirements]]),
    section("📱 WHATSAPP CONTACTS", [["Father", profile.father_whatsapp], ["Mother", profile.mother_whatsapp], ["Parents", profile.parents_whatsapp], ["Profile", profile.whatsapp_number]]),
    "Trust Forever Marriage Bureau",
  ].filter(Boolean).join("\n\n");

  const whatsappWindow = window.open("about:blank", "_blank");
  const fallbackToWhatsApp = () => {
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = mobile
      ? `https://wa.me/?text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.location.href = url;
    else window.location.href = url;
  };

  if (profile.profile_picture_url && typeof navigator.share === "function" && typeof navigator.canShare === "function") {
    try {
      const response = await fetch(resolvePublicImageUrl(profile.profile_picture_url));
      if (response.ok) {
        const blob = await response.blob();
        if (blob.size > 0 && blob.type.startsWith("image/")) {
          const extensionByMimeType: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
          };
          const extension = extensionByMimeType[blob.type.toLowerCase()] ?? blob.type.split("/")[1]?.split(";")[0] ?? "img";
          const imageFile = new File([blob], `profile-${profile.id}.${extension}`, { type: blob.type });
          if (navigator.canShare({ files: [imageFile] })) {
            try {
              await navigator.share({ title: "Trust Forever Marriage Bureau", text: message, files: [imageFile] });
              if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
              return true;
            } catch (cause) {
              if (cause instanceof DOMException && cause.name === "AbortError") {
                if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
                return false;
              }
            }
          }
        }
      }
    } catch { /* Use WhatsApp text sharing if the image cannot be fetched or shared. */ }
  }
  fallbackToWhatsApp();
  return true;
}
