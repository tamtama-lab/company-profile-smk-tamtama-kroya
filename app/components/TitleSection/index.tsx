export function TitleSection({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div
      id="title-section"
      className="w-full rounded-xl py-4 flex flex-col justify-center items-start gap-2"
    >
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <h2
        className="text-sm text-gray-500"
        dangerouslySetInnerHTML={{
          __html: subtitle || "",
        }}
      ></h2>
    </div>
  );
}
