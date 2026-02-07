"use client";

import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";
import { SectionTitle } from "@/components/SectionTitle";
import { FaCheck } from "react-icons/fa6";
import { MdLockOpen, MdLockOutline } from "react-icons/md";

interface Requirement {
  id: number;
  text: string;
}

export interface BatchData {
  id: number;
  name: string;
  dateStart?: string;
  dateEnd?: string;
  isActive: boolean;
  icon: string;
}

interface RegistrationRequirementsSectionProps {
  id?: string;
  requirements: Requirement[];
  batches: BatchData[];
}

export const PathCard = ({
  name,
  description,
  isActive,
}: {
  name: string;
  description: string;
  isActive: boolean;
}) => {
  return (
    <div className="flex flex-col justify-between p-2 border border-gray-300 min-h-28 h-fit rounded-lg">
      <p className="text-lg max-sm:text-sm font-bold text-primary">{name}</p>
      <p className="text-base max-sm:text-xs">{description}</p>
      {!isActive ? (
        <div className="w-full h-fit flex justify-between items-center">
          <p className="text-sm max-sm:text-xs">
            Status : <span className="text-red-500 font-semibold">TUTUP</span>
          </p>
          <div className="w-8 h-8 flex justify-center items-center rounded-md bg-gray-100">
            <MdLockOutline size={20} color="red" />
          </div>
        </div>
      ) : (
        <div className="w-full h-fit flex justify-between items-center">
          <p className="text-sm max-sm:text-xs">
            Status : <span className="text-primary font-semibold">BUKA</span>
          </p>
          <div className="w-8 h-8 flex justify-center items-center rounded-md bg-gray-100">
            <MdLockOpen size={20} color="#014921" />
          </div>
        </div>
      )}
    </div>
  );
};

export const RegistrationRequirementsSection: React.FC<
  RegistrationRequirementsSectionProps
> = ({ requirements, batches, id }) => {
  return (
    <section
      id={id || "syarat-periode-daftar"}
      className="w-full h-fit px-6 sm:px-8 md:px-16 lg:px-10 xl:px-56 py-10"
    >
      <SectionTitle
        title="Syarat & Periode Pendaftaran"
        subtitle="Perhatikan ketentuan menerima pendaftaran dan mendaftar sesuai jadwal yang telah ditentukan."
        align="center"
      />

      {/* Tabs Container */}
      <div className="h-140 max-lg:h-fit border border-gray-300 rounded-md grid grid-cols-2 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-1">
        {/* Persyaratan Tab */}
        <div className="w-full h-full bg-white rounded-lg lg:rounded-r-none overflow-hidden pb-12">
          <div className="bg-[#1B5E20] px-6 py-6 max-sm:py-3 max-sm:px-3">
            <h3 className="text-xl max-sm:text-lg font-bold text-white text-center">
              Syarat Pendaftaran
            </h3>
          </div>
          <div className="w-full h-full flex flex-col justify-center items-start p-10 max-sm:p-7 border-gray-200">
            {requirements.map((requirement) => (
              <ScrollAnimationWrapper
                key={requirement.id}
                className="flex h-full items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <FaCheck className="text-green-600 text-base max-sm:text-sm" />
                </div>
                <p className="text-gray-700 leading-relaxed max-sm:text-xs">
                  {requirement.text}
                </p>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>

        {/* Periode Pendaftaran Tab */}
        <div className="w-full h-full max-lg:h-fit bg-white rounded-lg lg:rounded-l-none overflow-hidden">
          <div className="bg-[#1B5E20] px-6 py-6 max-sm:py-3 max-sm:px-3">
            <h3 className="text-xl max-sm:text-lg font-bold text-white text-center">
              Periode Pendaftaran
            </h3>
          </div>
          <div className="w-full h-full flex flex-col justify-center items-start border p-10 max-sm:border max-sm:p-4 border-gray-200">
            <div className="w-full h-full flex flex-row justify-between">
              <div className="w-[43%] max-sm:w-[9/10] h-100 flex flex-col justify-between">
                <ScrollAnimationWrapper>
                  <PathCard
                    name={batches[0].name}
                    description={
                      batches[0].dateStart + " - " + batches[0].dateEnd
                    }
                    isActive={batches[0].isActive}
                  />
                </ScrollAnimationWrapper>
                <ScrollAnimationWrapper>
                  <PathCard
                    name={batches[2].name}
                    description={
                      batches[2].dateStart + " - " + batches[2].dateEnd
                    }
                    isActive={batches[2].isActive}
                  />
                </ScrollAnimationWrapper>
              </div>
              <div className="w-1/10 h-100 relative">
                <div className="absolute w-full h-full flex items-center justify-around flex-col space-y-6 z-10">
                  <div className="w-10 h-10 max-sm:w-8 max-sm:h-8 max-sm:text-sm text-white rounded-full flex justify-center items-center text-xl font-bold bg-primary">
                    01
                  </div>
                  <div className="w-10 h-10 max-sm:w-8 max-sm:h-8 max-sm:text-sm text-white rounded-full flex justify-center items-center text-xl font-bold bg-secondary">
                    02
                  </div>
                  <div className="w-10 h-10 max-sm:w-8 max-sm:h-8 max-sm:text-sm text-white rounded-full flex justify-center items-center text-xl font-bold bg-[#BFEC43]">
                    03
                  </div>
                </div>
                <div className="w-0.5 h-full absolute top-0 inset-1/2 bg-gray-200"></div>
              </div>
              <div className="w-[43%] max-sm:w-[9/10] h-100 flex flex-col justify-center">
                <ScrollAnimationWrapper>
                  <PathCard
                    name={batches[1].name}
                    description={
                      batches[1].dateStart + " - " + batches[1].dateEnd
                    }
                    isActive={batches[1].isActive}
                  />
                </ScrollAnimationWrapper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
