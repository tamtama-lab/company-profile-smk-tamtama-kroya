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
