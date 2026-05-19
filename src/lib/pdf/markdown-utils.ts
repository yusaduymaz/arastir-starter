/**
 * markdown-utils.ts
 * Lightweight Markdown → plain text utilities for PDF rendering.
 * Uses regex-based parsing (no external parser dependency) to keep it fast and dependency-free.
 */

/**
 * Strips common Markdown formatting characters and returns plain text.
 * - Removes heading markers (#, ##, etc.)
 * - Removes bold/italic markers (**, *, __, _)
 * - Removes inline code backticks
 * - Removes link syntax [text](url) → text
 * - Collapses multiple blank lines
 */
export function stripMarkdown(md: string): string {
  if (!md) return '';

  let text = md;

  // Remove heading markers (# Heading → Heading)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove bold+italic (***text*** or ___text___)
  text = text.replace(/\*{3}(.+?)\*{3}/g, '$1');
  text = text.replace(/_{3}(.+?)_{3}/g, '$1');

  // Remove bold (**text** or __text__)
  text = text.replace(/\*{2}(.+?)\*{2}/g, '$1');
  text = text.replace(/_{2}(.+?)_{2}/g, '$1');

  // Remove italic (*text* or _text_)
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/_(.+?)_/g, '$1');

  // Remove inline code (`code`)
  text = text.replace(/`(.+?)`/g, '$1');

  // Remove links [text](url) → text
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // Remove images ![alt](url) → alt
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');

  // Remove horizontal rules (--- or ***)
  text = text.replace(/^[-*]{3,}\s*$/gm, '');

  // Remove blockquote markers
  text = text.replace(/^>\s*/gm, '');

  // Trim bullet list markers but keep the text
  text = text.replace(/^[\s]*[-*+]\s+/gm, '• ');

  // Collapse multiple blank lines into one
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Parses a Markdown string and returns an array of bullet point strings.
 * Recognizes lines starting with -, *, + or numbered list items (1., 2., etc.)
 * Returns the text content of each bullet, stripped of Markdown formatting.
 */
export function parseMarkdownBullets(md: string): string[] {
  if (!md) return [];

  const lines = md.split('\n');
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Match unordered list items: -, *, +
    const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)/);
    if (unorderedMatch) {
      bullets.push(stripMarkdown(unorderedMatch[1]));
      continue;
    }

    // Match ordered list items: 1., 2., etc.
    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (orderedMatch) {
      bullets.push(stripMarkdown(orderedMatch[1]));
      continue;
    }
  }

  return bullets;
}

/**
 * Parses a Markdown string into sections defined by headings.
 * Each heading starts a new section. Content before the first heading
 * is returned as a section with no heading.
 *
 * Returns: Array of { heading?: string, body: string }
 */
export function parseMarkdownSections(md: string): Array<{ heading?: string; body: string }> {
  if (!md) return [];

  const lines = md.split('\n');
  const sections: Array<{ heading?: string; body: string }> = [];

  let currentHeading: string | undefined = undefined;
  let currentBodyLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);

    if (headingMatch) {
      // Save previous section
      const body = currentBodyLines.join('\n').trim();
      if (body || currentHeading !== undefined) {
        sections.push({ heading: currentHeading, body: stripMarkdown(body) });
      }

      // Start new section
      currentHeading = headingMatch[2].trim();
      currentBodyLines = [];
    } else {
      currentBodyLines.push(line);
    }
  }

  // Push last section
  const body = currentBodyLines.join('\n').trim();
  if (body || currentHeading !== undefined) {
    sections.push({ heading: currentHeading, body: stripMarkdown(body) });
  }

  // Filter out completely empty sections
  return sections.filter(s => s.heading || s.body);
}
