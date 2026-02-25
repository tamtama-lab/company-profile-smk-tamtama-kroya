import { createDocument, PendaftaranUlangTemplate } from "@tamtama-lab/pdf-templates";
import { initPdfMake } from "@tamtama-lab/pdf-templates/browser";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

export interface PageTwoPdfConfig {
  title?: string;
  letterNumber?: string;
  opening?: string;
  content?: string;
  closing?: string;
  academicYears?: string;
  studentInfoFields?: string[];
}

let isPdfMakeInitialized = false;

type TemplateRegistration = ConstructorParameters<
  typeof PendaftaranUlangTemplate
>[0];

const DEFAULT_REGISTRATION = ({
  registrationNumber: 20260001,
  majorChoiceCode: "TKJ",
  majorChoice: {},
  author: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  studentDetail: {
    fullName: "Nama Calon Murid",
    placeOfBirth: "Kroya",
    dateOfBirth: "2010-01-01",
    studentNisn: "1234567890",
    gender: 1,
    religion: "islam",
    schoolOriginName: "SMP/MTs Contoh",
    address: "Jl. Contoh Alamat",
  },
  parentDetail: {
    fatherName: "Nama Ayah",
    motherName: "Nama Ibu",
    parentPhoneNumber: "081234567890",
    parentAddress: "Jl. Contoh Alamat",
    fatherLivingStatus: "alive",
    motherLivingStatus: "alive",
    guardianName: "Nama Wali",
    guardianPhoneNumber: "081234567891",
    guardianAddress: "Jl. Contoh Alamat",
  },
} as unknown) as TemplateRegistration;

export function createPageTwoDocDefinition(
  config: PageTwoPdfConfig,
): TDocumentDefinitions {
  const templateOptions = {
    window: typeof window !== "undefined" ? window : undefined,
    variables: {
      academic_years: config.academicYears || "2026/2027",
    },
    title: config.title || "",
    letterNumber: config.letterNumber || "",
    opening: config.opening || "",
    content: config.content || "",
    closing: config.closing || "",
    studentInfoFields: config.studentInfoFields,
  } as unknown as ConstructorParameters<typeof PendaftaranUlangTemplate>[1];

  const template = new PendaftaranUlangTemplate(
    DEFAULT_REGISTRATION,
    templateOptions,
  );

  return createDocument(template);
}

export async function generatePageTwoPdfBlob(
  config: PageTwoPdfConfig,
): Promise<Blob> {
  const { default: pdfMake } = await import("pdfmake/build/pdfmake");

  if (!isPdfMakeInitialized) {
    initPdfMake(pdfMake);
    isPdfMakeInitialized = true;
  }

  const docDefinition = createPageTwoDocDefinition(config);
  const pdfInstance = pdfMake.createPdf(docDefinition);
  const pdfInstanceRuntime = pdfInstance as unknown as {
    getBlob: (callback: (blob: Blob) => void) => void;
  };

  return new Promise<Blob>((resolve) => {
    pdfInstanceRuntime.getBlob((blob: Blob) => {
      resolve(blob);
    });
  });
}

export function createPageTwoPdfObjectUrl(
  blob: Blob,
  previousUrl?: string | null,
): string {
  if (previousUrl) {
    URL.revokeObjectURL(previousUrl);
  }

  return URL.createObjectURL(blob);
}
