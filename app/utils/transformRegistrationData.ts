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
