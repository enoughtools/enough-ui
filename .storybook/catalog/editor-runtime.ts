import * as monaco from 'monaco-editor/editor/editor.api.js';
import '../../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css';
import 'monaco-editor/languages/definitions/typescript/register.js';
import 'monaco-editor/languages/definitions/javascript/register.js';
import 'monaco-editor/languages/definitions/swift/register.js';
import 'monaco-editor/editor/browser/coreCommands.js';
import 'monaco-editor/editor/contrib/find/browser/findController.js';
import 'monaco-editor/editor/contrib/folding/browser/folding.js';
import 'monaco-editor/editor/contrib/tokenization/browser/tokenization.js';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import { registerSourceLanguages } from './source-languages';

export { monaco };

self.MonacoEnvironment = { getWorker: () => new EditorWorker() };
registerSourceLanguages(monaco);
monaco.editor.defineTheme('enough-source', {
  base: 'vs', inherit: true,
  rules: [
    { token: 'comment', foreground: '626B7A' },
    { token: 'keyword', foreground: '3446C5' },
    { token: 'string', foreground: '246443' },
    { token: 'number', foreground: '9A431F' },
    { token: 'tag', foreground: '3446C5' },
    { token: 'attribute.name', foreground: '8B3529' },
    { token: 'type.identifier', foreground: '663A92' },
  ],
  colors: {
    'editor.background': '#FAFBFC', 'editor.foreground': '#12151C',
    'editorLineNumber.foreground': '#626B7A', 'editorLineNumber.activeForeground': '#3446C5',
    'editor.selectionBackground': '#DDE3FC', 'editor.inactiveSelectionBackground': '#E9ECF3',
    'editor.lineHighlightBackground': '#F1F3F8', 'editorCursor.foreground': '#3446C5',
    'editorWidget.background': '#FFFFFF', 'editorWidget.border': '#DDE1E8',
    'editor.findMatchBackground': '#F4D9A2', 'editor.findMatchHighlightBackground': '#FFF0CE',
    'focusBorder': '#3446C5',
  },
});

export function createSourceEditor(host: HTMLElement, value: string, language: string, filename: string, wrap: boolean, onExit: () => void) {
  const model = monaco.editor.createModel(value, language, monaco.Uri.parse(`inmemory://enough-source/${crypto.randomUUID()}/${filename}`));
  const editor = monaco.editor.create(host, {
    model, theme: 'enough-source', readOnly: true, domReadOnly: true,
    ariaLabel: 'Source code, read only', automaticLayout: true,
    fontFamily: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
    disableMonospaceOptimizations: true, fontSize: 14, lineHeight: 24,
    minimap: { enabled: false }, lineNumbers: 'on', lineNumbersMinChars: 3,
    glyphMargin: false, folding: true, showFoldingControls: 'mouseover',
    wordWrap: wrap ? 'on' : 'off', scrollBeyondLastLine: false,
    renderLineHighlight: 'none', renderValidationDecorations: 'off',
    contextmenu: false, links: false, occurrencesHighlight: 'off',
    selectionHighlight: false, bracketPairColorization: { enabled: false },
    padding: { top: 16, bottom: 16 }, tabSize: 2,
    scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, alwaysConsumeMouseWheel: false },
  });
  editor.addCommand(monaco.KeyCode.Escape, () => {
    editor.trigger('source-viewer', 'closeFindWidget', null);
    onExit();
  });
  return {
    update(nextValue: string, nextLanguage: string, nextWrap: boolean) {
      if (model.getValue() !== nextValue) { model.setValue(nextValue); editor.setScrollTop(0); editor.setScrollLeft(0); }
      if (model.getLanguageId() !== nextLanguage) monaco.editor.setModelLanguage(model, nextLanguage);
      editor.updateOptions({ wordWrap: nextWrap ? 'on' : 'off' });
    },
    find() { editor.focus(); void editor.getAction('actions.find')?.run(); },
    dispose() { editor.dispose(); model.dispose(); },
  };
}
