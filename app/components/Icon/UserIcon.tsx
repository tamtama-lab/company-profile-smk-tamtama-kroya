import Image from "next/image";
import { LuUser } from "react-icons/lu";

export type UserIconProps = {
  source: string | null;
  size?: number;
};

export function ProfileUser({ source, size = 64 }: UserIconProps) {
  const isValidUrl = source?.includes("https://");

  return (
    <div style={{ width: size, height: size }}>
      {source && isValidUrl ? (
        <Image
          src={source}
          alt="User Avatar"
          width={size * 2} // Load at 2x resolution
          height={size * 2}
          quality={90}
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full bg-gray-300 rounded-full flex justify-center items-center">
          <LuUser className="text-2xl" />
        </div>
      )}
    </div>
  );
}

export function UserIcon() {
  return (
    <div className="w-10 h-10 bg-gray-300 rounded-full flex justify-center items-center">
      <LuUser className="text-2xl" />
    </div>
  );
}
