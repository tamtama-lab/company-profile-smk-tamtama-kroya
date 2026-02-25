import { TextButton } from "@/components/Buttons/TextButton";
import { SectionCard } from "@/components/Card/SectionCard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FormInput, FormInputRichText } from "@/components/ui/form-input";
import type { UseFormReturn } from "react-hook-form";
import type { DocumentFormData } from "../types";

interface FirstTabProps {
  displayPreview: boolean;
  onTogglePreview: () => void;
  form: UseFormReturn<DocumentFormData>;
  onCancel: () => void;
  onSave: () => void;
  isLoading: boolean;
  previewUrl: string | null;
  isGeneratingPreview: boolean;
}

export default function FirstTab({
  displayPreview,
  onTogglePreview,
  form,
  onCancel,
  onSave,
  isLoading,
  previewUrl,
  isGeneratingPreview,
}: FirstTabProps) {
  return (
    <div className="w-full gap-x-3 h-fit flex flex-row">
      <SectionCard
        title="Edit Pengumuman PDF Rangkap Ke 2"
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
        <div className="w-full min-h-screen h-fit flex flex-row my-4 gap-4">
          <div className={`${displayPreview ? "w-1/2" : "w-full"} h-full`}>
            <SectionCard
              className="w-full h-full p-2"
              leftButton={
                <TextButton
                  variant="outline"
                  text="Batalkan"
                  onClick={onCancel}
                />
              }
              handleSaveChanges={onSave}
              isLoading={isLoading}
            >
              <Form {...form}>
                <form onSubmit={onSave} className="w-full p-6">
                  <div className="grid grid-cols-1 gap-x-5 gap-y-5">
                    <FormField
                      control={form.control}
                      name="letterTittle"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FormInputRichText
                              {...field}
                              label="Judul Surat"
                              placeholder="Masukkan Judul Surat"
                              className="w-full"
                              isMandatory
                              error={
                                form.formState.errors.letterTittle?.message
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="letterNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FormInput
                              {...field}
                              label="Nomor Surat"
                              placeholder="Masukkan Nomor Surat"
                              className="w-full"
                              isMandatory
                              error={
                                form.formState.errors.letterNumber?.message
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="letterOpening"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FormInput
                              {...field}
                              label="Kalimat Pembuka"
                              placeholder="Masukkan Kalimat Pembuka"
                              className="w-full"
                              isMandatory
                              error={
                                form.formState.errors.letterOpening?.message
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="letterContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FormInputRichText
                              {...field}
                              label="Isi Surat"
                              placeholder="Masukkan Isi Surat"
                              className="w-full"
                              isMandatory
                              error={
                                form.formState.errors.letterContent?.message
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="letterClosing"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FormInput
                              {...field}
                              label="Kalimat Penutup"
                              placeholder="Masukkan Kalimat Penutup"
                              className="w-full"
                              isMandatory
                              error={
                                form.formState.errors.letterClosing?.message
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </SectionCard>
          </div>
          {displayPreview && (
            <div className="w-1/2 h-full border border-gray-300 shadow-sm rounded-md bg-white p-4">
              {previewUrl ? (
                <iframe
                  src={previewUrl + "#zoom=page-fit&view=FitH"}
                  title="Preview PDF Rangkap Ke 2"
                  className="w-full h-[80vh] rounded-md border border-gray-200"
                />
              ) : (
                <div className="w-full h-[80vh] flex items-center justify-center text-sm text-gray-500">
                  Sedang menyiapkan preview PDF...
                </div>
              )}

              {isGeneratingPreview && (
                <p className="mt-2 text-xs text-gray-500">
                  Memperbarui preview...
                </p>
              )}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
