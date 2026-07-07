/**
 * Custom CodeMirror 6 keybindings for Markdown formatting.
 *
 * Every shortcut works in two modes:
 *   1. **Selection active** — wraps the selected text with the relevant
 *      markdown syntax.
 *   2. **No selection** — inserts an empty template and positions the
 *      cursor between the markers.
 */

import type { KeyBinding } from '@codemirror/view';
import { EditorView } from '@codemirror/view';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Wraps the current selection with `before` / `after` markers.
 * If nothing is selected, inserts `before + after` and places the
 * cursor between them.
 */
export function wrapSelection(
  view: EditorView,
  before: string,
  after: string,
): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;
  const selected = state.sliceDoc(from, to);

  if (selected.length > 0) {
    view.dispatch({
      changes: { from, to, insert: `${before}${selected}${after}` },
      selection: {
        anchor: from + before.length,
        head: from + before.length + selected.length,
      },
    });
  } else {
    view.dispatch({
      changes: { from, to: from, insert: `${before}${after}` },
      selection: { anchor: from + before.length },
    });
  }

  view.focus();
  return true;
}

/**
 * Inserts `prefix` at the beginning of each selected line.
 * Used for headings and list prefixes.
 */
export function insertLinePrefix(
  view: EditorView,
  prefix: string,
): boolean {
  const { state } = view;
  const { from } = state.selection.main;
  const line = state.doc.lineAt(from);

  // If the line already starts with the exact prefix, remove it (toggle)
  const lineText = line.text;
  if (lineText.startsWith(prefix)) {
    view.dispatch({
      changes: { from: line.from, to: line.from + prefix.length, insert: '' },
    });
  } else {
    // Remove any existing heading prefix before inserting a new one
    const headingMatch = /^#{1,6}\s/.exec(lineText);
    const removeEnd = headingMatch ? line.from + headingMatch[0].length : line.from;

    view.dispatch({
      changes: { from: line.from, to: removeEnd, insert: prefix },
    });
  }

  view.focus();
  return true;
}

/**
 * Inserts a link template wrapping the selection.
 */
function insertLink(view: EditorView): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;
  const selected = state.sliceDoc(from, to);

  if (selected.length > 0) {
    const replacement = `[${selected}](url)`;
    view.dispatch({
      changes: { from, to, insert: replacement },
      // Select the "url" placeholder
      selection: {
        anchor: from + selected.length + 3,
        head: from + selected.length + 6,
      },
    });
  } else {
    view.dispatch({
      changes: { from, to: from, insert: '[](url)' },
      selection: { anchor: from + 1 },
    });
  }

  view.focus();
  return true;
}

/**
 * Inserts a fenced code block wrapping the selection.
 */
function insertCodeFence(view: EditorView): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;
  const selected = state.sliceDoc(from, to);

  if (selected.length > 0) {
    const replacement = `\`\`\`\n${selected}\n\`\`\``;
    view.dispatch({
      changes: { from, to, insert: replacement },
      selection: {
        anchor: from + 4,
        head: from + 4 + selected.length,
      },
    });
  } else {
    const replacement = '```\n\n```';
    view.dispatch({
      changes: { from, to: from, insert: replacement },
      selection: { anchor: from + 4 },
    });
  }

  view.focus();
  return true;
}

/* ------------------------------------------------------------------ */
/*  Exported keymap                                                   */
/* ------------------------------------------------------------------ */

/** Markdown formatting keyboard shortcuts for NoteGraph. */
export const markdownKeymap: KeyBinding[] = [
  // Inline formatting
  { key: 'Mod-b', run: (v) => wrapSelection(v, '**', '**'), preventDefault: true },
  { key: 'Mod-i', run: (v) => wrapSelection(v, '*', '*'), preventDefault: true },
  { key: 'Mod-Shift-x', run: (v) => wrapSelection(v, '~~', '~~'), preventDefault: true },
  { key: 'Mod-e', run: (v) => wrapSelection(v, '`', '`'), preventDefault: true },

  // Link
  { key: 'Mod-k', run: insertLink, preventDefault: true },

  // Code fence
  { key: 'Mod-Shift-c', run: insertCodeFence, preventDefault: true },

  // Headings H1–H6
  { key: 'Mod-Shift-1', run: (v) => insertLinePrefix(v, '# '), preventDefault: true },
  { key: 'Mod-Shift-2', run: (v) => insertLinePrefix(v, '## '), preventDefault: true },
  { key: 'Mod-Shift-3', run: (v) => insertLinePrefix(v, '### '), preventDefault: true },
  { key: 'Mod-Shift-4', run: (v) => insertLinePrefix(v, '#### '), preventDefault: true },
  { key: 'Mod-Shift-5', run: (v) => insertLinePrefix(v, '##### '), preventDefault: true },
  { key: 'Mod-Shift-6', run: (v) => insertLinePrefix(v, '###### '), preventDefault: true },
];
