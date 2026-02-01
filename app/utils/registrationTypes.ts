export interface BiodataSiswaForm {
  namaLengkap: string;
  email: string;
  nik: string;
  nisn?: string;
  tempatLahir: string;
  tanggalLahir: string;
  asalSekolah: string;
  alamat: string;
  jenisKelamin: string; // Changed from number to string
  agama: string;
  adaKip: boolean;
  nomorKip?: string;
  nomorWhatsapp: string;
}

export interface BiodataOrangTuaForm {
  alamat: string;
  namaAyah: string;
  kondisiAyah: string;
  namaIbu: string;
  kondisiIbu: string;
}

export interface BiodataWaliForm {
  namaWali: string;
  noTelponWali: string;
  alamatWali: string;
}

export interface PilihJurusanForm {
  jurusanDipilih: string;
}

export interface RegistrationData {
  biodataSiswa?: BiodataSiswaForm;
  biodataOrangTua?: BiodataOrangTuaForm;
  biodataWali?: BiodataWaliForm;
  pilihJurusan?: PilihJurusanForm;
}
