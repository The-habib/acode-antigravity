import { EditorBridgeService } from '../services/editorBridge';
import { AgentBridgeService, ChatMessage } from '../services/agentBridge';
import { TerminalService } from '../services/terminal';
import { ControlPage } from './controlPage';

export class SidebarPanel {
  private static container: HTMLElement | null = null;
  private static chatStream: HTMLElement | null = null;
  private static statusText: HTMLElement | null = null;
  private static messages: ChatMessage[] = [];

  public static register(): void {
    const sidebarApps = acode.require('sidebarApps');
    if (!sidebarApps) return;

    this.injectStyles();

    try {
      sidebarApps.add(
        'icon build icon-antigravity',
        'acode_antigravity_control',
        'Google Antigravity',
        (container: HTMLElement) => {
          container.classList.add('scroll');
          this.container = container;
          this.renderUI(container);
        },
        true,
        (container: HTMLElement) => {
          container.classList.add('scroll');
          this.container = container;
          if (!container.children || container.children.length === 0) {
            this.renderUI(container);
          }
          this.updateContextInfo();
        }
      );
    } catch (e) {
      console.warn('Could not register sidebar app:', e);
    }
  }

  private static injectStyles(): void {
    if (typeof document === 'undefined' || !document.head) return;
    const styleId = 'ag-sidebar-style';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .icon-antigravity {
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234285f4"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>') !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        background-size: contain !important;
        min-width: 24px !important;
        min-height: 24px !important;
        display: inline-block !important;
        pointer-events: auto !important;
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(style);
  }

  private static renderUI(container: HTMLElement): void {
    container.innerHTML = `
      <style>
        .ag-chat-panel {
          padding: 10px;
          color: var(--text-color, #ffffff);
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: 100%;
          box-sizing: border-box;
          pointer-events: auto;
        }
        .ag-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color, #333);
          padding-bottom: 6px;
        }
        .ag-chat-title {
          font-weight: bold;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #4285f4;
        }
        .ag-badge {
          background: #34a853;
          color: #fff;
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .ag-context-pill {
          font-size: 10px;
          opacity: 0.85;
          background: rgba(255,255,255,0.06);
          padding: 4px 8px;
          border-radius: 4px;
          border-left: 3px solid #4285f4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ag-chat-stream {
          flex: 1;
          min-height: 180px;
          max-height: 380px;
          background: var(--dark-color, #181818);
          border: 1px solid var(--border-color, #333);
          border-radius: 6px;
          padding: 8px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ag-msg {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 92%;
        }
        .ag-msg-user {
          align-self: flex-end;
        }
        .ag-msg-agent {
          align-self: flex-start;
        }
        .ag-bubble {
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 11px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .ag-bubble-user {
          background: #1a73e8;
          color: #ffffff;
          border-bottom-right-radius: 2px;
        }
        .ag-bubble-agent {
          background: #252526;
          color: #e0e0e0;
          border: 1px solid #333;
          border-bottom-left-radius: 2px;
        }
        .ag-msg-time {
          font-size: 8px;
          opacity: 0.5;
          align-self: flex-end;
        }
        .ag-code-box {
          background: #121212;
          border: 1px solid #3c3c3c;
          border-radius: 6px;
          margin-top: 6px;
          overflow: hidden;
        }
        .ag-code-header {
          background: #2d2d2d;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 9px;
          font-family: monospace;
          color: #aaa;
        }
        .ag-code-body {
          padding: 8px;
          font-family: monospace;
          font-size: 10px;
          white-space: pre;
          overflow-x: auto;
          color: #4ec9b0;
        }
        .ag-code-actions {
          display: flex;
          gap: 4px;
          padding: 4px 6px;
          background: #1e1e1e;
          border-top: 1px solid #333;
        }
        .ag-mini-btn {
          background: #333;
          color: #fff;
          border: 1px solid #444;
          padding: 3px 6px;
          border-radius: 3px;
          font-size: 9px;
          cursor: pointer;
        }
        .ag-chips-row {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .ag-chip {
          background: var(--button-background-color, #2d2d2d);
          color: #fff;
          border: 1px solid var(--border-color, #444);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          cursor: pointer;
          white-space: nowrap;
        }
        .ag-input-box {
          display: flex;
          gap: 6px;
        }
        .ag-input {
          flex: 1;
          min-height: 40px;
          max-height: 90px;
          background: var(--dark-color, #1e1e1e);
          color: #fff;
          border: 1px solid var(--border-color, #444);
          border-radius: 6px;
          padding: 6px 8px;
          font-size: 11px;
          resize: vertical;
        }
        .ag-send-btn {
          background: #4285f4;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 0 12px;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
        }
        .ag-footer-tools {
          display: flex;
          gap: 4px;
        }
        .ag-tool-btn {
          flex: 1;
          font-size: 10px;
          padding: 6px;
          background: #252526;
          color: #fff;
          border: 1px solid #333;
          border-radius: 4px;
          cursor: pointer;
          text-align: center;
        }
      </style>

      <div class="ag-chat-panel">
        <div class="ag-chat-header">
          <div class="ag-chat-title">
            <span>💬 Antigravity CLI Chat</span>
          </div>
          <span class="ag-badge">Official CLI</span>
        </div>

        <div id="ag-context-status" class="ag-context-pill">
          📄 Workspace context ready
        </div>

        <div id="ag-chat-stream" class="ag-chat-stream">
          <!-- Messages rendered dynamically -->
        </div>

        <div class="ag-chips-row">
          <button id="chip-refactor" class="ag-chip">⚡ Refactor</button>
          <button id="chip-fix" class="ag-chip">🐛 Fix Bug</button>
          <button id="chip-explain" class="ag-chip">📝 Explain</button>
          <button id="chip-test" class="ag-chip">🧪 Unit Tests</button>
          <button id="chip-clear" class="ag-chip" style="background:#555;">🗑️ Clear</button>
        </div>

        <div class="ag-input-box">
          <textarea id="ag-chat-input" class="ag-input" placeholder="Chat with Antigravity CLI..."></textarea>
          <button id="ag-send-btn" class="ag-send-btn">Send</button>
        </div>

        <div class="ag-footer-tools">
          <button id="ag-full-window-btn" class="ag-tool-btn" style="background: #34a853;">🖥️ Full Window</button>
          <button id="ag-terminal-btn" class="ag-tool-btn">💻 TUI Terminal</button>
        </div>
      </div>
    `;

    this.chatStream = container.querySelector('#ag-chat-stream');
    this.statusText = container.querySelector('#ag-context-status');

    if (this.messages.length === 0) {
      this.addMessage('agent', 'Hello! I am Google Antigravity CLI running natively in Acode. How can I help you with your code today?');
    } else {
      this.renderMessages();
    }

    this.bindEvents(container);
    this.updateContextInfo();
  }

  private static updateContextInfo(): void {
    if (!this.statusText) return;
    const fileInfo = EditorBridgeService.getActiveFileInfo();
    if (!fileInfo) {
      this.statusText.innerText = '📄 No active file open';
      return;
    }

    if (fileInfo.hasSelection) {
      this.statusText.innerText = `📄 ${fileInfo.name} (${fileInfo.selectedText.length} selected chars)`;
    } else {
      this.statusText.innerText = `📄 ${fileInfo.name} (${fileInfo.content.length} chars)`;
    }
  }

  private static addMessage(sender: 'user' | 'agent', text: string): void {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg: ChatMessage = {
      id: String(Date.now()),
      sender,
      text,
      timestamp: time,
    };
    this.messages.push(msg);
    this.renderMessages();
  }

  private static renderMessages(): void {
    if (!this.chatStream) return;
    this.chatStream.innerHTML = '';

    for (const msg of this.messages) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `ag-msg ag-msg-${msg.sender}`;

      const bubble = document.createElement('div');
      bubble.className = `ag-bubble ag-bubble-${msg.sender}`;

      if (msg.sender === 'agent') {
        bubble.appendChild(this.formatMarkdownAndCode(msg.text));
      } else {
        bubble.innerText = msg.text;
      }

      const timeDiv = document.createElement('div');
      timeDiv.className = 'ag-msg-time';
      timeDiv.innerText = msg.timestamp;

      msgDiv.appendChild(bubble);
      msgDiv.appendChild(timeDiv);
      this.chatStream.appendChild(msgDiv);
    }

    this.chatStream.scrollTop = this.chatStream.scrollHeight;
  }

  private static formatMarkdownAndCode(text: string): HTMLElement {
    const container = document.createElement('div');

    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textSegment = document.createElement('span');
        textSegment.innerText = text.substring(lastIndex, match.index);
        container.appendChild(textSegment);
      }

      const codeSnippet = match[1].trim();

      const codeBox = document.createElement('div');
      codeBox.className = 'ag-code-box';

      const codeHeader = document.createElement('div');
      codeHeader.className = 'ag-code-header';
      codeHeader.innerText = 'CODE SNIPPET';

      const codeBody = document.createElement('div');
      codeBody.className = 'ag-code-body';
      codeBody.innerText = codeSnippet;

      const actionsBar = document.createElement('div');
      actionsBar.className = 'ag-code-actions';

      const btnReplaceSel = document.createElement('button');
      btnReplaceSel.className = 'ag-mini-btn';
      btnReplaceSel.innerText = '⚡ Replace Selection';
      btnReplaceSel.onclick = () => {
        EditorBridgeService.replaceSelection(codeSnippet);
        if (typeof acode.pushNotification === 'function') {
          acode.pushNotification('Antigravity', 'Replaced selection in editor', { type: 'success' });
        }
      };

      const btnInsertCursor = document.createElement('button');
      btnInsertCursor.className = 'ag-mini-btn';
      btnInsertCursor.innerText = '📥 Insert at Cursor';
      btnInsertCursor.onclick = () => {
        EditorBridgeService.insertAtCursor(codeSnippet);
        if (typeof acode.pushNotification === 'function') {
          acode.pushNotification('Antigravity', 'Inserted code at cursor', { type: 'success' });
        }
      };

      const btnReplaceFile = document.createElement('button');
      btnReplaceFile.className = 'ag-mini-btn';
      btnReplaceFile.innerText = '📄 Replace File';
      btnReplaceFile.onclick = () => {
        EditorBridgeService.updateActiveFileContent(codeSnippet);
        if (typeof acode.pushNotification === 'function') {
          acode.pushNotification('Antigravity', 'Replaced file in editor', { type: 'success' });
        }
      };

      actionsBar.appendChild(btnReplaceSel);
      actionsBar.appendChild(btnInsertCursor);
      actionsBar.appendChild(btnReplaceFile);

      codeBox.appendChild(codeHeader);
      codeBox.appendChild(codeBody);
      codeBox.appendChild(actionsBar);

      container.appendChild(codeBox);
      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      const remainingText = document.createElement('span');
      remainingText.innerText = text.substring(lastIndex);
      container.appendChild(remainingText);
    }

    return container;
  }

  private static bindEvents(container: HTMLElement): void {
    const input = container.querySelector('#ag-chat-input') as HTMLTextAreaElement;
    const sendBtn = container.querySelector('#ag-send-btn');

    const chipRefactor = container.querySelector('#chip-refactor');
    const chipFix = container.querySelector('#chip-fix');
    const chipExplain = container.querySelector('#chip-explain');
    const chipTest = container.querySelector('#chip-test');
    const chipClear = container.querySelector('#chip-clear');

    const fullWindowBtn = container.querySelector('#ag-full-window-btn');
    const terminalBtn = container.querySelector('#ag-terminal-btn');

    const sendUserMessage = async (action: 'chat' | 'refactor' | 'explain' | 'fix' | 'test', promptText?: string) => {
      const text = promptText || input?.value || '';
      if (!text.trim() && action === 'chat') return;

      if (action === 'chat') {
        this.addMessage('user', text);
        if (input) input.value = '';
      } else {
        this.addMessage('user', `[Action: ${action.toUpperCase()}] ${text}`);
      }

      this.addMessage('agent', '🤖 Antigravity CLI is thinking...');

      const res = await AgentBridgeService.executeTask({ action, prompt: text });
      
      // Remove loading message
      this.messages.pop();
      this.addMessage('agent', res.resultText || res.error || 'Done.');
    };

    sendBtn?.addEventListener('click', () => sendUserMessage('chat'));

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage('chat');
      }
    });

    chipRefactor?.addEventListener('click', () => sendUserMessage('refactor'));
    chipFix?.addEventListener('click', () => sendUserMessage('fix'));
    chipExplain?.addEventListener('click', () => sendUserMessage('explain'));
    chipTest?.addEventListener('click', () => sendUserMessage('test'));
    chipClear?.addEventListener('click', () => {
      this.messages = [];
      this.addMessage('agent', 'Chat cleared. How can I assist you?');
    });

    fullWindowBtn?.addEventListener('click', () => ControlPage.show());
    terminalBtn?.addEventListener('click', () => TerminalService.launchInTerminal());
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
