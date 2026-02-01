export interface StatsCardData {
  title: string;
  icon: React.ElementType;
  amount: number;
  isFirstUnique?: boolean;
  isLoading?: boolean;
}

export default function StatsCard({
  data,
  isLoading,
}: {
  data: StatsCardData[];
  isLoading: boolean;
}) {
  return (
    <div className="w-full grid grid-cols-4 max-sm:grid-cols-1 gap-3 mb-4">
      {data.map((item, idx) => (
        <div
          key={item.title}
          className={`w-full ${item.isFirstUnique && idx === 0 ? "bg-primary text-white" : "text-primary bg-white"} flex flex-col justify-between shadow-sm p-6 rounded-md h-42`}
        >
          <div className="w-full font-semibold text-left">{item.title}</div>
          <div className="w-full flex justify-between items-center">
            <div>
              <item.icon className="text-5xl" />
            </div>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <div className="h-8 w-8 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                item.amount
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
