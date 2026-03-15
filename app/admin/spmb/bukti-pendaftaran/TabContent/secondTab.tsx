import { TextButton } from "@/components/Buttons/TextButton";
import { SectionCard } from "@/components/Card/SectionCard";
import DragDropFile from "@/components/Upload/DragDropFile";
import FileUploadPreview from "@/components/Upload/FileUploadPreview";

interface SecondTabProps {
  displayPreview: boolean;
  onTogglePreview: () => void;
  draftFile: File | null;
  draftPreviewUrl: string | null;
  existingPreviewUrl?: string | null;
  onFile: (file: File | null) => void;
  onRemove: () => void;
  onValidate: (file: File) => string | null;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export default function SecondTab({
  displayPreview,
  onTogglePreview,
  draftFile,
  draftPreviewUrl,
  existingPreviewUrl,
  onFile,
  onRemove,
  onValidate,
  onSave,
  onCancel,
  isSaving = false,
}: SecondTabProps) {
  const previewSource = draftPreviewUrl ?? existingPreviewUrl ?? null;

  return (
    <div className="w-full gap-x-3 h-fit flex flex-row">
      <SectionCard
        title="Edit Pengumuman PDF Rangkap Ke 3"
        className="w-full h-full px-2"
        headerButton={
          <TextButton
            variant="outline"
            className="text-sm! py-2!"
            text={displayPreview ? "Sembunyikan Preview" : "Tampilkan Preview"}
            onClick={onTogglePreview}
          />
        }
        cardFooter={false}
      >
        <div className="w-full max-h-screen h-[80vh] flex flex-row my-4 gap-4">
          <div className={`${displayPreview ? "w-1/2" : "w-full"} h-full`}>
            <SectionCard
              className="w-full h-full p-2"
              title="Dokumen Rangkap ke 3"
              leftButton={
                <TextButton
                  variant="outline"
                  text="Batalkan"
                  onClick={onCancel}
                />
              }
              handleSaveChanges={onSave}
              isLoading={isSaving}
            >
              <div className="w-full h-[60vh] p-4">
                <DragDropFile
                  className="h-full"
                  accept="image/png,image/jpg,image/jpeg,application/pdf"
                  textButton="Cari Dokumen"
                  initialFile={draftFile}
                  onFile={onFile}
                  onRemove={onRemove}
                  onValidate={onValidate}
                />
              </div>
            </SectionCard>
          </div>
          {displayPreview && (
            <div className="w-1/2 h-full border border-gray-300 shadow-sm rounded-md bg-white p-4">
              <FileUploadPreview
                file={draftFile}
                previewUrl={previewSource}
                emptyText="Belum ada dokumen untuk dipreview"
              />
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
