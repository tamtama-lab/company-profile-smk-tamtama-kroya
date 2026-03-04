export interface MockGalleryItem {
  id: number;
  extracurricularId: number;
  photoUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockAchievementItem {
  id: number;
  extracurricularId: number;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockExtracurricularDetail {
  id: number;
  name: string;
  slug: string;
  thumbnailUrl: string;
  categories: string[];
  mentorName: string;
  location: string;
  schedule: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  galleries: MockGalleryItem[];
  achievements: MockAchievementItem[];
}

const createdAt = "2026-03-04T12:10:49.000+00:00";
const updatedAt = "2026-03-04T12:10:49.000+00:00";

export const MOCK_EXTRACURRICULARS: MockExtracurricularDetail[] = [
  {
    id: 1,
    name: "Futsal",
    slug: "futsal",
    thumbnailUrl: "https://picsum.photos/seed/futsal-thumb/1200/800",
    categories: ["Olahraga"],
    mentorName: "Budi Santoso",
    location: "Lapangan Futsal SMK Tamtama Kroya",
    schedule: "Setiap Senin dan Kamis, 15:30 - 17:00 WIB",
    description:
      "Ekstrakurikuler futsal untuk meningkatkan kebugaran, strategi bermain, dan sportivitas siswa.",
    createdAt,
    updatedAt,
    deletedAt: null,
    galleries: [
      {
        id: 1,
        extracurricularId: 1,
        photoUrl: "https://picsum.photos/seed/futsal-gallery-1/1600/900",
        order: 0,
        createdAt,
        updatedAt,
      },
      {
        id: 2,
        extracurricularId: 1,
        photoUrl: "https://picsum.photos/seed/futsal-gallery-2/1600/900",
        order: 1,
        createdAt,
        updatedAt,
      },
    ],
    achievements: [
      {
        id: 1,
        extracurricularId: 1,
        name: "Finalis Turnamen Futsal Antar SMK 2025",
        order: 0,
        createdAt,
        updatedAt,
      },
      {
        id: 2,
        extracurricularId: 1,
        name: "Juara 2 Liga Futsal Pelajar Kabupaten 2024",
        order: 1,
        createdAt,
        updatedAt,
      },
    ],
  },
  {
    id: 2,
    name: "Paskibra",
    slug: "paskibra",
    thumbnailUrl: "https://picsum.photos/seed/paskibra-thumb/1200/800",
    categories: ["Kepemimpinan", "Disiplin"],
    mentorName: "Andi Prasetyo",
    location: "Gedung Olahraga SMK Tamtama Kroya",
    schedule: "Setiap Selasa dan Jumat, 14:00 - 16:00 WIB",
    description:
      "Paskibra membentuk karakter disiplin, jiwa kepemimpinan, dan kecintaan terhadap bangsa.",
    createdAt,
    updatedAt,
    deletedAt: null,
    galleries: [
      {
        id: 3,
        extracurricularId: 2,
        photoUrl: "https://picsum.photos/seed/paskibra-gallery-1/1600/900",
        order: 0,
        createdAt,
        updatedAt,
      },
      {
        id: 4,
        extracurricularId: 2,
        photoUrl: "https://picsum.photos/seed/paskibra-gallery-2/1600/900",
        order: 1,
        createdAt,
        updatedAt,
      },
    ],
    achievements: [
      {
        id: 3,
        extracurricularId: 2,
        name: "Pasukan Pengibar Upacara HUT RI Kecamatan 2025",
        order: 0,
        createdAt,
        updatedAt,
      },
      {
        id: 4,
        extracurricularId: 2,
        name: "Juara 1 Lomba Variasi Formasi Baris-Berbaris 2024",
        order: 1,
        createdAt,
        updatedAt,
      },
    ],
  },
  {
    id: 3,
    name: "PMR",
    slug: "pmr",
    thumbnailUrl: "https://picsum.photos/seed/pmr-thumb/1200/800",
    categories: ["Sosial", "Kesehatan"],
    mentorName: "Siti Rahma",
    location: "Gedung Olahraga SMK Tamtama Kroya",
    schedule: "Setiap Rabu dan Jumat, 13:00 - 15:00 WIB",
    description:
      "Palang Merah Remaja yang berfokus pada pertolongan pertama, kepedulian sosial, dan kesiapsiagaan.",
    createdAt,
    updatedAt,
    deletedAt: null,
    galleries: [
      {
        id: 9,
        extracurricularId: 3,
        photoUrl: "https://picsum.photos/seed/pmr-gallery-1/1600/900",
        order: 0,
        createdAt: "2026-03-04T12:11:02.000+00:00",
        updatedAt: "2026-03-04T12:11:02.000+00:00",
      },
      {
        id: 10,
        extracurricularId: 3,
        photoUrl: "https://picsum.photos/seed/pmr-gallery-2/1600/900",
        order: 1,
        createdAt: "2026-03-04T12:11:03.000+00:00",
        updatedAt: "2026-03-04T12:11:03.000+00:00",
      },
    ],
    achievements: [
      {
        id: 9,
        extracurricularId: 3,
        name: "Juara 1 Lomba Pertolongan Pertama 2024",
        order: 0,
        createdAt: "2026-03-04T12:11:04.000+00:00",
        updatedAt: "2026-03-04T12:11:04.000+00:00",
      },
      {
        id: 10,
        extracurricularId: 3,
        name: "Tim Relawan Sekolah Tanggap Bencana 2025",
        order: 1,
        createdAt: "2026-03-04T12:11:04.000+00:00",
        updatedAt: "2026-03-04T12:11:04.000+00:00",
      },
    ],
  },
  {
    id: 4,
    name: "Robotika",
    slug: "robotika",
    thumbnailUrl: "https://picsum.photos/seed/robotika-thumb/1200/800",
    categories: ["Teknologi", "Akademik"],
    mentorName: "Rizky Maulana",
    location: "Laboratorium Teknologi SMK Tamtama Kroya",
    schedule: "Setiap Jumat, 16:00 - 18:00 WIB",
    description:
      "Ekstrakurikuler robotika untuk mengasah logika, kreativitas, dan keterampilan rekayasa siswa.",
    createdAt,
    updatedAt,
    deletedAt: null,
    galleries: [
      {
        id: 11,
        extracurricularId: 4,
        photoUrl: "https://picsum.photos/seed/robotika-gallery-1/1600/900",
        order: 0,
        createdAt,
        updatedAt,
      },
      {
        id: 12,
        extracurricularId: 4,
        photoUrl: "https://picsum.photos/seed/robotika-gallery-2/1600/900",
        order: 1,
        createdAt,
        updatedAt,
      },
    ],
    achievements: [
      {
        id: 11,
        extracurricularId: 4,
        name: "Top 10 Kompetisi Robotik Pelajar Nasional 2025",
        order: 0,
        createdAt,
        updatedAt,
      },
      {
        id: 12,
        extracurricularId: 4,
        name: "Juara 2 Lomba Line Follower Tingkat Provinsi 2024",
        order: 1,
        createdAt,
        updatedAt,
      },
    ],
  },
  {
    id: 5,
    name: "Sinematografi",
    slug: "sinematografi",
    thumbnailUrl: "https://picsum.photos/seed/sinematografi-thumb/1200/800",
    categories: ["Seni", "Media Kreatif"],
    mentorName: "Dewi Lestari",
    location: "Studio Multimedia SMK Tamtama Kroya",
    schedule: "Setiap Kamis, 15:00 - 17:00 WIB",
    description:
      "Sinematografi membina kemampuan siswa dalam produksi video, storytelling, dan teknik pengambilan gambar.",
    createdAt,
    updatedAt,
    deletedAt: null,
    galleries: [
      {
        id: 13,
        extracurricularId: 5,
        photoUrl: "https://picsum.photos/seed/sinematografi-gallery-1/1600/900",
        order: 0,
        createdAt,
        updatedAt,
      },
      {
        id: 14,
        extracurricularId: 5,
        photoUrl: "https://picsum.photos/seed/sinematografi-gallery-2/1600/900",
        order: 1,
        createdAt,
        updatedAt,
      },
    ],
    achievements: [
      {
        id: 13,
        extracurricularId: 5,
        name: "Best Short Movie Pelajar 2025",
        order: 0,
        createdAt,
        updatedAt,
      },
      {
        id: 14,
        extracurricularId: 5,
        name: "Official Media Team Event Sekolah 2024",
        order: 1,
        createdAt,
        updatedAt,
      },
    ],
  },
];
