/**
 * Custom remark plugin: detects `#tagname` patterns in text nodes and
 * wraps them in an HTML `<span class="tag">` for distinct styling in
 * the preview pane.
 *
 * Tag rules:
 *   - Must start with `#` followed by a letter
 *   - May contain letters, digits, hyphens, and underscores
 *   - Must not be inside a heading marker (handled by checking position)
 */

import { visit } from 'unist-util-visit';
import type { Root, Text, PhrasingContent } from 'mdast';

/**
 * Matches `#tagname` where the tag starts with a letter and continues
 * with word characters (letters, digits, hyphen, underscore).
 * The lookbehind-free approach: we check the character before the match
 * in the replacement loop instead.
 */
const TAG_RE = /(?:^|\s)#([a-zA-Z][a-zA-Z0-9_-]*)/g;

/**
 * Remark plugin — wraps `#tag` tokens in `<span class="tag">` HTML nodes.
 */
export function remarkTags() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (index === undefined || !parent) return;
      // Skip if inside a heading (headings use # as syntax)
      if (parent.type === 'heading') return;

      const value = node.value;
      TAG_RE.lastIndex = 0;

      if (!TAG_RE.test(value)) return;

      TAG_RE.lastIndex = 0;
      const children: PhrasingContent[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = TAG_RE.exec(value)) !== null) {
        // The full match may include a leading whitespace; find the #
        const fullMatch = match[0];
        const hashOffset = fullMatch.indexOf('#');
        const tagStart = match.index + hashOffset;
        const tagEnd = match.index + fullMatch.length;

        // Text before the tag (including any leading whitespace captured)
        if (tagStart > lastIndex) {
          children.push({
            type: 'text',
            value: value.slice(lastIndex, tagStart),
          });
        }

        // Wrap the tag in an HTML node for styling
        children.push({
          type: 'html',
          value: `<span class="tag">#${match[1]}</span>`,
        } as unknown as PhrasingContent);

        lastIndex = tagEnd;
      }

      // Trailing text
      if (lastIndex < value.length) {
        children.push({ type: 'text', value: value.slice(lastIndex) });
      }

      if (children.length > 0) {
        parent.children.splice(index, 1, ...children);
      }
    });
  };
}

/* ------------------------------------------------------------------ */
/*  Pure extraction (no AST mutation)                                 */
/* ------------------------------------------------------------------ */

/**
 * Extracts all `#tag` names from raw Markdown text.
 * Returns an array of tag strings (without the `#` prefix, de-duped).
 *
 * @example
 * extractTags('Hello #world and #hello-there')
 * // → ['world', 'hello-there']
 */
export function extractTags(markdown: string): string[] {
  const tagSet = new Set<string>();
  let match: RegExpExecArray | null;

  TAG_RE.lastIndex = 0;
  while ((match = TAG_RE.exec(markdown)) !== null) {
    tagSet.add(match[1]);
  }

  return [...tagSet];
}
