import {
  createDocument,
} from "@tamtama-lab/pdf-templates";
import { initPdfMake } from "@tamtama-lab/pdf-templates/browser";
import { createHeaderSection } from "@tamtama-lab/pdf-templates/sections/header";
import {
  createSignatureSection,
  type SignatureInfo,
} from "@tamtama-lab/pdf-templates/sections/signature";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

export type PdfAction = "open" | "download" | "print" | "preview";

interface PendaftaranUlangStudentDetail {
  nisn?: string | null;
  nik?: string | null;
  fullName?: string | null;
  placeOfBirth?: string | null;
  dateOfBirth?: string | null;
  gender?: number | null;
  religion?: string | null;
  schoolOriginName?: string | null;
  schoolOriginNpsn?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  isKipRecipient?: boolean | null;
  kipNumber?: string | null;
}

interface PendaftaranUlangParentDetail {
  fatherName?: string | null;
  fatherLivingStatus?: string | null;
  motherName?: string | null;
  motherLivingStatus?: string | null;
  parentPhoneNumber?: string | null;
  parentAddress?: string | null;
  guardianName?: string | null;
  guardianPhoneNumber?: string | null;
  guardianAddress?: string | null;
}

export interface PendaftaranUlangRegistration {
  registrationNumber?: number | string | null;
  majorChoiceCode?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  studentDetail?: PendaftaranUlangStudentDetail | null;
  parentDetail?: PendaftaranUlangParentDetail | null;
  majorChoice?: unknown;
  author?: unknown;
}

export interface CommitteeSignaturePayload {
  name: string;
  position: string;
  title?: string;
  nip?: string | null;
  place?: string;
  date?: string | Date;
  signatureUrl?: string;
  stampUrl?: string;
  stampSize?: SignatureInfo["stampSize"];
}

export interface GeneratePendaftaranUlangPdfParams {
  registration: PendaftaranUlangRegistration;
  committee?: CommitteeSignaturePayload;
  action?: PdfAction;
  filename?: string;
  targetWindow?: Window | null;
}

let isPdfMakeInitialized = false;

export function createTemplateHeader() {
  return createHeaderSection();
}

export function buildSignatureInfo(
  committee: CommitteeSignaturePayload,
): SignatureInfo {
  return {
    name: committee.name,
    position: committee.position,
    title: committee.title,
    place: committee.place,
    date: parseSignatureDate(committee.date),
    signatureImage: committee.signatureUrl,
    stampImage: committee.stampUrl,
    stampSize: committee.stampSize,
  };
}

export function createTemplateSignature(committee: CommitteeSignaturePayload) {
  return createSignatureSection(buildSignatureInfo(committee));
}

export function createPendaftaranUlangDocDefinition({
  committee,
}: Omit<GeneratePendaftaranUlangPdfParams, "action" | "filename">): TDocumentDefinitions {
  const signature = createSignatureSection(
    committee
      ? buildSignatureInfo(committee)
      : {
          name: "Panitia PPDB",
          position: "Ketua",
        },
  );

  return createDocument(
    [
      createHeaderSection(),
      { marginTop: 420, text: "" },
      {
        columns: [{ width: "*", text: "" }, { width: 220, ...signature }],
      },
    ],
    {
      pageMargins: [30, 30, 10, 30],
    },
  );
}

export async function generatePendaftaranUlangPdf({
  registration: _registration,
  committee,
  action = "open",
  filename = "pendaftaran-ulang.pdf",
  targetWindow,
}: GeneratePendaftaranUlangPdfParams): Promise<TDocumentDefinitions> {
  const { default: pdfMake } = await import("pdfmake/build/pdfmake");

  if (!isPdfMakeInitialized) {
    initPdfMake(pdfMake);
    isPdfMakeInitialized = true;
  }

  const resolvedCommittee = committee
    ? await resolveCommitteeImageSources(committee)
    : undefined;

  const docDefinition = createPendaftaranUlangDocDefinition({
    committee: resolvedCommittee,
    registration: _registration,
  });

  const pdfInstance = pdfMake.createPdf(docDefinition);

  if (action === "download") {
    pdfInstance.download(filename);
    return docDefinition;
  }

  if (action === "print") {
    pdfInstance.print();
    return docDefinition;
  }

  if (targetWindow && !targetWindow.closed) {
    await openPdfInWindow(pdfInstance, targetWindow);
    return docDefinition;
  }

  pdfInstance.open();
  return docDefinition;
}

export async function generatePendaftaranUlangPdfDataUrl({
  registration: _registration,
  committee,
}: Omit<GeneratePendaftaranUlangPdfParams, "action" | "filename" | "targetWindow">): Promise<string> {
  const { default: pdfMake } = await import("pdfmake/build/pdfmake");

  if (!isPdfMakeInitialized) {
    initPdfMake(pdfMake);
    isPdfMakeInitialized = true;
  }

  const resolvedCommittee = committee
    ? await resolveCommitteeImageSources(committee)
    : undefined;

  const docDefinition = createPendaftaranUlangDocDefinition({
    committee: resolvedCommittee,
    registration: _registration,
  });

  const pdfInstance = pdfMake.createPdf(docDefinition);
  return getPdfDataUrl(pdfInstance);
}

export async function generatePendaftaranUlangPdfBlob({
  registration: _registration,
  committee,
}: Omit<GeneratePendaftaranUlangPdfParams, "action" | "filename" | "targetWindow">): Promise<Blob> {
  const { default: pdfMake } = await import("pdfmake/build/pdfmake");

  if (!isPdfMakeInitialized) {
    initPdfMake(pdfMake);
    isPdfMakeInitialized = true;
  }

  const resolvedCommittee = committee
    ? await resolveCommitteeImageSources(committee)
    : undefined;

  const docDefinition = createPendaftaranUlangDocDefinition({
    committee: resolvedCommittee,
    registration: _registration,
  });

  const pdfInstance = pdfMake.createPdf(docDefinition);
  return getPdfBlob(pdfInstance);
}

export function createPdfObjectUrl(
  blob: Blob,
  previousUrl?: string | null,
): string {
  if (previousUrl) {
    URL.revokeObjectURL(previousUrl);
  }

  return URL.createObjectURL(blob);
}

function parseSignatureDate(value?: string | Date): Date | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

async function resolveCommitteeImageSources(
  committee: CommitteeSignaturePayload,
): Promise<CommitteeSignaturePayload> {
  const [signatureUrl, stampUrl] = await Promise.all([
    resolveImageSource(committee.signatureUrl),
    resolveImageSource(committee.stampUrl),
  ]);

  return {
    ...committee,
    signatureUrl,
    stampUrl,
  };
}

async function resolveImageSource(source?: string): Promise<string | undefined> {
  if (!source) {
    return undefined;
  }

  if (isDataUrl(source)) {
    return source;
  }

  if (!isHttpUrl(source)) {
    return source;
  }

  try {
    return await fetchImageAsDataUrl(source);
  } catch (error) {
    console.warn("Direct image fetch failed, retrying via proxy:", error);
    try {
      return await fetchImageAsDataUrlViaProxy(source);
    } catch (proxyError) {
      console.error(
        "Failed to convert image URL to data URL via proxy:",
        proxyError,
      );
      throw new Error("Gagal memuat gambar tanda tangan/stempel");
    }
  }
}

function isDataUrl(value: string): boolean {
  return value.startsWith("data:");
}

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

async function fetchImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image (${response.status})`);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const arrayBuffer = await response.arrayBuffer();

  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  const base64 = btoa(binary);
  return `data:${contentType};base64,${base64}`;
}

async function fetchImageAsDataUrlViaProxy(url: string): Promise<string> {
  const response = await fetch("/api/utils/image-to-data-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  const data = (await response.json()) as { dataUrl?: string; error?: string };

  if (!response.ok || !data?.dataUrl) {
    throw new Error(data?.error || `Proxy conversion failed (${response.status})`);
  }

  return data.dataUrl;
}

async function openPdfInWindow(
  pdfInstance: {
    getDataUrl: (callback: (dataUrl: string) => void) => void;
  },
  targetWindow: Window,
): Promise<void> {
  await new Promise<void>((resolve) => {
    pdfInstance.getDataUrl((dataUrl) => {
      if (!targetWindow.closed) {
        targetWindow.location.href = dataUrl;
      }
      resolve();
    });
  });
}

async function getPdfDataUrl(pdfInstance: {
  getDataUrl: (callback: (dataUrl: string) => void) => void;
}): Promise<string> {
  return new Promise<string>((resolve) => {
    pdfInstance.getDataUrl((dataUrl) => {
      resolve(dataUrl);
    });
  });
}

async function getPdfBlob(pdfInstance: {
  getBlob: (callback: (blob: Blob) => void) => void;
}): Promise<Blob> {
  return new Promise<Blob>((resolve) => {
    pdfInstance.getBlob((blob) => {
      resolve(blob);
    });
  });
}
