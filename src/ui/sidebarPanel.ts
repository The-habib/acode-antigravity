import { EditorBridgeService } from '../services/editorBridge';
import { AgentBridgeService } from '../services/agentBridge';
import { TerminalService } from '../services/terminal';

export class SidebarPanel {
  private static container: HTMLElement | null = null;
  private static responseArea: HTMLElement | null = null;
  private static statusText: HTMLElement | null = null;
  private static lastResult: string = '';

  public static register(): void {
    const sidebarApps = acode.require('sidebarApps');
    if (!sidebarApps) return;

    try {
      sidebarApps.add(
        'icon-antigravity',
        'acode_antigravity_control',
        'Google Antigravity',
        (container) => {
          this.container = container;
          this.renderUI(container);
        },
        true,
        () => {
          this.updateContextInfo();
        }
      );
    } catch (e) {
      console.warn('Could not register sidebar app:', e);
    }
  }

  private static renderUI(container: HTMLElement): void {
    container.innerHTML = `
      <style>
        .ag-panel {
          padding: 12px;
          color: var(--text-color, #ffffff);
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100%;
          box-sizing: border-box;
          overflow-y: auto;
        }
        .ag-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          font-size: 14px;
          border-bottom: 1px solid var(--border-color, #333);
          padding-bottom: 8px;
        }
        .ag-badge {
          background: #4285f4;
          color: #fff;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .ag-context-info {
          font-size: 11px;
          opacity: 0.8;
          background: rgba(255,255,255,0.05);
          padding: 6px;
          border-radius: 4px;
        }
        .ag-input {
          width: 100%;
          min-height: 60px;
          background: var(--dark-color, #1e1e1e);
          color: #fff;
          border: 1px solid var(--border-color, #444);
          border-radius: 6px;
          padding: 8px;
          box-sizing: border-box;
          font-size: 12px;
          resize: vertical;
        }
        .ag-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .ag-btn {
          background: var(--button-background-color, #2d2d2d);
          color: var(--button-text-color, #fff);
          border: 1px solid var(--border-color, #444);
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .ag-btn:active {
          opacity: 0.7;
        }
        .ag-btn-primary {
          background: #4285f4;
          color: #fff;
          border: none;
          grid-column: span 2;
        }
        .ag-response {
          background: var(--dark-color, #1e1e1e);
          border: 1px solid var(--border-color, #333);
          border-radius: 6px;
          padding: 8px;
          font-size: 11px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-word;
          min-height: 100px;
          max-height: 250px;
          overflow-y: auto;
          font-family: monospace;
        }
        .ag-apply-bar {
          display: flex;
          gap: 6px;
        }
        .ag-apply-btn {
          flex: 1;
          font-size: 10px;
          padding: 6px;
        }
      </style>
      <div class="ag-panel">
        <div class="ag-header">
          <span>🚀 Google Antigravity</span>
          <span class="ag-badge">Native Engine</span>
        </div>

        <div id="ag-context-status" class="ag-context-info">
          No file active in editor
        </div>

        <textarea id="ag-prompt-input" class="ag-input" placeholder="Ask Antigravity to generate, refactor, or edit code..."></textarea>

        <div class="ag-actions-grid">
          <button id="ag-submit-btn" class="ag-btn ag-btn-primary">🤖 Ask Antigravity</button>
          <button id="ag-refactor-btn" class="ag-btn">⚡ Refactor</button>
          <button id="ag-fix-btn" class="ag-btn">🐛 Fix Error</button>
          <button id="ag-explain-btn" class="ag-btn">📝 Explain</button>
          <button id="ag-test-btn" class="ag-btn">🧪 Write Tests</button>
          <button id="ag-term-btn" class="ag-btn" style="grid-column: span 2;">🖥️ Open Full TUI Terminal</button>
        </div>

        <div id="ag-response-area" class="ag-response">
          Antigravity Native Engine ready. Highlight code or type a prompt above to control Acode!
        </div>

        <div class="ag-apply-bar">
          <button id="ag-apply-sel" class="ag-btn ag-apply-btn">Replace Selection</button>
          <button id="ag-apply-cursor" class="ag-btn ag-apply-btn">Insert at Cursor</button>
          <button id="ag-apply-file" class="ag-btn ag-apply-btn">Replace File</button>
        </div>
      </div>
    `;

    this.responseArea = container.querySelector('#ag-response-area');
    this.statusText = container.querySelector('#ag-context-status');

    this.bindEvents(container);
    this.updateContextInfo();
  }

  private static updateContextInfo(): void {
    if (!this.statusText) return;
    const fileInfo = EditorBridgeService.getActiveFileInfo();
    if (!fileInfo) {
      this.statusText.innerText = 'No file open in Acode';
      return;
    }

    if (fileInfo.hasSelection) {
      this.statusText.innerText = `📄 ${fileInfo.name} (Selection: ${fileInfo.selectedText.length} chars)`;
    } else {
      this.statusText.innerText = `📄 ${fileInfo.name} (${fileInfo.content.length} chars)`;
    }
  }

  private static bindEvents(container: HTMLElement): void {
    const promptInput = container.querySelector('#ag-prompt-input') as HTMLTextAreaElement;
    const submitBtn = container.querySelector('#ag-submit-btn');
    const refactorBtn = container.querySelector('#ag-refactor-btn');
    const fixBtn = container.querySelector('#ag-fix-btn');
    const explainBtn = container.querySelector('#ag-explain-btn');
    const testBtn = container.querySelector('#ag-test-btn');
    const termBtn = container.querySelector('#ag-term-btn');

    const applySelBtn = container.querySelector('#ag-apply-sel');
    const applyCursorBtn = container.querySelector('#ag-apply-cursor');
    const applyFileBtn = container.querySelector('#ag-apply-file');

    submitBtn?.addEventListener('click', () => {
      const prompt = promptInput?.value || '';
      this.runAction('custom', prompt);
    });

    refactorBtn?.addEventListener('click', () => this.runAction('refactor'));
    fixBtn?.addEventListener('click', () => this.runAction('fix'));
    explainBtn?.addEventListener('click', () => this.runAction('explain'));
    testBtn?.addEventListener('click', () => this.runAction('test'));

    termBtn?.addEventListener('click', () => {
      TerminalService.launchInTerminal();
    });

    applySelBtn?.addEventListener('click', () => {
      if (this.lastResult) {
        const cleaned = this.extractCode(this.lastResult);
        EditorBridgeService.replaceSelection(cleaned);
        if (typeof acode.pushNotification === 'function') {
          acode.pushNotification('Antigravity', 'Replaced selection in editor', { type: 'success' });
        }
      }
    });

    applyCursorBtn?.addEventListener('click', () => {
      if (this.lastResult) {
        const cleaned = this.extractCode(this.lastResult);
        EditorBridgeService.insertAtCursor(cleaned);
        if (typeof acode.pushNotification === 'function') {
          acode.pushNotification('Antigravity', 'Inserted code at cursor', { type: 'success' });
        }
      }
    });

    applyFileBtn?.addEventListener('click', () => {
      if (this.lastResult) {
        const cleaned = this.extractCode(this.lastResult);
        EditorBridgeService.updateActiveFileContent(cleaned);
        if (typeof acode.pushNotification === 'function') {
          acode.pushNotification('Antigravity', 'Replaced entire file in editor', { type: 'success' });
        }
      }
    });
  }

  private static extractCode(text: string): string {
    const match = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return text;
  }

  private static async runAction(action: 'refactor' | 'explain' | 'fix' | 'test' | 'custom', prompt?: string): Promise<void> {
    if (this.responseArea) {
      this.responseArea.innerText = '🤖 Antigravity is processing...';
    }

    const res = await AgentBridgeService.executeTask({ action, prompt });
    this.lastResult = res.resultText || res.error || '';

    if (this.responseArea) {
      this.responseArea.innerText = this.lastResult;
    }
  }

  public static unregister(): void {
    const sidebarApps = acode.require('sidebarApps');
    if (sidebarApps) {
      try {
        sidebarApps.remove('acode_antigravity_control');
      } catch (e) {
        // ignore
      }
    }
  }
}
