"use client";

import React, {
  JSX,
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import {
  LuInfo,
  LuX,
  LuCircleX,
  LuTriangleAlert,
  LuCheck,
} from "react-icons/lu";

export type AlertVariant = "info" | "success" | "warning" | "error";

interface ValidationError {
  field: string;
  message: string;
  rule: string;
}

interface AlertProps {
  title?: string;
  description?: string;
  variant?: AlertVariant;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
  floating?: boolean;
  autoDismissMs?: number;
  errors?: ValidationError[];
}

export interface AlertMessage {
  id: string;
  title?: string;
  description?: string;
  variant: AlertVariant;
  autoDismissMs?: number;
  errors?: ValidationError[];
}

interface AlertContextType {
  showAlert: (alert: Omit<AlertMessage, "id">) => void;
  hideAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
};

const baseContainer =
  "w-full max-w-xl rounded-lg border px-4 py-3 flex items-start gap-3 text-sm";

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: JSX.Element }
> = {
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: <LuInfo className="mt-0.5 text-blue-600" size={18} />,
  },
  success: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-800",
    icon: <LuCheck className="mt-0.5 text-emerald-600" size={18} />,
  },
  warning: {
    container: "bg-amber-50 border-amber-200 text-amber-800",
    icon: <LuTriangleAlert className="mt-0.5 text-amber-600" size={18} />,
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: <LuCircleX className="mt-0.5 text-red-600" size={18} />,
  },
};

// Translation mapping for field names
const fieldTranslations: Record<string, string> = {
  "parentDetail.fatherLivingStatus": "Kondisi Ayah",
  "parentDetail.motherLivingStatus": "Kondisi Ibu",
  "parentDetail.fatherName": "Nama Ayah",
  "parentDetail.motherName": "Nama Ibu",
  "parentDetail.parentPhoneNumber": "Nomor Telepon Orang Tua",
  "parentDetail.parentAddress": "Alamat Orang Tua",
  "parentDetail.guardianName": "Nama Wali",
  "parentDetail.guardianPhoneNumber": "Nomor Telepon Wali",
  "parentDetail.guardianAddress": "Alamat Wali",
  "studentDetail.nisn": "NISN",
  "studentDetail.nik": "NIK",
  "studentDetail.kipNumber": "Nomor KIP",
  "studentDetail.fullName": "Nama Lengkap",
  "studentDetail.placeOfBirth": "Tempat Lahir",
  "studentDetail.dateOfBirth": "Tanggal Lahir",
  "studentDetail.gender": "Jenis Kelamin",
  "studentDetail.religion": "Agama",
  "studentDetail.schoolOriginNpsn": "NPSN Sekolah Asal",
  "studentDetail.address": "Alamat",
  "studentDetail.phoneNumber": "Nomor Telepon",
  "studentDetail.email": "Email",
  majorChoiceCode: "Kode Jurusan",
  // Teacher account fields
  fullName: "Nama Lengkap",
  username: "Username",
  password: "Password",
  schoolLessonIds: "Mata Pelajaran",
  photoUrl: "Foto Profil",
};

// Translation for common validation messages
const translateErrorMessage = (message: string): string => {
  const translations: Record<string, string> = {
    // AdonisJS Unique validation (database.unique rule)
    "has already been taken": "sudah terdaftar atau digunakan sebelumnya",
    E_UNIQUE_VIOLATION: "sudah terdaftar atau digunakan sebelumnya",

    // AdonisJS Required validation
    "field is required": "wajib diisi",
    "is required": "wajib diisi",

    // AdonisJS Email validation
    "must be a valid email": "harus berupa email yang valid",
    "field must be a valid email": "harus berupa email yang valid",

    // AdonisJS MinLength/MaxLength
    "must be at least": "minimal harus",
    "minimum length is": "panjang minimal adalah",
    "must not be more than": "tidak boleh lebih dari",

    // Student specific validations (legacy)
    "The nisn field must be 10 characters long":
      "NISN harus terdiri dari 10 karakter",
    "the nik has already been taken": "NIK sudah terdaftar",
    "The nik field must be 16 characters long":
      "NIK harus terdiri dari 16 karakter",

    "The dateOfBirth field must be a datetime value":
      "Tanggal lahir harus berupa tanggal yang valid",
    "The selected gender is invalid": "Jenis kelamin yang dipilih tidak valid",
    "The selected religion is invalid": "Agama yang dipilih tidak valid",
    "The email field must be a valid email address":
      "Email harus berupa alamat email yang valid",
    "The selected fatherLivingStatus is invalid":
      "Kondisi ayah yang dipilih tidak valid",
    "The selected motherLivingStatus is invalid":
      "Kondisi ibu yang dipilih tidak valid",
    "The kipNumber field must not be greater than 10 characters":
      "Nomor KIP tidak boleh lebih dari 10 karakter",

    "Invalid credentials provided": "Username atau password salah",

    // Generic patterns
    "must be 10 characters long": "harus terdiri dari 10 karakter",
    "must be 16 characters long": "harus terdiri dari 16 karakter",
    "must be a datetime value": "harus berupa tanggal yang valid",
    "must be a valid email address": "harus berupa alamat email yang valid",
    "is invalid": "tidak valid",
    "must be a valid phone number": "harus berupa nomor telepon yang valid",
    "The selected": "Yang dipilih",
  };

  let translatedMessage = message;

  // Try to find exact match first
  if (translations[message]) {
    return translations[message];
  }

  // Then try partial matches
  for (const [key, value] of Object.entries(translations)) {
    if (message.includes(key)) {
      translatedMessage = translatedMessage.replace(key, value);
    }
  }

  return translatedMessage;
};

export const Alert: React.FC<AlertProps> = ({
  title,
  description,
  variant = "info",
  onClose,
  className = "",
  children,
  floating = false,
  autoDismissMs,
  errors,
}) => {
  const { container, icon } = variantStyles[variant];
  const [entered, setEntered] = useState(false);
  const EXIT_DURATION = 110;

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = useCallback(() => {
    if (!onClose) return;
    setEntered(false);
    setTimeout(() => onClose(), EXIT_DURATION);
  }, [onClose]);

  useEffect(() => {
    if (!autoDismissMs || !onClose) return;
    const timer = setTimeout(() => handleClose(), autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, handleClose, onClose]);

  const body = (
    <div
      className={`${baseContainer} ${container} ${className} transition-all duration-200 ease-out ${entered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
    >
      <div className="shrink-0" aria-hidden>
        {icon}
      </div>
      <div className="flex-1 space-y-2">
        {title && <div className="font-semibold leading-tight">{title}</div>}
        {description && (
          <div className="leading-relaxed text-sm">{description}</div>
        )}
        {errors && errors.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2">
            {errors.map((error, index) => (
              <div key={index} className="flex flex-col gap-0.5">
                <span className="text-xs font-medium">
                  {fieldTranslations[error.field] || error.field}:
                </span>
                <span className="text-sm pl-2">
                  {translateErrorMessage(error.message)}
                </span>
              </div>
            ))}
          </div>
        )}
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 rounded-md p-1 text-inherit hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
          aria-label="Close alert"
        >
          <LuX size={16} />
        </button>
      )}
    </div>
  );

  if (!floating) return body;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 flex justify-center pointer-events-none">
      <div className="w-full max-w-xl px-4 pointer-events-auto">{body}</div>
    </div>
  );
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const showAlert = useCallback((alert: Omit<AlertMessage, "id">) => {
    const id = `alert-${Date.now()}-${Math.random()}`;
    setAlerts((prev) => [...prev, { ...alert, id }]);
  }, []);

  const hideAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-3 pointer-events-none w-full max-w-xl px-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <Alert
              title={alert.title}
              description={alert.description}
              variant={alert.variant}
              onClose={() => hideAlert(alert.id)}
              autoDismissMs={alert.autoDismissMs || 5000}
              errors={alert.errors}
            />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};
