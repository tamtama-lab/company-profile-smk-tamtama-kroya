"use client";

import { TextButton } from "@/components/Buttons/TextButton";
import { SectionCard } from "@/components/Card/SectionCard";
import Toggle from "@/components/ui/toggle";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  FormInputInlineRichText,
  FormInputRichText,
} from "@/components/ui/form-input-richtext";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { DocumentFormData } from "../types";
import { PiDotsSixVertical } from "react-icons/pi";

interface StudentInfoFieldItem {
  key: string;
  placeholder: string;
  label: string;
  source: string;
  enabled: boolean;
}

interface FirstTabProps {
  displayPreview: boolean;
  onTogglePreview: () => void;
  form: UseFormReturn<DocumentFormData>;
  onCancel: () => void;
  onSave: () => void;
  isLoading: boolean;
  isStudentInfoToggleLoading: boolean;
  previewUrl: string | null;
  isGeneratingPreview: boolean;
  studentInfoFields: StudentInfoFieldItem[];
  onToggleStudentInfoField: (fieldKey: string) => void;
  onReorderStudentInfoField: (draggedKey: string, targetKey: string) => void;
}

export default function FirstTab({
  displayPreview,
  onTogglePreview,
  form,
  onCancel,
  onSave,
  isLoading,
  isStudentInfoToggleLoading,
  previewUrl,
  isGeneratingPreview,
  studentInfoFields,
  onToggleStudentInfoField,
  onReorderStudentInfoField,
}: FirstTabProps) {
  const [draggedFieldKey, setDraggedFieldKey] = useState<string | null>(null);

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
                            <FormInputInlineRichText
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
                            <FormInputInlineRichText
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

                    <div className="w-full border border-gray-200 rounded-sm p-2 bg-gray-50">
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700">
                          Data Siswa
                        </p>
                      </div>

                      <div className="space-y-2">
                        {studentInfoFields.map((fieldItem) => (
                          <div
                            key={fieldItem.key}
                            draggable
                            onDragStart={() =>
                              setDraggedFieldKey(fieldItem.key)
                            }
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => {
                              if (!draggedFieldKey) return;
                              onReorderStudentInfoField(
                                draggedFieldKey,
                                fieldItem.key,
                              );
                              setDraggedFieldKey(null);
                            }}
                            onDragEnd={() => setDraggedFieldKey(null)}
                            className="flex items-center justify-between gap-3 rounded-sm border border-gray-200 bg-white px-2 py-2 cursor-move"
                          >
                            <Toggle
                              enabled={fieldItem.enabled}
                              disabled={isStudentInfoToggleLoading}
                              onChange={() =>
                                onToggleStudentInfoField(fieldItem.key)
                              }
                            />
                            <div className="min-w-0 flex-1">
                              {/* <p className="text-xs font-semibold text-gray-700 truncate">
                                {fieldItem.placeholder}
                              </p> */}
                              <p
                                className={`text-xs ${fieldItem.enabled ? "text-black" : "text-gray-500"} truncate`}
                              >
                                {fieldItem.label}
                              </p>
                              {/* <p className="text-[11px] text-gray-400 truncate">
                                {fieldItem.source}
                              </p> */}
                            </div>

                            <PiDotsSixVertical className="text-2xl text-gray-500 cursor-move" />
                          </div>
                        ))}
                      </div>
                    </div>
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
                            <FormInputInlineRichText
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
            <div className="w-1/2 self-start sticky top-24 border border-gray-300 shadow-sm rounded-md bg-white p-4">
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
