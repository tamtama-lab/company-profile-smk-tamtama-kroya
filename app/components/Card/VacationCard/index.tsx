import { BsFire } from "react-icons/bs";

interface VacationItem {
  color: string;
  isPopular?: boolean;
  icon: React.ReactNode;
  name: string;
  description: string;
  total: number;
  precentage: number;
  quota: number;
}

export default function VacationCard({
  item,
  index,
}: {
  item: VacationItem;
  index: number;
}) {
  return (
    <div
      key={index}
      className={`relative w-full border border-gray-300 border-l-10 h-60 rounded-xl p-10 flex flex-col justify-between transition-all duration-300 ease-in-out`}
      style={{ borderLeftColor: item.color }}
    >
      {item.isPopular && (
        <div className="absolute right-6 top-4 bg-red-200 rounded flex flex-row space-x-2 py-0.5 px-1 items-center">
          <BsFire color="red" />
          <p className="text-xs">Ramai Peminat</p>
        </div>
      )}
      <div className="flex flex-row justify-start items-center space-x-6">
        <div
          className="w-20 h-20 rounded-md flex justify-center items-center"
          style={{
            backgroundColor: item.color + "20",
          }}
        >
          <div className="text-4xl text-gray-700">{item.icon}</div>
        </div>
        <div className="flex flex-col">
          <h3
            className={`font-semibold text-2xl`}
            style={{ color: item.color }}
          >
            {item.name}
          </h3>
          <p className="text-lg">{item.description}</p>
        </div>
      </div>
      <div className="w-full mt-4 space-y-3 border-t-2 border-gray-300">
        <div className="flex flex-row space-x-3 justify-start items-center mt-2">
          <div className="flex flex-row space-x-3 justify-start items-center border-r-2 pr-3 border-gray-300">
            <h3
              className="font-bold text-xl rounded-sm"
              style={{ color: item.color }}
            >
              {item.total}
            </h3>
            <h3>Total Pendaftar</h3>
          </div>
          <div className="flex flex-row space-x-3 justify-start items-center ">
            <h3>Kuota:</h3>
            <h3 className="font-semibold text-lg rounded-sm text-[#FF8E8E]">
              {item.quota} Siswa
            </h3>
          </div>
        </div>
        <div className="relative w-full h-6 bg-gray-200 rounded-sm overflow-hidden">
          <div
            className="absolute inset-0 rounded-sm"
            style={{
              backgroundColor: item.color,
              opacity: 0.2,
            }}
          />
          <div
            className="relative h-full rounded-sm transition-all duration-300 flex items-center justify-end px-3"
            style={{
              backgroundColor: item.color,
              width: `${item.precentage}%`,
            }}
          >
            <span className="text-xs font-semibold text-white z-10">
              {item.precentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
