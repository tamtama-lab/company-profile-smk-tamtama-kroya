"use client";

import { HeroSection } from "@/components/LandingPage/HeroSection";
import { VacationTotal } from "@/components/LandingPage/VacationTotal";
import { WhyChooseUs } from "@/components/LandingPage/WhyChooseUs";
import { SchoolLocation } from "./components/LandingPage/SchoolLocation";
import {
  RegistrationPath,
  RegistrationPathSection,
} from "@/components/LandingPage/RegistrationPathSection";
import {
  BatchData,
  RequirementData,
  RegistrationRequirementsSection,
} from "@/components/LandingPage/RegistrationRequirementsSection";
import { BrochureSection } from "./components/LandingPage/BrochureSection";
import {
  ContactAndSocial,
  SchoolSettings,
} from "./components/LandingPage/ContactAndSocial";
import { SchoolFacility } from "./components/LandingPage/SchoolFacility";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { LiaIndustrySolid } from "react-icons/lia";
import { AiOutlineTool } from "react-icons/ai";
import { HiOutlineComputerDesktop } from "react-icons/hi2";
import { FaRegMoneyBill1 } from "react-icons/fa6";
import { FaRegHandshake } from "react-icons/fa";
import { MdCall, MdEmail, MdLanguage, MdLocationOn } from "react-icons/md";
import { useEffect, useState, useMemo } from "react";
import type { MajorData } from "@/components/LandingPage/VacationTotal";
import { formatMonth } from "@/lib/formatMonth";
import React from "react";
import { formatWhatsappNumber, getHandleFromUrl } from "@/lib/stringFormat";

export default function LandingPage() {
  const [majorsData, setMajorsData] = useState<MajorData[] | null>(null);
  const [batchData, setBatchData] = useState<BatchData[] | null>(null);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(
    null,
  );
  const [requirementsData, setRequirementsData] = useState<
    RequirementData[] | null
  >(null);
  const [registrationPaths, setRegistrationPaths] = useState<
    RegistrationPath[] | null
  >(null);
  console.log(requirementsData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await fetch(`/api/landing-data`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          let majorsArray: MajorData[] = [];
          let batchArray: BatchData[] = [];
          let requirementsArray: RequirementData[] = [];
          if (Array.isArray(data)) majorsArray = data as MajorData[];
          else if (
            data &&
            typeof data === "object" &&
            "registrationBatches" in data &&
            "registrationRequirements" in data
          ) {
            const obj = data as unknown as Record<string, unknown>;
            if (Array.isArray(obj["majors"]))
              majorsArray = obj["majors"] as unknown as MajorData[];
            if (Array.isArray(obj["registrationBatches"]))
              batchArray = obj["registrationBatches"] as unknown as BatchData[];
            if (Array.isArray(obj["registrationRequirements"]))
              requirementsArray = obj[
                "registrationRequirements"
              ] as unknown as RequirementData[];
            if (Array.isArray(obj["registrationPaths"]))
              setRegistrationPaths(
                obj["registrationPaths"] as unknown as RegistrationPath[],
              );
            if (
              obj["schoolSettings"] &&
              typeof obj["schoolSettings"] === "object"
            )
              setSchoolSettings(
                obj["schoolSettings"] as unknown as SchoolSettings,
              );
          } else {
            const obj = data as unknown as Record<string, unknown>;
            if (Array.isArray(obj["majors"]))
              majorsArray = obj["majors"] as unknown as MajorData[];
            else if (Array.isArray(obj["data"]))
              majorsArray = obj["data"] as unknown as MajorData[];
            else if (Array.isArray(obj["items"]))
              majorsArray = obj["items"] as unknown as MajorData[];
            else if (data && typeof data === "object") {
              if (
                obj["schoolSettings"] &&
                typeof obj["schoolSettings"] === "object"
              )
                setSchoolSettings(
                  obj["schoolSettings"] as unknown as SchoolSettings,
                );
              // try to extract arrays from object values
              for (const val of Object.values(obj)) {
                if (Array.isArray(val)) {
                  majorsArray = val as unknown as MajorData[];
                  break;
                }
              }
            }
          }

          setMajorsData(majorsArray);
          setBatchData(batchArray);
          setRequirementsData(requirementsArray);
        }
      } catch (error) {
        console.error("Failed to fetch majors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMajors();
  }, []);

  const registrationPathTabs = useMemo(() => {
    if (!registrationPaths) return [];
    return registrationPaths
      .sort((a, b) => a.order - b.order)
      .map((path) => {
        const icons = path.id === 1 ? ["🥇", "🥈", "🥉"] : ["🏆", "🏆", "🏆"];
        return {
          id: path.id.toString(),
          label: path.name,
          image: path.photoUrl,
          items: path.registrationPathItems
            .sort((a, b) => a.order - b.order)
            .map((item, index) => ({
              name: item.name,
              benefit: item.benefit,
              icon: icons[index] || "🏆",
              isActive: item.isActive,
            })),
        };
      });
  }, [registrationPaths]);

  // Data untuk Registration Requirements Section
  const requirements = [
    {
      order: 1,
      name: requirementsData?.[0]?.name || "Foto Copy Akte Kelahiran",
      isActive: requirementsData?.[0]?.isActive || false,
    },
    {
      order: 2,
      name: requirementsData?.[1]?.name || "Foto Copy Ijazah",
      isActive: requirementsData?.[1]?.isActive || false,
    },
    {
      order: 3,
      name: requirementsData?.[2]?.name || "Foto Copy KK dan Akta Kelahiran",
      isActive: requirementsData?.[2]?.isActive || false,
    },
    {
      order: 4,
      name: requirementsData?.[3]?.name || "Foto Copy KTP Orang Tua",
      isActive: requirementsData?.[3]?.isActive || false,
    },
    {
      order: 5,
      name: requirementsData?.[4]?.name || "Pas foto 3x4 Berwarna (3 lembar)",
      isActive: requirementsData?.[4]?.isActive || false,
    },
    {
      order: 6,
      name:
        requirementsData?.[5]?.name ||
        "Sertifikat TKA (Tes Kemampuan Akademik)",
      isActive: requirementsData?.[5]?.isActive || false,
    },
    {
      order: 7,
      name: requirementsData?.[6]?.name || "Foto Copy Kartu PIP (Jika Ada)",
      isActive: requirementsData?.[6]?.isActive || false,
    },
  ];

  const registrationPeriods = [
    {
      id: 1,
      name: batchData?.[0]?.name || "Gelombang 1",
      dateStart: formatMonth(batchData?.[0]?.dateStart),
      dateEnd: formatMonth(batchData?.[0]?.dateEnd),
      isActive: batchData?.[0]?.isActive || false,
      icon: "01",
    },
    {
      id: 2,
      name: batchData?.[1]?.name || "Gelombang 2",
      dateStart: formatMonth(batchData?.[1]?.dateStart),
      dateEnd: formatMonth(batchData?.[1]?.dateEnd),
      isActive: batchData?.[1]?.isActive || false,
      icon: "02",
    },
    {
      id: 3,
      name: batchData?.[2]?.name || "Gelombang 3",
      dateStart: formatMonth(batchData?.[2]?.dateStart),
      dateEnd: formatMonth(batchData?.[2]?.dateEnd),
      isActive: batchData?.[2]?.isActive || false,
      icon: "03",
    },
  ];

  const facilityList = [
    {
      name: "Fasilitas Sekolah",
      description:
        "Didukung ruang kelas nyaman, laboratorium modern, perpustakaan, area praktik, serta fasilitas penunjang belajar yang lengkap dan terawat.",
      icon: <HiOutlineAcademicCap />,
    },
    {
      name: "Kurikulum Siap Kerja",
      description:
        "Program kelas industri bersama Isuzu, Panasonic, PT. Mada Wikri Tunggal, dan mitra industri terpercaya.",
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
        "Proses belajar mengajar memanfaatkan teknologi digital, media interaktif, dan sistem pembelajaran online untuk meningkatkan pemahaman dan kesiapan siswa di dunia kerja.",
      icon: <HiOutlineComputerDesktop />,
    },
    {
      name: "Beasiswa & Biaya Terjangkau",
      description:
        "Tersedia berbagai program beasiswa prestasi dan bantuan biaya pendidikan bagi siswa berprestasi maupun kurang mampu, sehingga pendidikan berkualitas dapat diakses oleh semua.",
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
    {
      image: schoolSettings?.brochureFrontUrl || "/brochure/brosur-depan.png",
      alt: "Brosur Depan",
    },
    {
      image: schoolSettings?.brochureBackUrl || "/brochure/brosur-belakang.png",
      alt: "Brosur Belakang",
    },
  ];

  const contactList = [
    {
      name: "Telepon",
      contact: schoolSettings?.phone || "0282-494-126",
      icon: <MdCall />,
    },
    {
      name: "Email",
      contact: schoolSettings?.email || "smktamtamakroya.clp@yahoo.com",
      icon: <MdEmail />,
    },
    {
      name: "Website Sekolah",
      contact: schoolSettings?.website || "www.smktamtamakroya.sch.id",
      icon: <MdLanguage />,
    },
    {
      name: "Alamat Sekolah",
      contact:
        schoolSettings?.address?.replace(/\n/g, "<br/>") ||
        "Jl. Semangka, Kedawung, Kroya, <br/> Cilacap, Jawa Tengah, 53282",
      icon: <MdLocationOn />,
    },
  ];

  const socialList: {
    name: string;
    contact: string | string[];
    icon: React.ReactNode | string;
    hyperlink?: string | string[];
    extraContacts?: { label: string; href: string }[];
  }[] = [];
  if (
    schoolSettings?.socialMedia?.instagram &&
    Array.isArray(schoolSettings.socialMedia.instagram) &&
    schoolSettings.socialMedia.instagram.length > 0
  ) {
    const activeInstagram = schoolSettings.socialMedia.instagram.filter(
      (i) => i.isActive,
    );
    const maxInstagram = 3;
    const limitedInstagram = activeInstagram.slice(0, maxInstagram);
    const extraInstagram = activeInstagram.slice(maxInstagram).map((item) => ({
      label: getHandleFromUrl(item.url as string),
      href: item.url as string,
    }));
    const hyperlinks = limitedInstagram.map((i) => i.url as string);
    const contacts = hyperlinks.map((h) => getHandleFromUrl(h));
    socialList.push({
      name: "Instagram",
      contact: contacts,
      icon: "/sosmed/instagram.svg",
      hyperlink: hyperlinks,
      extraContacts: extraInstagram.length > 0 ? extraInstagram : undefined,
    });
  }
  if (
    schoolSettings?.socialMedia?.tiktok?.isActive &&
    schoolSettings.socialMedia.tiktok.url
  ) {
    socialList.push({
      name: "Tiktok",
      contact: getHandleFromUrl(
        schoolSettings.socialMedia.tiktok.url as string,
      ),
      icon: "/sosmed/tiktok.svg",
      hyperlink: schoolSettings.socialMedia.tiktok.url,
    });
  }
  if (
    schoolSettings?.socialMedia?.youtube?.isActive &&
    schoolSettings.socialMedia.youtube.url
  ) {
    socialList.push({
      name: "Youtube",
      contact: getHandleFromUrl(
        schoolSettings.socialMedia.youtube.url as string,
      ),
      icon: "/sosmed/youtube.svg",
      hyperlink: schoolSettings.socialMedia.youtube.url,
    });
  }
  if (
    schoolSettings?.socialMedia?.facebook?.isActive &&
    schoolSettings.socialMedia.facebook.url
  ) {
    socialList.push({
      name: "Facebook",
      contact: getHandleFromUrl(
        schoolSettings.socialMedia.facebook.url as string,
      ),
      icon: "/sosmed/facebook.svg",
      hyperlink: schoolSettings.socialMedia.facebook.url,
    });
  }

  const adminList =
    schoolSettings?.whatsappNumbers && schoolSettings.whatsappNumbers.length > 0
      ? schoolSettings.whatsappNumbers.map((w) => ({
          number: formatWhatsappNumber(w.number),
          label: `${w.label} : ${w.number}`,
          adminName: `(${w.name})`,
        }))
      : [
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
      <VacationTotal
        id="jumlah-peminat"
        data={majorsData ?? []}
        loading={isLoading}
      />

      {/* Jalur Pendaftaran */}
      <RegistrationPathSection
        id="jalur-pendaftaran"
        tabs={registrationPathTabs}
      />

      {/* Syarat & Periode Pendaftaran */}
      <RegistrationRequirementsSection
        id="syarat-periode-daftar"
        requirements={requirements}
        batches={registrationPeriods}
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
