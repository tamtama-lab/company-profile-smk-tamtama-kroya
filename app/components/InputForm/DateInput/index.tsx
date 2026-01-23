export const DateInput: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isMandatory?: boolean;
}> = ({ label, name, value, onChange, placeholder, isMandatory }) => {
  return (
    <div className="mb-4 max-sm:mb-1">
      <label className="block text-sm max-sm:text-xs font-semibold text-gray-700 mb-2">
        {label} {isMandatory && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          required={isMandatory}
          className={`w-full px-4 py-2 border border-gray-300 rounded-sm 
            focus:outline-none focus:ring-2 focus:ring-primary 
            focus:border-transparent
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
            [&::-webkit-calendar-picker-indicator]:filter
            ${!value ? "text-transparent" : "text-gray-900"}`}
          title={placeholder}
        />
        {!value && (
          <span className="absolute left-4 top-2 text-gray-400 text-sm pointer-events-none font-normal">
            {placeholder || "Masukkan tanggal"}
          </span>
        )}
      </div>
    </div>
  );
};
