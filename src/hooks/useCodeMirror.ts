import { useEffect, useRef, useState } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, placeholder, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { bracketMatching } from '@codemirror/language';

import { getEditorTheme } from '../components/editor/extensions/theme';
import { markdownKeymap } from '../components/editor/extensions/shortcuts';
import { wikilinkExtension } from '../components/editor/extensions/wikilinks';

import * as Y from 'yjs';
import { yCollab } from 'y-codemirror.next';
import { WebrtcProvider } from 'y-webrtc';

interface UseCodeMirrorProps {
  initialValue: string;
  onChange?: (value: string) => void;
  isDark: boolean;
  readOnly?: boolean;
  ytext?: Y.Text;
  provider?: WebrtcProvider;
}

export function useCodeMirror({ initialValue, onChange, isDark, readOnly = false, ytext, provider }: UseCodeMirrorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView>();
  const themeCompartment = useRef(new Compartment());
  const readOnlyCompartment = useRef(new Compartment());

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (!ytext && update.docChanged && onChange) {
        onChange(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: ytext ? ytext.toString() : initialValue,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        bracketMatching(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          indentWithTab,
          ...markdownKeymap,
        ]),
        markdown({
          base: markdownLanguage,
          codeLanguages: languages,
        }),
        wikilinkExtension,
        themeCompartment.current.of(getEditorTheme(isDark)),
        readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),
        updateListener,
        placeholder('Type something brilliant...'),
        EditorView.lineWrapping,
        ...(ytext && provider ? [yCollab(ytext, provider.awareness)] : []),
      ],
    });

    const editorView = new EditorView({
      state,
      parent: containerRef.current,
    });

    setView(editorView);

    return () => {
      editorView.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytext, provider]);

  // Update theme dynamically
  useEffect(() => {
    if (view) {
      view.dispatch({
        effects: themeCompartment.current.reconfigure(getEditorTheme(isDark))
      });
    }
  }, [isDark, view]);

  // Update readOnly dynamically
  useEffect(() => {
    if (view) {
      view.dispatch({
        effects: readOnlyCompartment.current.reconfigure(EditorState.readOnly.of(readOnly))
      });
    }
  }, [readOnly, view]);

  // Note: changing initialValue after mount is handled by checking if doc changed.
  // We use key={id} on the component to avoid this firing for different files.
  // But if an external process changes the file content, we should update it.
  useEffect(() => {
    if (!ytext && view && initialValue !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: initialValue }
      });
    }
  }, [initialValue, view, ytext]);

  return { containerRef, view };
}
