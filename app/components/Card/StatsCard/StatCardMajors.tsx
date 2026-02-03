import { IconType } from "react-icons";
import { BsLightningCharge } from "react-icons/bs";
import { FaGear } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
import { LiaCarSideSolid } from "react-icons/lia";
import { MdOutlineColorLens } from "react-icons/md";

export interface StatsCardMajorData {
  title: string;
  amount: number;
  isFirstUnique?: boolean;
  isLoading?: boolean;
}

export default function StatsMajorCard({
  data,
  isLoading,
}: {
  data: StatsCardMajorData[];
  isLoading: boolean;
}) {
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const getCardStyle = (title: string): { color: string; Icon?: IconType } => {
    switch (title) {
      case "Jurusan TKR":
        return { color: "#FF0000", Icon: LiaCarSideSolid };
      case "Jurusan DKV":
        return { color: "#2369D1", Icon: MdOutlineColorLens };
      case "Jurusan TITL":
        return { color: "#4D4FA4", Icon: BsLightningCharge };
      case "Jurusan TP":
        return { color: "#5DB1F6", Icon: FaGear };
      default:
        return { color: "bg-white text-primary", Icon: FiUsers };
    }
  };

  return (
    <div
      className={`w-full grid grid-cols-5 max-md:grid-cols-2 max-sm:grid-cols-2 gap-3 mb-4`}
    >
      {data.map((item, idx) => {
        const { color, Icon } = getCardStyle(item.title);
        const isFirst = idx === 0;
        const textColor = isFirst ? "white" : color;
        return (
          <div
            key={item.title}
            style={{
              backgroundColor: `rgba(${hexToRgb(color)}, 0.05)`,
              border: `2px solid ${color}`,
            }}
            className={`w-full  ${idx === 0 ? "bg-white text-primary max-md:col-span-2 max-sm:col-span-2 shadow-sm" : ""} flex flex-col justify-between  p-6 rounded-md h-42`}
          >
            <div
              className="w-full font-semibold text-left"
              style={idx === 0 ? {} : { color: textColor }}
            >
              {item.title}
            </div>
            <div className="w-full flex justify-between items-center">
              <div
                className={`p-2 rounded-md ${item.isFirstUnique && idx === 0 ? "bg-primary border text-white" : "shadow-sm"} `}
                // style={
                //   item.isFirstUnique && idx === 0
                //     ? {}
                //     : { borderColor: color + "0.3" }
                // }
              >
                {Icon ? (
                  <Icon
                    style={{ color: textColor }}
                    className="text-4xl max-sm:text-3xl max-md:text-3xl"
                  />
                ) : null}
              </div>
              <div
                className="text-3xl font-bold"
                style={idx === 0 ? {} : { color: textColor }}
              >
                {isLoading ? (
                  <div className="h-8 w-8 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  item.amount
                )}{" "}
                <span className="text-xs font-semibold">Anak</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
