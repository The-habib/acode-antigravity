import { EditorBridgeService } from '../services/editorBridge';
import { AgentBridgeService } from '../services/agentBridge';
import { TerminalService } from '../services/terminal';

export class ControlPage {
  private static pageInstance: any = null;
  private static lastResult: string = '';

  public static show(): void {
    const Page = acode.require('page');
    if (!Page) {
      if (typeof acode.pushNotification === 'function') {
        acode.pushNotification('Antigravity', 'Acode Page API is unavailable', { type: 'error' });
      }
      return;
    }

    if (!this.pageInstance) {
      this.pageInstance = Page('🚀 Google Antigravity Native Engine');
      this.pageInstance.onhide = () => {
        console.log('Antigravity Page closed');
      };
    }

    const body = this.pageInstance.body as HTMLElement;
    this.renderUI(body);
    this.pageInstance.show();
  }

  private static renderUI(container: HTMLElement): void {
    const fileInfo = EditorBridgeService.getActiveFileInfo();
    const contextName = fileInfo ? fileInfo.name : 'No file open';
    const contextLength = fileInfo ? (fileInfo.hasSelection ? `${fileInfo.selectedText.length} selected chars` : `${fileInfo.content.length} total chars`) : '';

    container.innerHTML = `
      <style>
        .ag-page-container {
          padding: 16px;
          color: #ffffff;
          background: #121212;
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
          box-sizing: border-box;
          overflow-y: auto;
        }
        .ag-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #333;
          padding-bottom: 12px;
        }
        .ag-page-title {
          font-size: 18px;
          font-weight: bold;
          color: #4285f4;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ag-page-badge {
          background: #34a853;
          color: #fff;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 600;
        }
        .ag-page-card {
          background: #1e1e1e;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ag-page-input {
          width: 100%;
          min-height: 90px;
          background: #252526;
          color: #fff;
          border: 1px solid #444;
          border-radius: 6px;
          padding: 10px;
          box-sizing: border-box;
          font-size: 13px;
          resize: vertical;
        }
        .ag-page-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 8px;
        }
        .ag-page-btn {
          background: #2d2d2d;
          color: #fff;
          border: 1px solid #444;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .ag-page-btn:active {
          opacity: 0.8;
          background: #3d3d3d;
        }
        .ag-page-btn-primary {
          background: #4285f4;
          border: none;
          color: #fff;
        }
        .ag-page-response {
          background: #181818;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
          font-size: 12px;
          font-family: monospace;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
          min-height: 150px;
          max-height: 350px;
          overflow-y: auto;
        }
        .ag-page-bar {
          display: flex;
          gap: 8px;
        }
      </style>

      <div class="ag-page-container">
        <div class="ag-page-header">
          <div class="ag-page-title">
            <span>🚀 Google Antigravity</span>
          </div>
          <span class="ag-page-badge">Full Native Engine</span>
        </div>

        <div class="ag-page-card">
          <div style="font-size: 12px; opacity: 0.8;">
            📌 <strong>Active Context:</strong> ${contextName} (${contextLength})
          </div>
          <textarea id="ag-full-prompt" class="ag-page-input" placeholder="Type prompt for Antigravity (e.g. 'Refactor this function to be async', 'Add TypeScript types', 'Fix memory leak')..."></textarea>
          
          <div class="ag-page-grid">
            <button id="ag-full-submit" class="ag-page-btn ag-page-btn-primary" style="grid-column: 1 / -1;">🤖 Ask Antigravity Engine</button>
            <button id="ag-full-refactor" class="ag-page-btn">⚡ Refactor Selection</button>
            <button id="ag-full-fix" class="ag-page-btn">🐛 Fix Error</button>
            <button id="ag-full-explain" class="ag-page-btn">📝 Explain Code</button>
            <button id="ag-full-test" class="ag-page-btn">🧪 Write Tests</button>
            <button id="ag-full-tui" class="ag-page-btn" style="grid-column: 1 / -1; background: #34a853; border: none;">🖥️ Launch Full Interactive TUI Terminal</button>
          </div>
        </div>

        <div class="ag-page-card">
          <div style="font-size: 13px; font-weight: bold;">💬 Antigravity Output Stream</div>
          <div id="ag-full-response" class="ag-page-response">Antigravity Native Engine is ready! Select code or type a prompt above.</div>
          
          <div class="ag-page-bar">
            <button id="ag-full-app-sel" class="ag-page-btn ag-page-btn-primary" style="flex: 1;">Replace Selection</button>
            <button id="ag-full-app-cur" class="ag-page-btn" style="flex: 1;">Insert at Cursor</button>
            <button id="ag-full-app-file" class="ag-page-btn" style="flex: 1;">Replace File</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  private static bindEvents(container: HTMLElement): void {
    const promptInput = container.querySelector('#ag-full-prompt') as HTMLTextAreaElement;
    const submitBtn = container.querySelector('#ag-full-submit');
    const refactorBtn = container.querySelector('#ag-full-refactor');
    const fixBtn = container.querySelector('#ag-full-fix');
    const explainBtn = container.querySelector('#ag-full-explain');
    const testBtn = container.querySelector('#ag-full-test');
    const tuiBtn = container.querySelector('#ag-full-tui');
    const responseArea = container.querySelector('#ag-full-response') as HTMLElement;

    const appSelBtn = container.querySelector('#ag-full-app-sel');
    const appCurBtn = container.querySelector('#ag-full-app-cur');
    const appFileBtn = container.querySelector('#ag-full-app-file');

    const runTask = async (action: 'refactor' | 'explain' | 'fix' | 'test' | 'custom', userPrompt?: string) => {
      if (responseArea) responseArea.innerText = '🤖 Antigravity is processing your request...';
      const res = await AgentBridgeService.executeTask({ action, prompt: userPrompt });
      this.lastResult = res.resultText || res.error || '';
      if (responseArea) responseArea.innerText = this.lastResult;
    };

    submitBtn?.addEventListener('click', () => runTask('custom', promptInput?.value || ''));
    refactorBtn?.addEventListener('click', () => runTask('refactor'));
    fixBtn?.addEventListener('click', () => runTask('fix'));
    explainBtn?.addEventListener('click', () => runTask('explain'));
    testBtn?.addEventListener('click', () => runTask('test'));

    tuiBtn?.addEventListener('click', () => {
      TerminalService.launchInTerminal();
    });

    const extractCode = (text: string): string => {
      const match = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
      return match ? match[1].trim() : text;
    };

    appSelBtn?.addEventListener('click', () => {
      if (this.lastResult) {
        EditorBridgeService.replaceSelection(extractCode(this.lastResult));
        if (typeof acode.pushNotification === 'function') {
          acode.pushNotification('Antigravity', 'Replaced selection in editor', { type: 'success' });
        }
      }
    });

    appCurBtn?.addEventListener('click', () => {
      if (this.lastResult) {
        EditorBridgeService.insertAtCursor(extractCode(this.lastResult));
        if (typeof acode.pushNotification === 'function') {
          acode.pushNotification('Antigravity', 'Inserted code at cursor', { type: 'success' });
        }
      }
    });

    appFileBtn?.addEventListener('click', () => {
      if (this.lastResult) {
        EditorBridgeService.updateActiveFileContent(extractCode(this.lastResult));
        if (typeof acode.pushNotification === 'function') {
          acode.pushNotification('Antigravity', 'Replaced entire file in editor', { type: 'success' });
        }
      }
    });
  }
}
