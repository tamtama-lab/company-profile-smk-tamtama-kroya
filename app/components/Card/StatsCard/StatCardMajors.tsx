import { IconType } from "react-icons";
import { BsLightningCharge } from "react-icons/bs";
import { FaGear } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
import { LiaCarSideSolid } from "react-icons/lia";
import { MdOutlineColorLens } from "react-icons/md";
import { getMajorColor } from "@/utils/majorColors";

export type MajorData = {
  major: string;
  count: number;
  isFirstUnique?: boolean;
  isLoading?: boolean;
};

export default function StatsMajorCard({
  data,
  isLoading,
}: {
  data: MajorData[];
  isLoading: boolean;
}) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const dataWithTotal = [
    { major: "Total Pendaftar", count: totalCount, isFirstUnique: true },
    ...data,
  ];

  const hexToRgb = (hex: string) => {
    const normalizedHex = hex.replace("#", "").trim();
    if (!/^[0-9a-fA-F]{6}$/.test(normalizedHex)) {
      return "59, 130, 246";
    }

    const r = parseInt(normalizedHex.slice(0, 2), 16);
    const g = parseInt(normalizedHex.slice(2, 4), 16);
    const b = parseInt(normalizedHex.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };

  const getCardStyle = (
    major: string,
    index: number,
  ): { color: string; Icon?: IconType } => {
    switch (major) {
      case "TKR":
        return { color: getMajorColor(major, index), Icon: LiaCarSideSolid };
      case "DKV":
        return { color: getMajorColor(major, index), Icon: MdOutlineColorLens };
      case "TITL":
        return { color: getMajorColor(major, index), Icon: BsLightningCharge };
      case "TP":
        return { color: getMajorColor(major, index), Icon: FaGear };
      default:
        return { color: getMajorColor(major, index), Icon: FiUsers };
    }
  };

  return (
    <div
      className={`w-full grid grid-cols-5 max-md:grid-cols-2 max-sm:grid-cols-2 gap-3 mb-4`}
    >
      {dataWithTotal.map((item, idx) => {
        const { color, Icon } = getCardStyle(item.major, idx);
        const isFirst = idx === 0;
        const textColor = isFirst ? "white" : color;
        return (
          <div
            key={item.major}
            style={
              isFirst
                ? undefined
                : {
                    backgroundColor: `rgba(${hexToRgb(color)}, 0.05)`,
                    border: `2px solid ${color}`,
                  }
            }
            className={`w-full  ${idx === 0 ? "bg-white text-primary max-md:col-span-2 max-sm:col-span-2 shadow-sm" : ""} flex flex-col justify-between  p-6 rounded-md h-42`}
          >
            <div
              className="w-full font-semibold text-left"
              style={idx === 0 ? {} : { color: textColor }}
            >
              {item.major}
            </div>
            <div className="w-full h-fit flex flex-row justify-between">
              <div
                className={`p-2 rounded-md ${item.isFirstUnique && idx === 0 ? "bg-primary border text-white" : "shadow-sm"} `}
              >
                {Icon ? (
                  <Icon
                    style={{ color: textColor }}
                    className="text-4xl max-sm:text-3xl max-md:text-3xl"
                  />
                ) : null}
              </div>
              <div
                className="text-3xl font-bold flex flex-row items-end justify-end gap-2"
                style={idx === 0 ? {} : { color: textColor }}
              >
                {isLoading ? (
                  <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
                ) : (
                  item.count
                )}
                <span className="text-xs font-semibold mb-1">Anak</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
