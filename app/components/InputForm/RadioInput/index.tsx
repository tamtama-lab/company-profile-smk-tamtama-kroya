export const RadioInput: React.FC<{
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  isMandatory?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options?: Array<{ value: string; label: string }>;
}> = ({ label, name, value, placeholder, isMandatory, onChange, options }) => {
  // If options are provided, render as a radio group
  if (options && options.length > 0) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {isMandatory && <span className="text-red-500">*</span>}
        </label>
        <div className="flex flex-col gap-4 border border-gray-300 rounded-sm p-4">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                required={isMandatory}
                className="w-5 h-5 border-gray-300 focus:outline-none focus:ring-0.5 focus:ring-primary focus:border-transparent rounded-full"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // Fallback to single radio input
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {isMandatory && <span className="text-red-500">*</span>}
      </label>
      <input
        type="radio"
        name={name}
        value={value}
        onChange={onChange}
        required={isMandatory}
        className="w-full px-4 py-2 border border-gray-300 rounded-sm 
          focus:outline-none focus:ring-2 focus:ring-primary 
          focus:border-transparent
          [&::-webkit-calendar-picker-indicator]:cursor-pointer
          [&::-webkit-calendar-picker-indicator]:filter
          "
        placeholder={placeholder}
      />
    </div>
  );
};
