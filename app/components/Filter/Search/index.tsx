import { FaMagnifyingGlass } from "react-icons/fa6";

interface SearchProps {
  searchTerm: string;
  handleSearchChange: (value: string) => void;
  className?: string;
}

export default function Search({
  searchTerm,
  handleSearchChange,
  className = "",
}: SearchProps) {
  return (
    <div className={className}>
      <div className={`relative w-full max-sm:w-full max-sm:pb-1`}>
        <div className="absolute inset-y-0 left-0 pl-3 max-sm:pb-1 flex items-center pointer-events-none">
          <FaMagnifyingGlass className="text-lg text-gray-400" />
        </div>
        <input
          type="text"
          aria-label="Cari pendaftar"
          placeholder="Cari Nama / nomor pendaftaran / atau asal sekolah..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="block max-sm:placeholder:text-xs w-full pl-10 pr-3 py-2.5 max-sm:py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
    </div>
  );
}
