import { SectionTitle } from "@/components/SectionTitle";
import VacationCard from "@/components/Card/VacationCard";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";
import { getMajorMetadata } from "../../../utils/majorMetadata";

export type MajorData = {
  name: string; // full name
  abbreviation: string;
  capacity: number;
  registrationCount: number;
};

export const VacationTotal: React.FC<{
  id?: string;
  data?: MajorData[];
  loading?: boolean;
}> = ({ id, data = [], loading = false }) => {
  const wrapperClass = loading ? "opacity-60" : "";

  // Determine the maximum registration count to identify the most popular major(s)
  const maxRegistration = (data || []).length
    ? Math.max(...(data || []).map((x) => x.registrationCount ?? 0))
    : 0;

  const vacationList = (data || []).map((d) => {
    const majorMeta = getMajorMetadata(
      {
        name: d.name,
        abbreviation: d.abbreviation,
      },
      0,
    );
    const abbr = d.abbreviation?.trim() || majorMeta.code;
    const registration = d.registrationCount ?? 0;
    const capacity = d.capacity ?? 0;
    const percentage =
      capacity > 0
        ? Math.round((registration / capacity) * 100 * 100) / 100
        : 0;

    return {
      name: abbr,
      description: d.name?.trim() || majorMeta.name,
      color: majorMeta.color,
      total: registration,
      quota: capacity,
      precentage: percentage,
      isPopular: registration > 0 && registration === maxRegistration,
      icon: <majorMeta.Icon color={majorMeta.color} size={40} />,
    };
  });

  // If no data provided, show defaults (keeps previous behaviour)
  const listToRender = vacationList.length
    ? vacationList
    : ["TKR", "DKV", "TP", "TITL"].map((majorCode) => {
        const majorMeta = getMajorMetadata(majorCode);

        return {
          name: majorCode,
          description: majorMeta.name,
          color: majorMeta.color,
          total: 0,
          quota: 0,
          precentage: 0,
          icon: <majorMeta.Icon color={majorMeta.color} size={40} />,
        };
      });
  return (
    <section
      id={id || "jumlah-peminat"}
      className={`w-full mb-12 px-4 md:px-12 sm:px-6 lg:px-24 xl:px-56 py-8 sm:py-10 h-fit space-y-12 ${wrapperClass}`}
    >
      <SectionTitle
        title="Statistik Pendaftar per Jurusan"
        subtitle="Daftar pendaftar diperbarui secara berkala selama masa SPMB  berlangsung"
        align="center"
      />
      <div className="w-full grid grid-cols-1 max-sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10 xl:gap-x-12">
        {listToRender.map((item, index) => (
          <ScrollAnimationWrapper
            key={index}
            direction="up"
            delay={index * 0.1}
            className="w-full"
          >
            <VacationCard item={item} index={index} />
          </ScrollAnimationWrapper>
        ))}
      </div>
    </section>
  );
};
