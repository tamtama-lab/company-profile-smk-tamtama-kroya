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

const PAGE_ONE_MARGINS: [number, number, number, number] = [40, 50, 40, 40];

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

  const docDefinition = createDocument(template);
  enforcePageTwoLayout(docDefinition);

  return docDefinition;
}

function enforcePageTwoLayout(docDefinition: TDocumentDefinitions): void {
  const contentList = Array.isArray(docDefinition.content)
    ? docDefinition.content
    : docDefinition.content
      ? [docDefinition.content]
      : [];

  const firstContent = contentList[0] as
    | { margin?: number | [number, number, number, number] }
    | undefined;

  docDefinition.pageMargins = PAGE_ONE_MARGINS;

  if (firstContent && firstContent.margin !== undefined) {
    delete firstContent.margin;
  }

  for (const contentItem of contentList) {
    if (!contentItem || typeof contentItem !== "object") {
      continue;
    }

    const stack = (contentItem as { stack?: unknown }).stack;

    if (!Array.isArray(stack) || stack.length === 0) {
      continue;
    }

    const footerSection = stack[stack.length - 1] as
      | ({ unbreakable?: boolean } & object)
      | undefined;

    if (footerSection && typeof footerSection === "object") {
      footerSection.unbreakable = true;
    }
  }
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
