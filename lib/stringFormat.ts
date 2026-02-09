export const formatWhatsappNumber = (num: string) => {
    if (!num) return "";
    const cleaned = num.replace(/[^0-9+]/g, "");
    let n = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
    if (n.startsWith("0")) n = `62${n.slice(1)}`;
    return n;
  };

export const getHandleFromUrl = (url: string) => {
    const stripAt = (s: string) => s.replace(/^@+/, "");

    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length === 0) return u.hostname.replace(/^www\./, "");

      const last = parts[parts.length - 1];

      // Facebook must not have '@'
      if (host.includes("facebook.com")) {
        // For URLs like /people/NAME/ID pick NAME, otherwise pick first segment
        if (parts[0] === "people" && parts[1]) return parts[1].replace(/^@+/, "");
        return parts[0].replace(/^@+/, "");
      }

      // All other platforms should display with single leading '@'
      const handle = stripAt(last);

      // TikTok, YouTube, Instagram, etc. -> '@handle'
      return `@${handle}`;
    } catch {
      // If input is not a valid URL, attempt simple normalization
      try {
        const cleaned = (url || "").split("/").filter(Boolean).pop() || url;
        const lower = String(cleaned).toLowerCase();
        if (lower.includes("facebook")) return String(cleaned).replace(/^@+/, "");
        return `@${stripAt(String(cleaned))}`;
      } catch {
        return url;
      }
    }
};


    // Helpers
  export const isValidEmail = (s: string) => /\S+@\S+\.\S+/.test(s);
  export const isNonEmpty = (s: string) => String(s || "").trim().length > 0;
  export const toDigits = (s: string) => String(s || "").replace(/\D/g, "");
  export const isValidPhoneNumber = (s: string) => {
    const digits = toDigits(s);
    return digits.length >= 10 && digits.length <= 15;
  };
  export const isValidUrl = (s: string) => {
    try {
      if (!s) return true; // allow empty
      new URL(s);
      return true;
    } catch {
      return false;
    }
  };