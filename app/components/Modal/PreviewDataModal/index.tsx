"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import { BaseModal } from "@/components/Modal/BaseModal";
import { RegistrationData } from "@/utils/registrationTypes";

interface ModalPreviewDataProps {
  isOpen: boolean;
  onClose: () => void;
  data?: RegistrationData;
  onPrev?: () => void;
}

const labelMap: Record<string, string> = {
  // Biodata Siswa
  namaLengkap: "Nama Lengkap",
  email: "Email",
  nik: "NIK",
  nisn: "NISN",
  tempatLahir: "Tempat Lahir",
  tanggalLahir: "Tanggal Lahir",
  asalSekolah: "Asal Sekolah",
  alamat: "Alamat",
  jenisKelamin: "Jenis Kelamin",
  agama: "Agama",
  adaKip: "Penerima KIP",
  nomorWhatsapp: "Nomor WhatsApp",
  // Biodata Orang Tua
  namaAyah: "Nama Ayah",
  kondisiAyah: "Kondisi Ayah",
  namaIbu: "Nama Ibu",
  kondisiIbu: "Kondisi Ibu",
  noTelponOrangTua: "Nomor Telpon Orang Tua",
  // Biodata Wali
  namaWali: "Nama Wali",
  nikWali: "NIK Wali",
  pekerjaanWali: "Pekerjaan Wali",
  penghasilanWali: "Penghasilan Wali",
  alamatWali: "Alamat Wali",
  noTelponWali: "Nomor Telpon Wali",
  hubunganDenganSiswa: "Hubungan Dengan Siswa",
  // Pilih Jurusan
  jurusanDipilih: "Jurusan Dipilih",
};

const formatValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined) return "-";
  if (key === "adaKip") return value ? "Ya" : "Tidak";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  return String(value);
};

const DataSection = ({
  title,
  data,
  columns = 2,
}: {
  title: string;
  data?: unknown;
  columns?: 1 | 2;
}) => {
  if (!data || typeof data !== "object") return null;

  const entries = Object.entries(data as Record<string, unknown>);
  if (entries.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-primary mb-3 pb-2 border-b-2 border-primary">
        {title}
      </h3>
      <div
        className={`grid ${columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-x-6 gap-y-4 mt-4`}
      >
        {entries.map(([key, value]) => (
          <div key={key} className="border-b border-gray-200 pb-3">
            <p className="text-xs text-gray-600 font-semibold mb-1">
              {labelMap[key] || key}
            </p>
            <p className="text-sm text-gray-800">{formatValue(key, value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ModalPreviewData: React.FC<ModalPreviewDataProps> = ({
  isOpen,
  onClose,
  data,
  onPrev,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Data Formulir Pendaftaran"
      size="full"
      footer={
        <div className="w-full justify-end flex gap-5">
          <TextButton variant={"outline"} text="Batal" onClick={onPrev} />
          <TextButton variant={"primary"} text="Konfirmasi" />
        </div>
      }
    >
      <div className="space-y-6">
        {!data || Object.keys(data).length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Tidak ada data untuk ditampilkan
          </p>
        ) : (
          <div className="w-full">
            <DataSection
              title="Biodata Siswa"
              data={data.biodataSiswa}
              columns={2}
            />
            <DataSection
              title="Biodata Orang Tua"
              data={data.biodataOrangTua}
              columns={1}
            />
            <DataSection
              title="Biodata Wali"
              data={data.biodataWali}
              columns={1}
            />
            <DataSection
              title="Pilih Jurusan"
              data={data.pilihJurusan}
              columns={1}
            />
          </div>
        )}
      </div>
    </BaseModal>
  );
};
