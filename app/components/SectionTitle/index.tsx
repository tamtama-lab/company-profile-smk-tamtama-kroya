export const SectionTitle: React.FC<{
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
}> = ({ title, subtitle, align = "center" }) => {
  return (
    <div className={`text-${align} w-full h-fit mb-12 space-y-4`}>
      <div className="w-full h-fit">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <h2 className="text-lg ">{subtitle}</h2>
      </div>
    </div>
  );
};
