type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <header className="reveal-up mb-12 flex max-w-3xl flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="text-primary text-3xl font-bold md:text-4xl">{title}</h2>
      {description ? (
        <p className="text-secondary text-base md:text-lg">{description}</p>
      ) : null}
    </header>
  );
}
