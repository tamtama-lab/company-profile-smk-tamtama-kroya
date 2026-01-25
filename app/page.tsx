"use client";

import { HeroSection } from "@/components/LandingPage/HeroSection";
import { VacationTotal } from "@/components/LandingPage/VacationTotal";
import { WhyChooseUs } from "@/components/LandingPage/WhyChooseUs";
import { SchoolLocation } from "./components/LandingPage/SchoolLocation";
import { RegistrationPathSection } from "@/components/LandingPage/RegistrationPathSection";
import { RegistrationRequirementsSection } from "@/components/LandingPage/RegistrationRequirementsSection";
import { BrochureSection } from "./components/LandingPage/BrochureSection";
import { ContactAndSocial } from "./components/LandingPage/ContactAndSocial";
import { SchoolFacility } from "./components/LandingPage/SchoolFacility";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { LiaIndustrySolid } from "react-icons/lia";
import { AiOutlineTool } from "react-icons/ai";
import { HiOutlineComputerDesktop } from "react-icons/hi2";
import { FaRegMoneyBill1 } from "react-icons/fa6";
import { FaRegHandshake } from "react-icons/fa";
import { MdCall, MdEmail, MdLanguage, MdLocationOn } from "react-icons/md";

export default function LandingPage() {
  const registrationPathTabs = [
    {
      id: "prestasi",
      label: "Jalur Prestasi",
      image: "/ppdb/akademik.jpg",
      items: [
        {
          grade: "Peringkat 1 Kelas (Gratis SPP 9 Bulan)",
          description: "Untuk siswa dengan prestasi akademik terbaik",
          icon: "🥇",
        },
        {
          grade: "Peringkat 2 Kelas (Gratis SPP 6 Bulan)",
          description: "Untuk siswa dengan prestasi akademik sangat baik",
          icon: "🥈",
        },
        {
          grade: "Peringkat 3 Kelas (Gratis SPP 3 Bulan)",
          description: "Untuk siswa dengan prestasi akademik baik",
          icon: "🥉",
        },
      ],
    },
    {
      id: "non-akademik",
      label: "Jalur Non-Akademik",
      image: "/ppdb/non-akademik.jpg",
      items: [
        {
          grade: "Juara Nasional (Gratis SPP 1 Tahun)",
          description: "Untuk siswa dengan prestasi non-akademik terbaik",
          icon: "🏆",
        },
        {
          grade: "Juara Provinsi (Gratis SPP 9 Bulan)",
          description: "Untuk siswa dengan prestasi non-akademik sangat baik",
          icon: "🏆",
        },
        {
          grade: "Juara Kabupaten (Gratis SPP 6 Bulan)",
          description: "Untuk siswa dengan prestasi non-akademik baik",
          icon: "🏆",
        },
      ],
    },
  ];

  // Data untuk Registration Requirements Section
  const requirements = [
    {
      id: 1,
      text: "Mengisi formulir pendaftaran",
    },
    {
      id: 2,
      text: "Foto Copy Ijazah",
    },
    {
      id: 3,
      text: "Foto Copy KK dan Akta Kelahiran",
    },
    {
      id: 4,
      text: "Foto Copy KTP Orang Tua",
    },
    {
      id: 5,
      text: "Pas foto 3x4 Berwarna (3 lembar)",
    },
    {
      id: 6,
      text: "Sertifikat TKA (Tes Kemampuan Akademik)",
    },
    {
      id: 7,
      text: "Foto Copy Kartu PIP (Jika Ada)",
    },
  ];

  const registrationPeriods = [
    {
      id: 1,
      period: "1",
      startMonth: "November",
      endMonth: "Februari",
      status: "BUKA",
      icon: "01",
    },
    {
      id: 2,
      period: "2",
      startMonth: "Maret",
      endMonth: "Mei",
      status: "Tutup",
      icon: "02",
    },
    {
      id: 3,
      period: "3",
      startMonth: "Juni",
      endMonth: "Juli",
      status: "Tutup",
      icon: "03",
    },
  ];

  const facilityList = [
    {
      name: "Fasilitas Sekolah",
      description:
        "Program kelas industri bersama Isuzu, Panasonic, Astra, dan mitra industri terpercaya.",
      icon: <HiOutlineAcademicCap />,
    },
    {
      name: "Kurikulum Siap Kerja",
      description:
        "Program kelas industri bersama Isuzu, Panasonic, Astra, dan mitra industri terpercaya.",
      icon: <LiaIndustrySolid />,
    },
    {
      name: "Bengkel & Alat Praktik Modern",
      description:
        "Bengkel nyaman dengan peralatan praktik TITL, TKR, TP, dan DKV berstandar industri.",
      icon: <AiOutlineTool />,
    },
    {
      name: "Pembelajaran Berbasis Teknologi",
      description:
        "Program kelas industri bersama Isuzu, Panasonic, Astra, dan mitra industri terpercaya.",
      icon: <HiOutlineComputerDesktop />,
    },
    {
      name: "Beasiswa & Biaya Terjangkau",
      description:
        "Program kelas industri bersama Isuzu, Panasonic, PT. Mada Wikri Tunggal, dan mitra industri terpercaya.",
      icon: <FaRegMoneyBill1 />,
    },
    {
      name: "Penyaluran Kerja (BKK)",
      description:
        "Bursa Kerja Khusus (BKK) membantu lulusan terserap langsung ke dunia kerja.",
      icon: <FaRegHandshake />,
    },
  ];

  const brochureList = [
    { image: "/brochure/brosur-depan.png", alt: "Brosur Depan" },
    { image: "/brochure/brosur-belakang.png", alt: "Brosur Belakang" },
  ];

  const contactList = [
    {
      name: "Telepon",
      contact: "0282-494-126",
      icon: <MdCall />,
    },
    {
      name: "Email",
      contact: "smktamtamakroya.clp@yahoo.com",
      icon: <MdEmail />,
    },
    {
      name: "Website Sekolah",
      contact: "www.smktamtamakroya.sch.id",
      icon: <MdLanguage />,
    },
    {
      name: "Alamat Sekolah",
      contact:
        "Jl. Semangka, Kedawung, Kroya, <br/> Cilacap, Jawa Tengah, 53282",
      icon: <MdLocationOn />,
    },
  ];

  const socialList = [
    {
      name: "Instagram",
      contact: "@smktamtamakroya",
      icon: "/sosmed/instagram.svg",
      hyperlink: "https://www.instagram.com/smk_tamtama_kroya",
    },
    {
      name: "Tiktok",
      contact: "@smk.tamtama.kroya.clp",
      icon: "/sosmed/tiktok.svg",
      hyperlink: "https://www.tiktok.com/@smk.tamtama.kroya.clp",
    },
    {
      name: "Youtube",
      contact: "@smktamtamakroya4678",
      icon: "/sosmed/youtube.svg",
      hyperlink: "https://www.youtube.com/@smktamtamakroya4678",
    },
    {
      name: "Facebook",
      contact: "SMK Tamtama KROYA",
      icon: "/sosmed/facebook.svg",
      hyperlink:
        "https://www.facebook.com/people/SMK-Tamtama-KROYA/100067793231479/#",
    },
  ];

  const adminList = [
    {
      number: "6281325767718",
      label: "Admin 1 : 0813-2576-7718",
      adminName: "(WR)",
    },

    {
      number: "6288215261410",
      label: "Admin 2 : 0882-1526-1410",
      adminName: "(Anas)",
    },
  ];

  return (
    <main className="h-fit bg-linear-to-b from-[#fafafa] to-gray-50 pt-16 sm:pt-20">
      {/* Hero Section */}
      <HeroSection />

      {/* Mengapa harus SMK Tamtama Kroya? */}
      <WhyChooseUs id="mengapa-pilih-tamtama" />

      {/* Jumlah Pendaftar per Jurusan */}
      <VacationTotal id="jumlah-peminat" />

      {/* Jalur Pendaftaran */}
      <RegistrationPathSection
        id="jalur-pendaftaran"
        tabs={registrationPathTabs}
      />

      {/* Syarat & Periode Pendaftaran */}
      <RegistrationRequirementsSection
        requirements={requirements}
        periods={registrationPeriods}
      />

      {/* Fasilitas Sekolah */}
      <SchoolFacility id="fasilitas-sekolah" facilityList={facilityList} />

      {/* Lokasi Sekolah */}
      <SchoolLocation
        id="lokasi-sekolah"
        mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4918.492276323309!2d109.24708601282072!3d-7.621409676956022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e65416d4622eb89%3A0x16173980f8b0f4c7!2sSMK%20Tamtama%20Kroya!5e0!3m2!1sen!2sid!4v1768843453168!5m2!1sen!2sid"
      />

      {/* Kontak & Sosial Media */}
      <ContactAndSocial
        id="kontak-sosial-media"
        contactList={contactList}
        socialList={socialList}
        adminList={adminList}
      />

      {/* Info Brosur */}
      <BrochureSection id="info-brosur" brochureList={brochureList} />
    </main>
  );
}
