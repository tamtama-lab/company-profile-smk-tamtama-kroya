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
  tempatLahir: "Tempat Lahir",
  email: "Email Aktif",
  tanggalLahir: "Tanggal Lahir",
  nik: "NIK",
  jenisKelamin: "Jenis Kelamin",
  nisn: "NISN",
  agama: "Agama",
  asalSekolah: "Asal SMP/MTs",
  adaKip: "Memiliki KIP",
  alamat: "Alamat",
  nomorWhatsapp: "Nomor WhatsApp",
  // Biodata Orang Tua
  namaAyah: "Nama Ayah",
  kondisiAyah: "Kondisi Ayah",
  namaIbu: "Nama Ibu",
  kondisiIbu: "Kondisi Ibu",
  noTelponOrangTua: "Nomor Telpon Orang Tua",
  // Biodata Wali
  namaWali: "Nama Wali",
  noTelponWali: "Nomor Telpon Wali",
  alamatWali: "Alamat Wali",
  // Pilih Jurusan
  jurusanDipilih: "Jurusan Dipilih",
};

const formatValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (key === "adaKip") return value ? "Ya" : "Tidak";
  if (key === "kondisiAyah" || key === "kondisiIbu ") {
    return value === "alive" ? "Hidup" : "Meninggal Dunia";
  }
  if (key === "jenisKelamin") return value ? "Laki-laki" : "Perempuan";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  const dateKeys = ["tanggalLahir"];
  if (key === "jurusanDipilih") {
    return value === "TKR"
      ? "Teknik Kendaraan Ringan (TKR)"
      : value === "TITL"
        ? "Teknik Instalasi Tenaga Listrik (TITL)"
        : value === "TP"
          ? "Teknik Pemesinan (TP)"
          : value === "DKV"
            ? "Desain Komunikasi Visual (DKV)"
            : String(value);
  }
  if (dateKeys.includes(key) && typeof value === "string") {
    const date = new Date(value);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
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
    <div className={`mb-6 `}>
      <h3 className="text-lg font-semibold text-primary mb-3 pb-2">{title}</h3>
      <div
        className={`grid ${columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-x-6 gap-y-4 mt-4`}
      >
        {entries.map(([key, value]) => (
          <div key={key} className=" border-gray-200 pb-3">
            <p className="text-xs text-primary font-semibold mb-1">
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
          <TextButton variant={"outline"} text="Edit" onClick={onPrev} />
          <TextButton variant={"primary"} text="Konfirmasi" onClick={onClose} />
        </div>
      }
    >
      <div className="space-y-6 overflow-y-auto max-h-[60vh]">
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
