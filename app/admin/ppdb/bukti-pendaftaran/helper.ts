import { DocumentFormData } from "./types";

const DEFAULT_FORM_VALUES: DocumentFormData = {
  letterTittle: "",
  letterNumber: "",
  letterOpening: "",
  letterContent: "",
  letterClosing: "",
};

const DEFAULT_STUDENT_INFO_FIELDS = [
  "STUDENT_NAME",
  "REGISTRATION_NUMBER",
  "ACCEPTANCE_STATUS",
  "MAJOR_CHOICE",
];

const STUDENT_INFO_FIELD_OPTIONS = [
  {
    key: "STUDENT_NAME",
    placeholder: "{{STUDENT_NAME}}",
    label: "Nama",
    source: "registration.studentDetail.fullName",
  },
  {
    key: "STUDENT_NISN",
    placeholder: "{{STUDENT_NISN}}",
    label: "NISN",
    source: "registration.studentDetail.nisn",
  },
  {
    key: "STUDENT_BIRTH_INFO",
    placeholder: "{{STUDENT_BIRTH_INFO}}",
    label: "Tempat, Tanggal Lahir",
    source: "Place + date of birth combined",
  },
  {
    key: "STUDENT_PLACE_OF_BIRTH",
    placeholder: "{{STUDENT_PLACE_OF_BIRTH}}",
    label: "Tempat Lahir",
    source: "registration.studentDetail.placeOfBirth",
  },
  {
    key: "STUDENT_DATE_OF_BIRTH",
    placeholder: "{{STUDENT_DATE_OF_BIRTH}}",
    label: "Tanggal Lahir",
    source: "registration.studentDetail.dateOfBirth",
  },
  {
    key: "STUDENT_SCHOOL_ORIGIN",
    placeholder: "{{STUDENT_SCHOOL_ORIGIN}}",
    label: "Asal Sekolah",
    source: "registration.studentDetail.schoolOriginName",
  },
  {
    key: "REGISTRATION_NUMBER",
    placeholder: "{{REGISTRATION_NUMBER}}",
    label: "Nomor Pendaftaran",
    source: "registration.registrationNumber",
  },
  {
    key: "ACCEPTANCE_STATUS",
    placeholder: "{{ACCEPTANCE_STATUS}}",
    label: "Dinyatakan",
    source: 'Static text "DITERIMA"',
  },
  {
    key: "MAJOR_CHOICE",
    placeholder: "{{MAJOR_CHOICE}}",
    label: "Pada Konsentrasi Keahlian",
    source: "registration.majorChoiceCode",
  },
] as const;

const ALL_STUDENT_INFO_FIELD_KEYS: string[] = STUDENT_INFO_FIELD_OPTIONS.map(
  (field) => field.key,
);

const DEFAULT_STUDENT_INFO_ORDER = [
  ...DEFAULT_STUDENT_INFO_FIELDS,
  ...ALL_STUDENT_INFO_FIELD_KEYS.filter(
    (key) => !DEFAULT_STUDENT_INFO_FIELDS.includes(key),
  ),
];

const DEFAULT_DISABLED_STUDENT_INFO_FIELDS = ALL_STUDENT_INFO_FIELD_KEYS.filter(
  (key) => !DEFAULT_STUDENT_INFO_FIELDS.includes(key),
);

const readResponseJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getApiMessage = (data: unknown, fallback: string) => {
  if (data && typeof data === "object") {
    const maybeMessage = (data as { message?: string }).message;
    const maybeError = (data as { error?: string }).error;
    return maybeMessage || maybeError || fallback;
  }

  return fallback;
};

export {
  DEFAULT_FORM_VALUES,
  STUDENT_INFO_FIELD_OPTIONS,
  DEFAULT_STUDENT_INFO_ORDER,
  DEFAULT_DISABLED_STUDENT_INFO_FIELDS,
  ALL_STUDENT_INFO_FIELD_KEYS,
  DEFAULT_STUDENT_INFO_FIELDS,
  readResponseJson,
  getApiMessage,
}