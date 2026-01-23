export const MandatoryLabel: React.FC<{ notes: string }> = ({ notes }) => {
  const parts = notes.split(/(\([*]\))/);

  return (
    <div className="w-full h-fit max-sm:text-[10px] bg-green-400/10 text-black px-4 py-1 rounded-md mb-6">
      <span className="text-red-500 font-semibold">Note:</span>{" "}
      {parts.map((part, index) => (
        <span
          key={index}
          className={part === "(*)" ? "text-red-500 font-semibold" : ""}
        >
          {part}
        </span>
      ))}
    </div>
  );
};
