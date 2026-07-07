/**
 * CodeMirror 6 themes for NoteGraph.
 *
 * We define two static themes (dark & light) using the same HSL palette
 * that drives the CSS custom-property design tokens. CM6 themes are
 * created at module-evaluation time, so we embed the literal HSL values
 * rather than reading `var(--…)` at runtime.
 */

import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';

/* ------------------------------------------------------------------ */
/*  Dark theme                                                        */
/* ------------------------------------------------------------------ */

const darkColors = {
  bg: 'hsl(225, 25%, 8%)',
  gutterBg: 'hsl(225, 20%, 12%)',
  gutterText: 'hsl(225, 15%, 45%)',
  selection: 'hsla(250, 80%, 65%, 0.2)',
  cursor: 'hsl(250, 80%, 65%)',
  activeLine: 'hsla(225, 15%, 20%, 0.5)',
  matchingBracket: 'hsla(250, 80%, 65%, 0.35)',
  text: 'hsl(225, 15%, 75%)',
  lineNumber: 'hsl(225, 15%, 35%)',
  lineNumberActive: 'hsl(225, 15%, 60%)',
  foldPlaceholder: 'hsl(225, 15%, 45%)',
  tooltip: 'hsl(225, 20%, 14%)',
  tooltipBorder: 'hsl(225, 15%, 22%)',
} as const;

/** Dark editor chrome */
export const noteGraphDarkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: darkColors.bg,
      color: darkColors.text,
      height: '100%',
    },
    '.cm-content': {
      caretColor: darkColors.cursor,
      fontFamily: "'JetBrains Mono', monospace",
      padding: '8px 0',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: darkColors.cursor,
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {
        backgroundColor: darkColors.selection,
      },
    '.cm-activeLine': {
      backgroundColor: darkColors.activeLine,
    },
    '.cm-gutters': {
      backgroundColor: darkColors.gutterBg,
      color: darkColors.lineNumber,
      borderRight: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: darkColors.activeLine,
      color: darkColors.lineNumberActive,
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: darkColors.foldPlaceholder,
    },
    '&.cm-focused .cm-matchingBracket': {
      backgroundColor: darkColors.matchingBracket,
    },
    '.cm-tooltip': {
      backgroundColor: darkColors.tooltip,
      border: `1px solid ${darkColors.tooltipBorder}`,
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: darkColors.selection,
      },
    },
    '.cm-panels': {
      backgroundColor: darkColors.gutterBg,
      color: darkColors.text,
    },
    '.cm-searchMatch': {
      backgroundColor: 'hsla(50, 80%, 50%, 0.25)',
      outline: '1px solid hsla(50, 80%, 50%, 0.4)',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: 'hsla(250, 80%, 65%, 0.3)',
    },
  },
  { dark: true },
);

/* ------------------------------------------------------------------ */
/*  Light theme                                                       */
/* ------------------------------------------------------------------ */

const lightColors = {
  bg: 'hsl(220, 20%, 97%)',
  gutterBg: 'hsl(220, 15%, 93%)',
  gutterText: 'hsl(220, 10%, 55%)',
  selection: 'hsla(250, 70%, 55%, 0.15)',
  cursor: 'hsl(250, 70%, 55%)',
  activeLine: 'hsla(220, 10%, 85%, 0.5)',
  matchingBracket: 'hsla(250, 70%, 55%, 0.25)',
  text: 'hsl(220, 15%, 25%)',
  lineNumber: 'hsl(220, 10%, 65%)',
  lineNumberActive: 'hsl(220, 10%, 40%)',
  foldPlaceholder: 'hsl(220, 10%, 55%)',
  tooltip: 'hsl(220, 15%, 95%)',
  tooltipBorder: 'hsl(220, 10%, 82%)',
} as const;

/** Light editor chrome */
export const noteGraphLightTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: lightColors.bg,
      color: lightColors.text,
      height: '100%',
    },
    '.cm-content': {
      caretColor: lightColors.cursor,
      fontFamily: "'JetBrains Mono', monospace",
      padding: '8px 0',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: lightColors.cursor,
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {
        backgroundColor: lightColors.selection,
      },
    '.cm-activeLine': {
      backgroundColor: lightColors.activeLine,
    },
    '.cm-gutters': {
      backgroundColor: lightColors.gutterBg,
      color: lightColors.lineNumber,
      borderRight: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: lightColors.activeLine,
      color: lightColors.lineNumberActive,
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: lightColors.foldPlaceholder,
    },
    '&.cm-focused .cm-matchingBracket': {
      backgroundColor: lightColors.matchingBracket,
    },
    '.cm-tooltip': {
      backgroundColor: lightColors.tooltip,
      border: `1px solid ${lightColors.tooltipBorder}`,
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: lightColors.selection,
      },
    },
    '.cm-panels': {
      backgroundColor: lightColors.gutterBg,
      color: lightColors.text,
    },
    '.cm-searchMatch': {
      backgroundColor: 'hsla(50, 80%, 50%, 0.35)',
      outline: '1px solid hsla(50, 80%, 50%, 0.5)',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: 'hsla(250, 70%, 55%, 0.2)',
    },
  },
  { dark: false },
);

/* ------------------------------------------------------------------ */
/*  Syntax highlighting                                               */
/* ------------------------------------------------------------------ */

/** Dark mode syntax highlighting for Markdown & embedded code */
const darkHighlight = HighlightStyle.define([
  { tag: tags.heading, fontWeight: 'bold', color: 'hsl(250, 80%, 72%)' },
  { tag: tags.heading1, fontWeight: 'bold', color: 'hsl(250, 80%, 72%)', fontSize: '1.6em' },
  { tag: tags.heading2, fontWeight: 'bold', color: 'hsl(250, 75%, 70%)', fontSize: '1.4em' },
  { tag: tags.heading3, fontWeight: 'bold', color: 'hsl(250, 70%, 68%)', fontSize: '1.2em' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.link, color: 'hsl(250, 80%, 72%)', textDecoration: 'underline' },
  { tag: tags.url, color: 'hsl(225, 15%, 50%)' },
  { tag: tags.string, color: 'hsl(145, 55%, 60%)' },
  { tag: tags.comment, color: 'hsl(225, 15%, 42%)', fontStyle: 'italic' },
  { tag: tags.keyword, color: 'hsl(280, 70%, 68%)' },
  { tag: tags.quote, fontStyle: 'italic', color: 'hsl(225, 15%, 55%)' },
  { tag: tags.monospace, fontFamily: "'JetBrains Mono', monospace" },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.number, color: 'hsl(30, 80%, 65%)' },
  { tag: tags.bool, color: 'hsl(30, 80%, 65%)' },
  { tag: tags.operator, color: 'hsl(225, 15%, 65%)' },
  { tag: tags.className, color: 'hsl(40, 75%, 65%)' },
  { tag: tags.definition(tags.variableName), color: 'hsl(200, 70%, 65%)' },
  { tag: tags.variableName, color: 'hsl(225, 15%, 75%)' },
  { tag: tags.function(tags.variableName), color: 'hsl(200, 70%, 65%)' },
  { tag: tags.typeName, color: 'hsl(40, 75%, 65%)' },
  { tag: tags.propertyName, color: 'hsl(200, 55%, 65%)' },
  { tag: tags.meta, color: 'hsl(225, 15%, 50%)' },
  { tag: tags.processingInstruction, color: 'hsl(225, 15%, 50%)' },
]);

/** Light mode syntax highlighting for Markdown & embedded code */
const lightHighlight = HighlightStyle.define([
  { tag: tags.heading, fontWeight: 'bold', color: 'hsl(250, 70%, 50%)' },
  { tag: tags.heading1, fontWeight: 'bold', color: 'hsl(250, 70%, 50%)', fontSize: '1.6em' },
  { tag: tags.heading2, fontWeight: 'bold', color: 'hsl(250, 65%, 48%)', fontSize: '1.4em' },
  { tag: tags.heading3, fontWeight: 'bold', color: 'hsl(250, 60%, 46%)', fontSize: '1.2em' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.link, color: 'hsl(250, 70%, 50%)', textDecoration: 'underline' },
  { tag: tags.url, color: 'hsl(220, 10%, 50%)' },
  { tag: tags.string, color: 'hsl(145, 50%, 35%)' },
  { tag: tags.comment, color: 'hsl(220, 10%, 55%)', fontStyle: 'italic' },
  { tag: tags.keyword, color: 'hsl(280, 65%, 48%)' },
  { tag: tags.quote, fontStyle: 'italic', color: 'hsl(220, 10%, 45%)' },
  { tag: tags.monospace, fontFamily: "'JetBrains Mono', monospace" },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.number, color: 'hsl(30, 75%, 45%)' },
  { tag: tags.bool, color: 'hsl(30, 75%, 45%)' },
  { tag: tags.operator, color: 'hsl(220, 10%, 40%)' },
  { tag: tags.className, color: 'hsl(40, 70%, 40%)' },
  { tag: tags.definition(tags.variableName), color: 'hsl(200, 65%, 40%)' },
  { tag: tags.variableName, color: 'hsl(220, 15%, 30%)' },
  { tag: tags.function(tags.variableName), color: 'hsl(200, 65%, 40%)' },
  { tag: tags.typeName, color: 'hsl(40, 70%, 40%)' },
  { tag: tags.propertyName, color: 'hsl(200, 50%, 40%)' },
  { tag: tags.meta, color: 'hsl(220, 10%, 50%)' },
  { tag: tags.processingInstruction, color: 'hsl(220, 10%, 50%)' },
]);

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

/**
 * Returns the complete editor theme extension array (chrome + syntax
 * highlighting) for the requested color scheme.
 */
export function getEditorTheme(isDark: boolean): Extension[] {
  if (isDark) {
    return [noteGraphDarkTheme, syntaxHighlighting(darkHighlight)];
  }
  return [noteGraphLightTheme, syntaxHighlighting(lightHighlight)];
}
