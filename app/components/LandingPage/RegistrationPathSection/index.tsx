"use client";

import { useState } from "react";
import { SectionTitle } from "@/components/SectionTitle";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";

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
      className="w-full h-fit px-4 sm:px-8 lg:px-24 xl:px-56 2xl:px-56 space-y-12 py-8 sm:py-10"
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
              className={`w-full h-full flex flex-row gap-6 max-sm:gap-2 lg:gap-0 ${activeTabData.id === "non-akademik" ? "lg:flex-row-reverse" : "lg:flex-row"}`}
            >
              {/* Image Section */}
              <div className="w-full lg:w-1/2 h-full max-sm:h-64 lg:h-full flex items-center justify-center">
                {activeTabData.image ? (
                  <ScrollAnimationWrapper className="w-full h-full bg-gray-300 rounded-2xl overflow-hidden">
                    <></>
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
              <div className="flex w-full lg:w-1/2 h-auto lg:h-full flex-col items-center justify-center sm:p-6 lg:p-10">
                <div className="w-full h-fit space-y-8 max-sm:space-y-8 max-lg:space-y-5">
                  {activeTabData.items.map((item, index) => (
                    <ScrollAnimationWrapper
                      key={index}
                      className="flex items-start gap-3 sm:gap-4"
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
