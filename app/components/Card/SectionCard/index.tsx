import { TextButton } from "@/components/Buttons/TextButton";

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  leftButton?: React.ReactNode;
  saveButtonText?: string;
  saveButtonIcon?: React.ReactNode;
  saveButtonDisabled?: boolean;
  isCancelButton?: boolean;
  handleSaveChanges?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const SectionCard = ({
  title = "",
  children,
  leftButton,
  saveButtonText = "Simpan Perubahan",
  saveButtonIcon = null,
  saveButtonDisabled = false,
  isCancelButton = false,
  handleSaveChanges,
  isLoading = false,
  className = "w-1/2",
}: SectionCardProps) => {
  return (
    <div className={`${className} shadow-lg rounded-md`}>
      {title && (
        <div className="w-full h-fit border-b border-b-gray-400 px-4">
          <h3 className="font-semibold text-gray-800 py-3">{title}</h3>
        </div>
      )}
      <div className="w-full h-fit">
        {isLoading ? (
          <div className="p-2 space-y-4">
            <div className="w-full h-12 animate-pulse bg-gray-300 rounded-md"></div>
            <div className="w-full h-12 animate-pulse bg-gray-300 rounded-md"></div>
            <div className="w-full h-12 animate-pulse bg-gray-300 rounded-md"></div>
            <div className="w-full h-12 animate-pulse bg-gray-300 rounded-md"></div>
          </div>
        ) : (
          children
        )}
      </div>
      <div className="p-4 h-fit border-t border-gray-300 flex justify-end items-center gap-6">
        {isCancelButton ? (
          <TextButton
            variant="primary"
            text="Simpan Perubahan"
            onClick={handleSaveChanges}
          />
        ) : (
          leftButton
        )}

        <TextButton
          isLoading={isLoading}
          disabled={saveButtonDisabled}
          variant="primary"
          icon={saveButtonIcon}
          text={saveButtonText}
          onClick={handleSaveChanges}
        />
      </div>
    </div>
  );
};
