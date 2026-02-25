import { LuFileText, LuFileWarning, LuFileX2 } from "react-icons/lu";
import { useEffect, useState } from "react";
import mammoth from "mammoth";

interface FileUploadPreviewProps {
  file: File | null;
  previewUrl?: string | null;
  emptyText?: string;
}

type SupportedFileKind = "png" | "jpg" | "jpeg" | "pdf" | "doc" | "docx";

const getKindFromName = (name?: string | null): SupportedFileKind | null => {
  const ext = name?.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  if (ext === "png") return "png";
  if (ext === "jpg") return "jpg";
  if (ext === "jpeg") return "jpeg";
  if (ext === "pdf") return "pdf";
  if (ext === "doc") return "doc";
  if (ext === "docx") return "docx";
  return null;
};

const getKindFromFile = (file: File | null): SupportedFileKind | null => {
  if (!file) return null;
  const mime = file.type.toLowerCase();
  if (mime === "image/png") return "png";
  if (mime === "image/jpg") return "jpg";
  if (mime === "image/jpeg") return "jpeg";
  if (mime === "application/pdf") return "pdf";
  if (mime === "application/msword") return "doc";
  if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  return getKindFromName(file.name);
};

const getKindFromUrl = (url?: string | null): SupportedFileKind | null => {
  if (!url) return null;
  const cleanUrl = url.split("?")[0].split("#")[0];
  return getKindFromName(cleanUrl);
};

export default function FileUploadPreview({
  file,
  previewUrl,
  emptyText = "Belum ada file yang dipilih",
}: FileUploadPreviewProps) {
  const fileKind = getKindFromFile(file) ?? getKindFromUrl(previewUrl);
  const [docHtml, setDocHtml] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when file changes
    setDocHtml(null);
    setConversionError(null);

    if (!file || (fileKind !== "doc" && fileKind !== "docx")) {
      return;
    }

    // Convert DOC/DOCX to HTML using mammoth
    const convertDocToHtml = async () => {
      setIsConverting(true);
      setConversionError(null);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocHtml(result.value);
      } catch (error) {
        console.error("Error converting document:", error);
        setConversionError("Gagal mengkonversi dokumen");
      } finally {
        setIsConverting(false);
      }
    };

    convertDocToHtml();
  }, [file, fileKind]);

  if (!fileKind || !previewUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-sm text-gray-500">
        <LuFileX2 className="text-4xl" />
        <p className="mt-2">{emptyText}</p>
      </div>
    );
  }

  if (fileKind === "png" || fileKind === "jpg" || fileKind === "jpeg") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <img
          src={previewUrl}
          alt={file?.name ?? "Preview PNG"}
          className="max-w-full max-h-full object-contain rounded-md border border-gray-200"
        />
        {/* {file?.name && <p className="text-sm text-gray-700">{file.name}</p>} */}
      </div>
    );
  }

  if (fileKind === "pdf") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-700">
        <iframe
          src={previewUrl + "#zoom=page-fit&view=FitH"}
          title={file?.name ?? "Preview PDF"}
          className="w-full h-full rounded-md border border-gray-200"
        />
        {/* {file?.name && (
          <p className="text-sm text-center break-all">{file.name}</p>
        )} */}
      </div>
    );
  }

  // Handle DOC/DOCX files
  if (fileKind === "doc" || fileKind === "docx") {
    if (isConverting) {
      return (
        <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p>Memuat dokumen...</p>
          </div>
        </div>
      );
    }

    if (conversionError) {
      return (
        <div className="w-full h-full flex items-center justify-center text-sm text-red-500">
          <div className="flex flex-col items-center gap-2">
            <LuFileWarning className="text-4xl" />
            <p>{conversionError}</p>
          </div>
        </div>
      );
    }

    if (docHtml) {
      return (
        <div className="w-full h-full flex flex-col gap-2">
          {/* <div className="flex items-center gap-2 pb-2 border-b">
            <LuFileText className="text-xl text-gray-500" />
            <p className="text-sm font-semibold">{file?.name}</p>
          </div> */}
          <div
            className="w-full h-full overflow-auto p-4 bg-white border border-gray-200 rounded-md"
            dangerouslySetInnerHTML={{ __html: docHtml }}
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          />
        </div>
      );
    }
  }

  return (
    <div className="w-full border h-full flex flex-col items-center justify-center gap-3 text-gray-700 p-2">
      {file?.name && (
        <div className="flex flex-row items-center gap-1">
          <LuFileText className="text-6xl text-gray-500" />
          <p className="text-sm text-center break-all">{file.name}</p>
        </div>
      )}
      <p className="text-xs text-gray-500 text-center">
        File {fileKind.toUpperCase()} ditampilkan di dalam komponen.
      </p>
    </div>
  );
}
