
export const NavItems = [
  { label: "Beranda", href: "/" },
  {
    label: "Tentang Sekolah",
    href: "/tentang-sekolah",
    children: [
      { label: "Kegiatan Sekolah", href: "/tentang-sekolah/kegiatan" },
      { label: "Fasilitas", href: "/tentang-sekolah/fasilitas" },
      { label: "Prestasi", href: "/tentang-sekolah/prestasi" },
      { label: "Profil Alumni", href: "/tentang-sekolah/alumni" },
    ],
  },
  {
    label: "Program Keahlian",
    href: "/program-keahlian",
   
  },
  { label: "PPDB", href: "/ppdb",
    children: [
      { label: "Jadwal & Alur Pendaftaran ", href: "/ppdb/jadwal-alur" },
      { label: "Jalur Pendaftaran", href: "/ppdb/fasilitas" },
      { label: "Syarat Pendaftaran", href: "/ppdb/prestasi" },
      { label: "Statistik Pendaftar", href: "/ppdb/alumni" },
    ] },
  { label: "Informasi", href: "/informasi", children: [
      { label: "Lokasi Sekolah", href: "/informasi/lokasi-sekolah" },
      { label: "Kontak", href: "/informasi/kontak" },
  ] },
];