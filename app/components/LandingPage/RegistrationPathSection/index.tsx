"use client";

import { useState } from "react";
import { SectionTitle } from "@/components/SectionTitle";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";
import React from "react";
import Image from "next/image";

interface PathTabProps {
  id: string;
  label: string;
  image?: string;
  items: Array<{
    grade: string;
    description: string;
    icon: string;
  }>;
}

interface RegistrationPathSectionProps {
  tabs: PathTabProps[];
}

export const RegistrationPathSection: React.FC<
  RegistrationPathSectionProps & { id?: string }
> = ({ tabs, id }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <section
      id={id || "jalur-pendaftaran"}
      className="w-full h-fit px-4 sm:px-3 lg:px-24 xl:px-56 2xl:px-56 space-y-12 py-8 sm:py-10"
    >
      <SectionTitle
        title="Jalur Pendaftaran"
        subtitle="Tersedia beberapa jalur pendaftaran yang dapat disesuaikan dengan prestasi dan kemampuan calon peserta didik."
        align="center"
      />

      <ScrollAnimationWrapper
        direction="up"
        className="w-full h-auto lg:h-[80vh] rounded-2xl border border-gray-200 p-4 sm:p-6 flex flex-col space-y-6 bg-white"
      >
        {/* Tabs Navigation */}
        <div className="flex flex-row bg-gray-200 w-full rounded-full justify-center gap-1 sm:gap-0">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full px-4 sm:px-8 py-2 sm:py-3 rounded-full ${index === 0 ? "rounded-l-full rounded-r-none " : "rounded-l-none rounded-r-full"} font-semibold transition-all duration-300 text-sm sm:text-base ${
                activeTab === tab.id
                  ? "bg-[#1B5E20] text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTabData && (
          <div className="w-full h-full overflow-hidden">
            <div
              className={`w-full h-full flex flex-row gap-6 max-sm:gap-2 lg:gap-0 ${activeTabData.id === "non-akademik" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Image Section */}
              <div className="w-full lg:w-1/2 h-fit max-sm:h-fit lg:h-full flex items-center justify-center">
                {activeTabData.image ? (
                  <ScrollAnimationWrapper className="w-full aspect-h-3 aspect-w-4 bg-gray-300 rounded-2xl max-sm:rounded-lg overflow-hidden">
                    <Image
                      src={activeTabData.image}
                      alt={activeTabData.label}
                      width={500}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  </ScrollAnimationWrapper>
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm sm:text-base">
                      Foto pendaftaran
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex w-full lg:w-1/2 h-auto lg:h-full flex-col items-center justify-center sm:p-3 lg:p-10">
                <div className="w-full h-fit space-y-8 max-sm:space-y-8 max-lg:space-y-5">
                  {activeTabData.items.map((item, index) => (
                    <ScrollAnimationWrapper
                      key={index}
                      className="flex items-start gap-3 sm:gap-1"
                    >
                      <div className="text-2xl max-sm:text-xl shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-base max-sm:text-xs">
                          {item.grade}
                        </h4>
                        <p className="text-gray-600 text-sm max-sm:text-xs mt-1 wrap-break-word">
                          {item.description}
                        </p>
                      </div>
                    </ScrollAnimationWrapper>
                  ))}
                </div>
                <span
                  className={`w-full mt-4 sm:mt-6 flex justify-end ${activeTabData.id === "non-akademik" ? "block" : "hidden"} text-red-500 text-xs max-sm:text-[10px]`}
                >
                  *Syarat dan Ketentuan Berlaku
                </span>
              </div>
            </div>
          </div>
        )}
      </ScrollAnimationWrapper>
    </section>
  );
};

export const DateInput: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isMandatory?: boolean;
}> = ({ label, name, value, onChange, placeholder, isMandatory }) => {
  const inputId = `${name}-datepicker`;

  return (
    <>
      <div className="mb-4 max-sm:mb-1">
        <label className="block text-sm max-sm:text-xs font-semibold text-gray-700 mb-2">
          {label} {isMandatory && <span className="text-red-500">*</span>}
        </label>
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-body"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"
              />
            </svg>
          </div>
          <input
            id={inputId}
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder || "Select date"}
            data-datepicker
            data-datepicker-autohide
            required={isMandatory}
            className="block w-full ps-9 pe-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
          />
        </div>
      </div>
    </>
  );
};
