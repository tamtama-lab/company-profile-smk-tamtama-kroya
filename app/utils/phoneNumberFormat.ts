// utils/phone.ts

export function normalizePhoneNumber(input: string): string {
  if (!input) return "";

  let value = input.replace(/\D/g, "");

  if (value.startsWith("0")) {
    value = "62" + value.slice(1);
  }

  if (value.startsWith("620")) {
    value = "62" + value.slice(3);
  }

  return value;
}

export function isValidIndoPhone(value: string): boolean {
  // 62 + 9–12 digit
  return /^62\d{9,12}$/.test(value);
}
