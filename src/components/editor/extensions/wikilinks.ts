/**
 * CodeMirror 6 extension that decorates `[[wikilinks]]` inline.
 *
 * Uses a `ViewPlugin` that builds a `DecorationSet` by scanning the
 * visible document for the `[[…]]` pattern, then applies a CSS class
 * (`cm-wikilink`) for accent-colored, underlined styling.
 */

import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import { type Extension, RangeSetBuilder } from '@codemirror/state';

/** CSS class applied to wikilink spans */
const wikilinkMark = Decoration.mark({ class: 'cm-wikilink' });

/** Regex to find [[target]] or [[target|display text]] */
const WIKILINK_RE = /\[\[([^\]]+?)\]\]/g;

/**
 * Scans the visible ranges of the document and produces a DecorationSet
 * for every `[[…]]` match.
 */
function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();

  for (const { from, to } of view.visibleRanges) {
    const text = view.state.sliceDoc(from, to);
    let match: RegExpExecArray | null;

    WIKILINK_RE.lastIndex = 0;
    while ((match = WIKILINK_RE.exec(text)) !== null) {
      const start = from + match.index;
      const end = start + match[0].length;
      builder.add(start, end, wikilinkMark);
    }
  }

  return builder.finish();
}

/** ViewPlugin that maintains wikilink decorations */
const wikilinkPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);

/** Base theme that styles the `cm-wikilink` class */
const wikilinkBaseTheme = EditorView.baseTheme({
  '.cm-wikilink': {
    color: 'hsl(250, 80%, 72%)',
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    textUnderlineOffset: '3px',
    cursor: 'pointer',
  },
});

/**
 * Complete wikilinks extension — combines the view plugin (decorations)
 * and the base theme (styles).
 */
export const wikilinkExtension: Extension = [wikilinkPlugin, wikilinkBaseTheme];
