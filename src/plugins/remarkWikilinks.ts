/**
 * Custom remark plugin: transforms `[[wikilinks]]` in Markdown text
 * into link nodes that the preview renderer can turn into clickable
 * navigation.
 *
 * Supports two forms:
 *   - `[[target]]` — link text equals the target
 *   - `[[target|display text]]` — custom display text
 *
 * The generated link node uses the `wikilink:` URI scheme so the
 * preview component can intercept it.
 */

import { visit } from 'unist-util-visit';
import type { Root, Text, PhrasingContent } from 'mdast';

/** Regex that captures wikilink syntax (non-greedy, no nested brackets) */
const WIKILINK_RE = /\[\[([^\]]+?)\]\]/g;

/**
 * Remark plugin — transforms `[[…]]` text into link nodes.
 */
export function remarkWikilinks() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (index === undefined || !parent) return;

      const value = node.value;
      WIKILINK_RE.lastIndex = 0;

      if (!WIKILINK_RE.test(value)) return;

      // Reset and split the text around matches
      WIKILINK_RE.lastIndex = 0;
      const children: PhrasingContent[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = WIKILINK_RE.exec(value)) !== null) {
        // Text before the match
        if (match.index > lastIndex) {
          children.push({
            type: 'text',
            value: value.slice(lastIndex, match.index),
          });
        }

        const inner = match[1];
        const pipeIdx = inner.indexOf('|');
        const target = pipeIdx >= 0 ? inner.slice(0, pipeIdx).trim() : inner.trim();
        const display = pipeIdx >= 0 ? inner.slice(pipeIdx + 1).trim() : target;

        // Create a link node with the wikilink: URI scheme
        children.push({
          type: 'link',
          url: `wikilink:${target}`,
          title: null,
          children: [{ type: 'text', value: display }],
        });

        lastIndex = match.index + match[0].length;
      }

      // Trailing text
      if (lastIndex < value.length) {
        children.push({ type: 'text', value: value.slice(lastIndex) });
      }

      // Replace the original text node with the new children
      parent.children.splice(index, 1, ...children);
    });
  };
}

/* ------------------------------------------------------------------ */
/*  Pure extraction (no AST mutation)                                 */
/* ------------------------------------------------------------------ */

/**
 * Extracts all `[[wikilink]]` targets from raw Markdown text.
 * Returns an array of target strings (de-duped, trimmed).
 *
 * @example
 * extractWikilinks('See [[Note A]] and [[Note B|display]]')
 * // → ['Note A', 'Note B']
 */
export function extractWikilinks(markdown: string): string[] {
  const targets = new Set<string>();
  let match: RegExpExecArray | null;

  WIKILINK_RE.lastIndex = 0;
  while ((match = WIKILINK_RE.exec(markdown)) !== null) {
    const inner = match[1];
    const pipeIdx = inner.indexOf('|');
    const target = pipeIdx >= 0 ? inner.slice(0, pipeIdx).trim() : inner.trim();
    if (target) targets.add(target);
  }

  return [...targets];
}
