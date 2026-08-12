import { EditorBridgeService } from '../services/editorBridge';
import { AgentBridgeService, ChatMessage } from '../services/agentBridge';
import { TerminalService } from '../services/terminal';

export class ControlPage {
  private static pageInstance: any = null;
  private static messages: ChatMessage[] = [];
  private static chatStream: HTMLElement | null = null;

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
    const contextName = fileInfo ? fileInfo.name : 'No active file';
    const contextLength = fileInfo ? (fileInfo.hasSelection ? `${fileInfo.selectedText.length} selected chars` : `${fileInfo.content.length} chars`) : '';

    container.innerHTML = `
      <style>
        .ag-page-container {
          padding: 14px;
          color: #ffffff;
          background: #121212;
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100%;
          box-sizing: border-box;
        }
        .ag-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #333;
          padding-bottom: 8px;
        }
        .ag-page-title {
          font-size: 16px;
          font-weight: bold;
          color: #4285f4;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ag-page-badge {
          background: #34a853;
          color: #fff;
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 600;
        }
        .ag-page-context {
          font-size: 11px;
          opacity: 0.85;
          background: #1e1e1e;
          padding: 6px 10px;
          border-radius: 4px;
          border-left: 3px solid #4285f4;
        }
        .ag-page-stream {
          flex: 1;
          background: #181818;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 200px;
        }
        .ag-msg {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 90%;
        }
        .ag-msg-user {
          align-self: flex-end;
        }
        .ag-msg-agent {
          align-self: flex-start;
        }
        .ag-bubble {
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .ag-bubble-user {
          background: #1a73e8;
          color: #fff;
          border-bottom-right-radius: 2px;
        }
        .ag-bubble-agent {
          background: #252526;
          color: #e0e0e0;
          border: 1px solid #333;
          border-bottom-left-radius: 2px;
        }
        .ag-msg-time {
          font-size: 9px;
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
          font-size: 10px;
          font-family: monospace;
          color: #aaa;
        }
        .ag-code-body {
          padding: 10px;
          font-family: monospace;
          font-size: 11px;
          white-space: pre;
          overflow-x: auto;
          color: #4ec9b0;
        }
        .ag-code-actions {
          display: flex;
          gap: 6px;
          padding: 6px 8px;
          background: #1e1e1e;
          border-top: 1px solid #333;
        }
        .ag-mini-btn {
          background: #333;
          color: #fff;
          border: 1px solid #444;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          cursor: pointer;
        }
        .ag-chips-row {
          display: flex;
          gap: 6px;
          overflow-x: auto;
        }
        .ag-chip {
          background: #2d2d2d;
          color: #fff;
          border: 1px solid #444;
          padding: 6px 12px;
          border-radius: 14px;
          font-size: 11px;
          cursor: pointer;
          white-space: nowrap;
        }
        .ag-input-box {
          display: flex;
          gap: 8px;
        }
        .ag-input {
          flex: 1;
          min-height: 50px;
          max-height: 120px;
          background: #1e1e1e;
          color: #fff;
          border: 1px solid #444;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 12px;
          resize: vertical;
        }
        .ag-send-btn {
          background: #4285f4;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 0 16px;
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
        }
      </style>

      <div class="ag-page-container">
        <div class="ag-page-header">
          <div class="ag-page-title">
            <span>🚀 Google Antigravity Chat</span>
          </div>
          <span class="ag-page-badge">Full Native Engine</span>
        </div>

        <div class="ag-page-context">
          📌 <strong>Active Workspace Context:</strong> ${contextName} (${contextLength})
        </div>

        <div id="ag-full-chat-stream" class="ag-page-stream"></div>

        <div class="ag-chips-row">
          <button id="full-chip-refactor" class="ag-chip">⚡ Refactor Selection</button>
          <button id="full-chip-fix" class="ag-chip">🐛 Fix Code Bugs</button>
          <button id="full-chip-explain" class="ag-chip">📝 Explain Code</button>
          <button id="full-chip-test" class="ag-chip">🧪 Generate Unit Tests</button>
          <button id="full-chip-tui" class="ag-chip" style="background:#34a853;">💻 Launch TUI Terminal</button>
          <button id="full-chip-clear" class="ag-chip" style="background:#555;">🗑️ Clear Chat</button>
        </div>

        <div class="ag-input-box">
          <textarea id="ag-full-chat-input" class="ag-input" placeholder="Type instructions or questions for Google Antigravity CLI..."></textarea>
          <button id="ag-full-send-btn" class="ag-send-btn">Send</button>
        </div>
      </div>
    `;

    this.chatStream = container.querySelector('#ag-full-chat-stream');

    if (this.messages.length === 0) {
      this.addMessage('agent', 'Hello! Google Antigravity CLI Full Control Engine is active. How can I assist you with your project?');
    } else {
      this.renderMessages();
    }

    this.bindEvents(container);
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
    const input = container.querySelector('#ag-full-chat-input') as HTMLTextAreaElement;
    const sendBtn = container.querySelector('#ag-full-send-btn');

    const chipRefactor = container.querySelector('#full-chip-refactor');
    const chipFix = container.querySelector('#full-chip-fix');
    const chipExplain = container.querySelector('#full-chip-explain');
    const chipTest = container.querySelector('#full-chip-test');
    const chipTui = container.querySelector('#full-chip-tui');
    const chipClear = container.querySelector('#full-chip-clear');

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
    chipTui?.addEventListener('click', () => TerminalService.launchInTerminal());
    chipClear?.addEventListener('click', () => {
      this.messages = [];
      this.addMessage('agent', 'Chat cleared. How can I assist you?');
    });
  }
}
