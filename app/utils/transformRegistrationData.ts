import { RegistrationData } from "./registrationTypes";

interface RegistrationPayload {
  studentDetail: {
    nisn: string;
    nik: string;
    fullName: string;
    placeOfBirth: string;
    dateOfBirth: string;
    gender: number;
    religion: string;
    schoolOriginNpsn: string;
    address: string;
    phoneNumber: string;
    email: string;
    isKipRecipient: boolean;
    kipNumber?: string;
  };
  parentDetail: {
    fatherName: string;
    fatherLivingStatus: string;
    motherName: string;
    motherLivingStatus: string;
    parentAddress: string;
    guardianName: string;
    guardianPhoneNumber: string;
    guardianAddress: string;
  };
  majorChoiceCode: string;
}

interface ApiRegistrationResponse {
  id: number;
  registrationNumber: number;
  registrationBatchId: number;
  majorChoiceCode: string;
  studentDetail: {
    id: number;
    nisn: string | null;
    nik: string | null;
    fullName: string;
    placeOfBirth: string;
    dateOfBirth: string;
    gender: string;
    religion: string;
    schoolOriginName: string | null;
    schoolOriginNpsn: string | null;
    address: string;
    phoneNumber: string | null;
    email: string | null;
    isKipRecipient: number;
    kipNumber?: string | null;
  };
  parentDetail: {
    id: number;
    fatherName: string;
    fatherLivingStatus: string;
    motherName: string;
    motherLivingStatus: string;
    parentPhoneNumber: string | null;
    parentAddress: string;
    guardianName: string | null;
    guardianPhoneNumber: string | null;
    guardianAddress: string | null;
  };
  majorChoice: {
    id: number;
    name: string;
    abbreviation: string;
  };
}

export const transformToApiFormat = (
  data: RegistrationData
): RegistrationPayload => {
  const { biodataSiswa, biodataOrangTua, biodataWali, pilihJurusan } = data;

  return {
    studentDetail: {
      nisn: biodataSiswa?.nisn || "",
      nik: biodataSiswa?.nik || "",
      fullName: biodataSiswa?.namaLengkap || "",
      placeOfBirth: biodataSiswa?.tempatLahir || "",
      dateOfBirth: biodataSiswa?.tanggalLahir || "",
      gender: parseInt(biodataSiswa?.jenisKelamin || "1", 10), // Parse string to number
      religion: biodataSiswa?.agama || "",
      schoolOriginNpsn: biodataSiswa?.asalSekolah || "",
      address: biodataSiswa?.alamat || "",
      phoneNumber: biodataSiswa?.nomorWhatsapp || "",
      email: biodataSiswa?.email || "",
      isKipRecipient: biodataSiswa?.adaKip === true,
      kipNumber: biodataSiswa?.nomorKip || "",
    },
    parentDetail: {
      fatherName: biodataOrangTua?.namaAyah || "",
      fatherLivingStatus: biodataOrangTua?.kondisiAyah || "",
      motherName: biodataOrangTua?.namaIbu || "",
      motherLivingStatus: biodataOrangTua?.kondisiIbu || "",
      parentAddress: biodataOrangTua?.alamat || "",
      guardianName: biodataWali?.namaWali || "",
      guardianPhoneNumber: biodataWali?.noTelponWali || "",
      guardianAddress: biodataWali?.alamatWali || "",
    },
    majorChoiceCode: pilihJurusan?.jurusanDipilih || "",
  };
};

export const transformFromApiFormat = (
  data: ApiRegistrationResponse
): RegistrationData => {
  const { studentDetail, parentDetail, majorChoice } = data;

  return {
    biodataSiswa: {
      namaLengkap: studentDetail.fullName,
      email: studentDetail.email || "",
      nik: studentDetail.nik || "",
      nisn: studentDetail.nisn || "",
      tempatLahir: studentDetail.placeOfBirth,
      tanggalLahir: studentDetail.dateOfBirth,
      asalSekolah: studentDetail.schoolOriginName || "",
      alamat: studentDetail.address || "",
      jenisKelamin: studentDetail.gender === "1" ? "Laki-laki" : "Perempuan",
      agama: studentDetail.religion,
      adaKip: studentDetail.isKipRecipient === 1,
      nomorKip: studentDetail.kipNumber || "",
      nomorWhatsapp: studentDetail.phoneNumber || "",
    },
    biodataOrangTua: {
      alamat: parentDetail.parentAddress || "",
      namaAyah: parentDetail.fatherName,
      kondisiAyah: parentDetail.fatherLivingStatus,
      namaIbu: parentDetail.motherName,
      kondisiIbu: parentDetail.motherLivingStatus,
    },
    biodataWali: parentDetail.guardianName ? {
      namaWali: parentDetail.guardianName,
      noTelponWali: parentDetail.guardianPhoneNumber || "",
      alamatWali: parentDetail.guardianAddress || "",
    } : undefined,
    pilihJurusan: {
      jurusanDipilih: majorChoice.abbreviation,
    },
  };
};

// New: transform recent registrations response into the Student table shape
import type { Student } from "@/components/Dashboard";

export function transformRecentRegistrations(items: unknown): Student[] {
  console.log("Transformer input:", items);
  // Normalize input: backend may return the array directly or wrapped in { data: [] } / { rows: [] }
  let list: Array<Record<string, unknown>> = [];

  if (Array.isArray(items)) {
    list = items as Array<Record<string, unknown>>;
  } else if (items && typeof items === "object") {
    const obj = items as Record<string, unknown>;
    if (Array.isArray(obj.data)) list = obj.data as Array<Record<string, unknown>>;
    else if (Array.isArray(obj.rows)) list = obj.rows as Array<Record<string, unknown>>;
    else list = [obj];
  } else {
    console.log("No valid array found in input");
    return [];
  }

  console.log("Normalized list:", list);
  const result = list.map((item) => {
    const sd = (item["studentDetail"] as Record<string, unknown>) || {};

    const id = Number(item["id"] ?? sd["id"] ?? 0);
    const registrationNumber = Number(
      item["registrationNumber"] ?? item["registrationId"] ?? sd["registrationId"] ?? id,
    );
    const registrationBatchId = Number(
      item["registrationBatchId"] ?? sd["registrationBatchId"] ?? 0,
    );
    const updatedAt = String(
      item["updatedAt"] ?? sd["updatedAt"] ?? item["createdAt"] ?? new Date().toISOString(),
    );

    return {
      id: id,
      nisn: String(sd["nisn"] ?? ""),
      nik: String(sd["nik"] ?? ""),
      fullName: String(sd["fullName"] ?? "-"),
      placeOfBirth: String(sd["placeOfBirth"] ?? ""),
      dateOfBirth: String(sd["dateOfBirth"] ?? ""),
      gender: String(sd["gender"] ?? ""),
      religion: String(sd["religion"] ?? ""),
      schoolOriginName: String(sd["schoolOriginName"] ?? ""),
      schoolOriginNpsn: sd["schoolOriginNpsn"] as string | null ?? null,
      address: String(sd["address"] ?? ""),
      phoneNumber: String(sd["phoneNumber"] ?? ""),
      email: String(sd["email"] ?? ""),
      isKipRecipient: Number(sd["isKipRecipient"] ?? 0),
      registrationId: id,
      registrationNumber: registrationNumber,
      registrationBatchId: registrationBatchId,
      updatedAt: updatedAt,
    };
  });
  console.log("Transformer output:", result);
  return result;
}
