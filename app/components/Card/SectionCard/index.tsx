import { TextButton } from "@/components/Buttons/TextButton";
import { useRef, useEffect, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastHeight, setLastHeight] = useState(120); // default height

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      setLastHeight(containerRef.current.offsetHeight);
    }
  }, [isLoading, children]);

  const rowHeight = 20; // estimated height per row
  const numRows = Math.ceil(lastHeight / rowHeight);

  const skeletonRows = Array.from({ length: numRows }, (_, i) => (
    <div
      key={i}
      className="w-full h-12 animate-pulse bg-gray-300 rounded-md"
    ></div>
  ));
  return (
    <div className={`${className} shadow-lg rounded-md`}>
      {title && (
        <div className="w-full h-fit border-b border-b-gray-400 px-4">
          <h3 className="font-semibold text-gray-800 py-3">{title}</h3>
        </div>
      )}
      <div className="w-full h-fit">
        {isLoading ? (
          <div className="p-2 space-y-4">{skeletonRows}</div>
        ) : (
          <div ref={containerRef}>{children}</div>
        )}
      </div>
      <div className="p-4 h-fit border-t border-gray-300 flex justify-end items-center gap-6">
        {isCancelButton ? (
          <TextButton
            isLoading={isLoading}
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
