"use client";

import { SectionTitle } from "@/components/SectionTitle";
import { FaCheck } from "react-icons/fa6";
import { MdLockOpen, MdLockOutline } from "react-icons/md";

interface Requirement {
  id: number;
  text: string;
}

interface RegistrationPeriod {
  id: number;
  period: string;
  startMonth: string;
  endMonth: string;
  status: string;
  icon: string;
}

interface RegistrationRequirementsSectionProps {
  requirements: Requirement[];
  periods: RegistrationPeriod[];
}

export const PathCard = ({
  grade,
  description,
  isLocked,
}: {
  grade: string;
  description: string;
  isLocked: boolean;
}) => {
  return (
    <div className="flex flex-col justify-between p-2 border border-gray-300 min-h-28 h-fit rounded-lg">
      <p className="text-lg font-bold text-primary">{grade}</p>
      <p>{description}</p>
      {isLocked ? (
        <div className="w-full h-fit flex justify-between items-center">
          <p className="text-sm">
            Status : <span className="text-red-500 font-semibold">TUTUP</span>
          </p>
          <div className="w-8 h-8 flex justify-center items-center rounded-md bg-gray-100">
            <MdLockOutline size={20} color="red" />
          </div>
        </div>
      ) : (
        <div className="w-full h-fit flex justify-between items-center">
          <p className="text-sm">
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
> = ({ requirements }) => {
  return (
    <section
      id="syarat-periode-daftar"
      className="w-full h-fit px-4 sm:px-12 lg:px-56 py-10"
    >
      <SectionTitle
        title="Syarat & Periode Pendaftaran"
        subtitle="Perhatikan ketentuan menerima pendaftaran dan mendaftar sesuai jadwal yang telah ditentukan."
        align="center"
      />

      {/* Tabs Container */}
      <div className=" h-140 border border-gray-300 rounded-md grid grid-cols-1 lg:grid-cols-2">
        {/* Persyaratan Tab */}
        <div className="w-full h-full bg-white rounded-lg rounded-r-none overflow-hidden pb-12">
          <div className="bg-[#1B5E20] px-6 py-6">
            <h3 className="text-xl font-bold text-white text-center">
              Syarat Pendaftaran
            </h3>
          </div>
          <div className="w-full h-full flex flex-col justify-center items-start p-10 border-gray-200">
            {requirements.map((requirement) => (
              <div
                key={requirement.id}
                className="flex h-full items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                  <FaCheck className="text-green-600" size={20} />
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {requirement.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Periode Pendaftaran Tab */}
        <div className="w-full h-full bg-white rounded-lg rounded-l-none overflow-hidden">
          <div className="bg-[#1B5E20] px-6 py-6">
            <h3 className="text-xl font-bold text-white text-center">
              Periode Pendaftaran
            </h3>
          </div>
          <div className="w-full h-full flex flex-col justify-center items-start border p-10 border-gray-200">
            <div className="w-full h-full flex flex-row justify-between">
              <div className="w-[43%] h-100 flex flex-col justify-between">
                <PathCard
                  grade={"Gelombang 1"}
                  description={"November - Februari"}
                  isLocked={false}
                />
                <PathCard
                  grade={"Gelombang 3"}
                  description={"Juni - Juli"}
                  isLocked={false}
                />
              </div>
              <div className="w-1/10 h-100 relative">
                <div className="absolute w-full h-full flex items-center justify-around flex-col space-y-6 z-10">
                  <div className="w-10 h-10 text-white rounded-full flex justify-center items-center text-xl font-bold text-primary">
                    01
                  </div>
                  <div className="w-10 h-10 text-white rounded-full flex justify-center items-center text-xl font-bold bg-[#56B680]">
                    02
                  </div>
                  <div className="w-10 h-10 text-white rounded-full flex justify-center items-center text-xl font-bold bg-[#BFEC43]">
                    03
                  </div>
                </div>
                <div className="w-0.5 h-full absolute top-0 inset-1/2 bg-gray-200"></div>
              </div>
              <div className="w-[43%] h-100 flex flex-col justify-center">
                <PathCard
                  grade={"Gelombang 2"}
                  description={"Maret - Mei"}
                  isLocked={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
