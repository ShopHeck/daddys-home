"use client";

import { useEffect, useRef } from 'react';

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: 'html' | 'json' | 'css';
  className?: string;
  placeholder?: string;
};

export function CodeEditor({ value, onChange, language, className, placeholder }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!editorRef.current || typeof window === 'undefined') {
      return;
    }

    let disposed = false;

    void (async () => {
      const [{ EditorView, basicSetup }, { EditorState }, { oneDark }, { html }, { json }, { css: cssLang }, { placeholder: placeholderExtension }] = await Promise.all([
        import('codemirror'),
        import('@codemirror/state'),
        import('@codemirror/theme-one-dark'),
        import('@codemirror/lang-html'),
        import('@codemirror/lang-json'),
        import('@codemirror/lang-css'),
        import('@codemirror/view')
      ]);

      if (disposed || !editorRef.current) {
        return;
      }

      const docforgeTheme = EditorView.theme({
        '&': {
          backgroundColor: '#020617',
          borderRadius: '0.5rem',
          border: '1px solid rgb(71 85 105)',
          fontSize: '0.875rem',
          height: '100%'
        },
        '.cm-scroller': {
          minHeight: '100%',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace'
        },
        '.cm-content, .cm-gutter': {
          minHeight: '100%'
        },
        '.cm-content': {
          padding: '1rem 0'
        },
        '.cm-line': {
          padding: '0 1rem'
        },
        '.cm-gutters': {
          backgroundColor: '#0f172a',
          borderRight: '1px solid rgb(51 65 85)',
          color: '#94a3b8'
        },
        '.cm-activeLineGutter': {
          backgroundColor: '#1e293b'
        },
        '.cm-activeLine': {
          backgroundColor: 'rgba(30, 41, 59, 0.45)'
        },
        '.cm-selectionBackground, ::selection': {
          backgroundColor: 'rgba(59, 130, 246, 0.2) !important'
        },
        '.cm-cursor, .cm-dropCursor': {
          borderLeftColor: '#ffffff'
        },
        '&.cm-focused': {
          outline: 'none',
          boxShadow: '0 0 0 2px rgb(59 130 246)'
        },
        '.cm-placeholder': {
          color: '#64748b'
        }
      });

      const state = EditorState.create({
        doc: valueRef.current,
        extensions: [
          basicSetup,
          oneDark,
          docforgeTheme,
          EditorState.tabSize.of(2),
          language === 'html' ? html() : language === 'css' ? cssLang() : json(),
          placeholder ? placeholderExtension(placeholder) : [],
          EditorView.updateListener.of((update) => {
            if (!update.docChanged) {
              return;
            }

            const nextValue = update.state.doc.toString();
            valueRef.current = nextValue;
            onChangeRef.current(nextValue);
          })
        ]
      });

      const view = new EditorView({
        state,
        parent: editorRef.current
      });

      viewRef.current = view;
    })();

    return () => {
      disposed = true;
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [language, placeholder]);

  useEffect(() => {
    const view = viewRef.current;

    if (!view) {
      return;
    }

    const currentValue = view.state.doc.toString();

    if (value === currentValue) {
      return;
    }

    const { anchor, head } = view.state.selection.main;
    const nextLength = value.length;

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
      selection: {
        anchor: Math.min(anchor, nextLength),
        head: Math.min(head, nextLength)
      }
    });

    valueRef.current = value;
  }, [value]);

  return <div className={className}><div ref={editorRef} className="h-full" /></div>;
}
