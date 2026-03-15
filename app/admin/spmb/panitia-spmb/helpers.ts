import { generatePendaftaranUlangPdf } from "@/utils/pdfTemplateGenerator";

export function toNullableString(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function safeReadJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function getApiErrorMessage(
  result: unknown,
  status: number,
  fallback: string,
) {
  if (result && typeof result === "object") {
    const maybeRecord = result as { message?: string; error?: string };
    if (maybeRecord.message?.trim()) {
      return maybeRecord.message;
    }
    if (maybeRecord.error?.trim()) {
      return maybeRecord.error;
    }
  }

  if (status === 401) {
    return "Sesi login berakhir. Silakan login kembali";
  }

  if (status >= 500) {
    return "Terjadi kesalahan server. Silakan coba lagi beberapa saat";
  }

  return fallback;
}

export function buildPreviewRegistration(): Parameters<
  typeof generatePendaftaranUlangPdf
>[0]["registration"] {
  return {
    registrationNumber: 20260001,
    majorChoiceCode: "Jurusan Pilihan",
    createdAt: new Date().toISOString(),
    updatedAt: null,
    studentDetail: {
      nisn: "1234567890",
      nik: "3301010101010001",
      fullName: "Nama Calon Murid",
      placeOfBirth: "Kota Lahir",
      dateOfBirth: "2010-01-01",
      gender: 1,
      religion: "islam",
      schoolOriginName: "SMP Negeri 1 Kroya",
      schoolOriginNpsn: "20300562",
      address: "Jl. Semangka Kedawung, Kroya",
      phoneNumber: "081234567890",
      email: "preview@student.com",
      isKipRecipient: false,
      kipNumber: null,
    },
    parentDetail: {
      fatherName: "Ayah Preview",
      fatherLivingStatus: "alive",
      motherName: "Ibu Preview",
      motherLivingStatus: "alive",
      parentPhoneNumber: "081234567891",
      parentAddress: "Jl. Semangka Kedawung, Kroya",
      guardianName: null,
      guardianPhoneNumber: null,
      guardianAddress: null,
    },
    majorChoice: null,
    author: null,
  };
}
