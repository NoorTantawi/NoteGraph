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
import { usePluginStore } from '../stores/pluginStore';
import { useEditorStore } from '../stores/editorStore';
import { debounce } from '../lib/utils';

interface UseCodeMirrorProps {
  fileId: string;
  initialValue: string;
  onChange?: (value: string) => void;
  isDark: boolean;
  readOnly?: boolean;
  ytext?: Y.Text;
  provider?: WebrtcProvider;
}

export function useCodeMirror({ fileId, initialValue, onChange, isDark, readOnly = false, ytext, provider }: UseCodeMirrorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView>();
  const themeCompartment = useRef(new Compartment());
  const readOnlyCompartment = useRef(new Compartment());
  const cmExtensionsCompartment = useRef(new Compartment());
  const yjsCompartment = useRef(new Compartment());
  const cmExtensions = usePluginStore(state => state.cmExtensions);

  const debouncedOnChangeRef = useRef<((val: string) => void) | undefined>(undefined);

  useEffect(() => {
    debouncedOnChangeRef.current = debounce((val: string) => {
      if (onChange) onChange(val);
    }, 500);
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newDoc = update.state.doc.toString();
        // Instantly update the editorStore's activeContent buffer
        useEditorStore.getState().setActiveContent(newDoc);

        // Save after 500ms pause in typing
        if (debouncedOnChangeRef.current) {
          debouncedOnChangeRef.current(newDoc);
        }
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
        yjsCompartment.current.of(ytext && provider ? [yCollab(ytext, provider.awareness)] : []),
        cmExtensionsCompartment.current.of(cmExtensions),
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
  }, [fileId]);

  // Update theme dynamically
  useEffect(() => {
    if (view) {
      view.dispatch({
        effects: themeCompartment.current.reconfigure(getEditorTheme(isDark))
      });
    }
  }, [isDark, view]);

  // Update cmExtensions dynamically
  useEffect(() => {
    if (view) {
      view.dispatch({
        effects: cmExtensionsCompartment.current.reconfigure(cmExtensions)
      });
    }
  }, [cmExtensions, view]);

  // Update readOnly dynamically
  useEffect(() => {
    if (view) {
      view.dispatch({
        effects: readOnlyCompartment.current.reconfigure(EditorState.readOnly.of(readOnly))
      });
    }
  }, [readOnly, view]);

  // Update Yjs collaboration dynamically
  useEffect(() => {
    if (view) {
      view.dispatch({
        effects: yjsCompartment.current.reconfigure(
          ytext && provider ? [yCollab(ytext, provider.awareness)] : []
        )
      });
    }
  }, [ytext, provider, view]);

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
