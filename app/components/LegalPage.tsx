import type { LegalSection } from "@/dictionaries/en";

export default function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <article className="prose">
      <h1>{title}</h1>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
