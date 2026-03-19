// utils to calculate age from dateOfBirth
/**
 * Hitung umur siswa dari dateOfBirth dengan format:
 * - "year": hanya tahun
 * - "yearMonth": tahun dan bulan
 * - "yearMonthDay": tahun, bulan, hari
 */
export function calculateStudentAge(
  dateOfBirth: string,
  format: "year" | "yearMonth" | "yearMonthDay" = "year"
): string {
  if (!dateOfBirth) return "-";
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    // hitung hari dari bulan sebelumnya
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return "-";

  if (format === "year") {
    return `${years}`;
  } else if (format === "yearMonth") {
    return `${years} tahun${months > 0 ? ` ${months} bulan` : ""}`;
  } else {
    let result = `${years} tahun`;
    if (months > 0) result += ` ${months} bulan`;
    if (days > 0) result += ` ${days} hari`;
    return result;
  }
}
