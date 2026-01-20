"use client";

import { useState } from "react";
import { SectionTitle } from "@/components/SectionTitle";

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
  RegistrationPathSectionProps
> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <section className="w-full h-fit px-4 sm:px-12 lg:px-56 space-y-12 ">
      <SectionTitle
        title="Jalur Pendaftaran"
        subtitle="Tersedia beberapa jalur pendaftaran yang dapat disesuaikan dengan prestasi dan kemampuan calon peserta didik."
        align="center"
      />

      <div className="w-full h-[80vh] rounded-2xl border border-gray-200 p-6 flex flex-col space-y-6 bg-white">
        {/* Tabs Navigation */}
        <div className="flex flex-col bg-gray-200 w-full rounded-full sm:flex-row justify-center">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full px-8 py-3 rounded-full ${index === 0 ? "rounded-l-full rounded-r-none" : "rounded-l-none rounded-r-full"} font-semibold transition-all duration-300 ${
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
              className={`w-full h-full flex ${activeTabData.id === "non-akademik" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Image Section */}
              <div className="w-1/2 h-full flex items-center justify-center">
                {activeTabData.image ? (
                  <div className="w-full h-full bg-gray-400 rounded-2xl">
                    <img
                      src={activeTabData.image}
                      alt={activeTabData.label}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-linear-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Foto pendaftaran</span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex w-1/2 h-full flex-col justify-center space-y-10 p-10">
                {activeTabData.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="text-3xl shrink-0">{item.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {item.grade}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
