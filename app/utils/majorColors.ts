const CORE_MAJOR_COLORS: Record<string, string> = {
  TKR: "#FF0000",
  DKV: "#2369D1",
  TITL: "#4D4FA4",
  TP: "#5DB1F6",
};

const EXTRA_MAJOR_COLOR_PALETTE = [
  "#0EA5E9",
  "#F97316",
  "#14B8A6",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#22C55E",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#3B82F6",
  "#F43F5E",
];

const hashString = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const normalizeMajorName = (majorName: string): string =>
  String(majorName || "").trim().toUpperCase();

export const getMajorColor = (
  majorName: string,
  fallbackIndex: number = 0,
): string => {
  const normalizedMajorName = normalizeMajorName(majorName);

  if (CORE_MAJOR_COLORS[normalizedMajorName]) {
    return CORE_MAJOR_COLORS[normalizedMajorName];
  }

  if (!normalizedMajorName) {
    return EXTRA_MAJOR_COLOR_PALETTE[
      fallbackIndex % EXTRA_MAJOR_COLOR_PALETTE.length
    ];
  }

  const hashedIndex =
    hashString(normalizedMajorName) % EXTRA_MAJOR_COLOR_PALETTE.length;

  return EXTRA_MAJOR_COLOR_PALETTE[hashedIndex];
};
