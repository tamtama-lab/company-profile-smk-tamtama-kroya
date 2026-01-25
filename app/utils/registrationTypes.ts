export interface BiodataSiswaForm {
  namaLengkap: string;
  email: string;
  nik: string;
  nisn: string;
  tempatLahir: string;
  tanggalLahir: string;
  asalSekolah: string;
  alamat: string;
  jenisKelamin: string;
  agama: string;
  adaKip: boolean;
  nomorWhatsapp: string;
}

export interface BiodataOrangTuaForm {
  alamat: string;
  namaAyah: string;
  kondisiAyah: string;
  namaIbu: string;
  kondisiIbu: string;
  noTelponOrangTua: string;
}

export interface BiodataWaliForm {
  namaWali: string;
  nikWali: string;
  pekerjaanWali: string;
  penghasilanWali: string;
  alamatWali: string;
  noTelponWali: string;
  hubunganDenganSiswa: string;
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
