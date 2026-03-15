import z from "zod";

export interface AcademicYearOption {
  value: string | number;
  label: string;
}

export interface CommitteeData {
  id?: number;
  academicYearId: number;
  name: string;
  position: string;
  nip?: string | null;
  place: string;
  defaultDate: string;
  signatureUrl: string;
  stampUrl: string;
}

export interface PreviewCommitteeOverride {
  name?: string | null;
  position?: string | null;
  nip?: string | null;
  place?: string | null;
  defaultDate?: string | null;
  signatureUrl?: string | null;
  stampUrl?: string | null;
}

export const committeeSchema = z.object({
  name: z.string().min(1, "Mohon isi nama panitia terlebih dahulu"),
  position: z.string().min(1, "Mohon isi jabatan terlebih dahulu"),
  nip: z.string().optional().nullable(),
  place: z.string().min(1, "Mohon isi tempat terlebih dahulu"),
  defaultDate: z.string().min(1, "Mohon isi tanggal terlebih dahulu"),
});

export type CommitteeFormData = z.infer<typeof committeeSchema>;
