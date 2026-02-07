export const formatMonth = (dateStr?: string) => {
  if (!dateStr) return "-";

  // Try parsing the date string; if parsing fails, try adding a day fallback
  let d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    d = new Date(dateStr + "-01");
    if (isNaN(d.getTime())) return dateStr;
  }

  // Return month name in Indonesian (e.g., "Maret")
  return new Intl.DateTimeFormat("id-ID", { month: "long" }).format(d);
};