"use client";

import React from "react";

interface TabsStepProps {
  tabs: string[];
  activeTab: string;
  tabsContent?: React.ReactNode;
  onTabChange: (tab: string) => void;
}

export const TabsStep: React.FC<TabsStepProps> = ({
  tabs,
  activeTab,
  tabsContent,
  onTabChange,
}) => {
  return (
    <div className="w-full relative min-h-fit h-20 mt-10 flex flex-col border border-transparent">
      <div className="w-full relative h-fit">
        <div className="absolute w-full h-full flex items-center justify-between flex-row space-x-6 z-10 px-20">
          {tabs.map((step, index) => (
            <div
              key={index}
              className="relative w-fit h-fit flex flex-col justify-center items-center"
            >
              <button
                onClick={() => onTabChange(step)}
                className={`w-10 h-10 rounded-full flex justify-center items-center text-xl font-bold bg-primary ${
                  activeTab === step
                    ? "bg-primary text-white"
                    : "bg-white text-gray-400 border border-gray-300"
                }`}
              >
                0{index + 1}
              </button>
              <span
                className={`absolute w-fit min-w-48 text-center top-12 uppercase ${
                  activeTab === step ? "text-primary" : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute w-full h-full flex items-center justify-between flex-row z-10">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <div className="w-2 h-2 bg-primary rounded-full"></div>
        </div>
        <div className="w-full h-0.5 absolute bg-gray-200"></div>
      </div>
      {activeTab && (
        <div className="w-full mt-20 min-h-125 flex flex-col justify-start p-10 items-center rounded-3xl border bg-white border-gray-300">
          {/* header */}
          <div className="w-full flex flex-row justify-between items-center border-b border-gray-300 pb-2 mb-10">
            <h1 className="text-2xl text-primary font-semibold">{activeTab}</h1>
            <p className="text-primary text-sm font-semibold">
              Langkah {tabs.indexOf(activeTab) + 1}/{tabs.length}
            </p>
          </div>
          {/* header */}
          {tabsContent}
        </div>
      )}
    </div>
  );
};
