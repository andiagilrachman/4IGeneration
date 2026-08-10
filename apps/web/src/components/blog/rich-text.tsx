/**
 * RichText — render paragraf blog dengan markdown ringan:
 * **bold** → <strong> · baris diawali "- " → <li>
 */

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-text-primary">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function RichText({ content }: { content: string[] }) {
  return (
    <div className="space-y-4">
      {content.map((para, i) => {
        if (para.startsWith("- ")) {
          const items = para
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.startsWith("- "));
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5 text-text-secondary">
              {items.map((item, j) => (
                <li key={j}>{renderInline(item.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="leading-relaxed text-text-secondary">
            {renderInline(para)}
          </p>
        );
      })}
    </div>
  );
}
