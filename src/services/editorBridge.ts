export interface ActiveFileInfo {
  name: string;
  location: string;
  content: string;
  hasSelection: boolean;
  selectedText: string;
}

export class EditorBridgeService {
  public static getActiveFileInfo(): ActiveFileInfo | null {
    if (typeof editorManager === 'undefined' || !editorManager.activeFile) {
      return null;
    }

    const file = editorManager.activeFile;
    const editor = editorManager.editor;

    let selectedText = '';
    let hasSelection = false;

    if (editor) {
      try {
        if (typeof editor.getCopyText === 'function') {
          selectedText = editor.getCopyText() || '';
        } else if (typeof editor.getSelectedText === 'function') {
          selectedText = editor.getSelectedText() || '';
        } else if (editor.state && editor.state.selection) {
          const mainSel = editor.state.selection.main;
          if (mainSel && !mainSel.empty) {
            selectedText = editor.state.sliceDoc(mainSel.from, mainSel.to);
          }
        }
      } catch (e) {
        console.warn('Could not read selection:', e);
      }
    }

    hasSelection = selectedText.trim().length > 0;

    return {
      name: file.name || file.filename || 'Untitled',
      location: file.location || '',
      content: file.content || '',
      hasSelection,
      selectedText,
    };
  }

  public static replaceSelection(newText: string): boolean {
    if (typeof editorManager === 'undefined' || !editorManager.editor) return false;
    const editor = editorManager.editor;

    try {
      if (typeof editor.insert === 'function') {
        editor.insert(newText);
        return true;
      } else if (editor.dispatch && editor.state) {
        const sel = editor.state.selection.main;
        editor.dispatch({
          changes: { from: sel.from, to: sel.to, insert: newText },
        });
        return true;
      }
    } catch (e) {
      console.error('Failed replacing selection:', e);
    }
    return false;
  }

  public static updateActiveFileContent(newContent: string): boolean {
    if (typeof editorManager === 'undefined' || !editorManager.activeFile) return false;
    try {
      const file = editorManager.activeFile;
      if (typeof file.setText === 'function') {
        file.setText(newContent);
        return true;
      } else {
        file.content = newContent;
        if (editorManager.editor && typeof editorManager.editor.setValue === 'function') {
          editorManager.editor.setValue(newContent, 1);
        }
        return true;
      }
    } catch (e) {
      console.error('Failed updating active file:', e);
    }
    return false;
  }

  public static insertAtCursor(text: string): boolean {
    if (typeof editorManager === 'undefined' || !editorManager.editor) return false;
    const editor = editorManager.editor;
    try {
      if (typeof editor.insert === 'function') {
        editor.insert(text);
        return true;
      } else if (editor.dispatch && editor.state) {
        const pos = editor.state.selection.main.head;
        editor.dispatch({
          changes: { from: pos, insert: text },
        });
        return true;
      }
    } catch (e) {
      console.error('Failed inserting text:', e);
    }
    return false;
  }

  public static async openFile(filePath: string): Promise<boolean> {
    if (typeof editorManager === 'undefined' || !editorManager.openFile) return false;
    try {
      await editorManager.openFile(filePath);
      return true;
    } catch (e) {
      console.error('Failed opening file:', e);
      return false;
    }
  }

  public static async createNewFile(filename: string = 'untitled.js', content: string = ''): Promise<boolean> {
    if (typeof editorManager === 'undefined') return false;
    try {
      if (typeof editorManager.newFile === 'function') {
        await editorManager.newFile(filename, { text: content });
        return true;
      } else if (typeof (acode as any) !== 'undefined' && typeof (acode as any).newFile === 'function') {
        await (acode as any).newFile(filename, content);
        return true;
      } else {
        return this.updateActiveFileContent(content);
      }
    } catch (e) {
      console.error('Failed creating new file in Acode:', e);
      return false;
    }
  }
}

