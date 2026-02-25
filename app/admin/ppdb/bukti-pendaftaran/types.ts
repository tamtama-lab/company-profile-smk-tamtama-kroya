import z from "zod";

export interface DocumentData {
  id: number;
  letterTittle: string;
  letterNumber: string;
  letterOpening: string;
  letterContent: string;
  letterClosing: string;
  studentData: {
    name: string;
    registerNumber: string;
    acceptenceStatus: string;
    selectedMajor: string;
  uploadedAt: string;
  };
}


export interface PageTwoConfig  {
  title?: string;
  letterNumber?: string;
  opening?: string;
  content?: string;
  closing?: string;
  studentInfoFields?: string[];
};

export interface PageTwoResponse  {
  academicYear?: {
    name?: string;
    formatted?: string;
  };
  config?: PageTwoConfig;
};

export interface PageThreeConfig {
  pageThreeUrl?: string;
  pageThreeType?: string;
};


export const documentSchema = z.object({
  letterTittle: z.string().min(1, "Mohon isi judul surat terlebih dahulu"),
  letterNumber: z.string().min(1, "Mohon isi nomor surat terlebih dahulu"),
    letterOpening: z.string().min(1, "Mohon isi kalimat pembuka terlebih dahulu"),
    letterContent: z.string().min(1, "Mohon isi isi surat terlebih dahulu"),
    letterClosing: z.string().min(1, "Mohon isi kalimat penutup terlebih dahulu"),
});

export type DocumentFormData = z.infer<typeof documentSchema>;
