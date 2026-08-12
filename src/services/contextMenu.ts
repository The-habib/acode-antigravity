import { AgentBridgeService } from './agentBridge';
import { EditorBridgeService } from './editorBridge';

export class ContextMenuService {
  private static items: string[] = [
    'Google Antigravity: Refactor Code',
    'Google Antigravity: Explain Code',
    'Google Antigravity: Fix Bugs',
    'Google Antigravity: Generate Tests',
  ];

  public static register(): void {
    const contextMenu = acode.require('contextMenu');
    if (!contextMenu) return;

    try {
      contextMenu.add(
        'Google Antigravity: Refactor Code',
        async () => {
          if (typeof acode.pushNotification === 'function') {
            acode.pushNotification('Antigravity', 'Refactoring code...', { type: 'info' });
          }
          const res = await AgentBridgeService.executeTask({ action: 'refactor' });
          if (res.success && res.resultText) {
            const match = res.resultText.match(/```(?:\w+)?\n([\s\S]*?)```/);
            const code = match ? match[1].trim() : res.resultText;
            EditorBridgeService.replaceSelection(code);
            if (typeof acode.pushNotification === 'function') {
              acode.pushNotification('Antigravity', 'Code refactored successfully!', { type: 'success' });
            }
          }
        },
        () => {
          const info = EditorBridgeService.getActiveFileInfo();
          return !!info && info.hasSelection;
        }
      );

      contextMenu.add(
        'Google Antigravity: Explain Code',
        async () => {
          const res = await AgentBridgeService.executeTask({ action: 'explain' });
          const alertApi = acode.require('alert');
          if (alertApi) {
            await alertApi('Antigravity Explanation', res.resultText);
          } else {
            alert(res.resultText);
          }
        },
        () => {
          const info = EditorBridgeService.getActiveFileInfo();
          return !!info && info.hasSelection;
        }
      );

      contextMenu.add(
        'Google Antigravity: Fix Bugs',
        async () => {
          const res = await AgentBridgeService.executeTask({ action: 'fix' });
          if (res.success && res.resultText) {
            const match = res.resultText.match(/```(?:\w+)?\n([\s\S]*?)```/);
            const code = match ? match[1].trim() : res.resultText;
            EditorBridgeService.replaceSelection(code);
            if (typeof acode.pushNotification === 'function') {
              acode.pushNotification('Antigravity', 'Bugs fixed and code updated!', { type: 'success' });
            }
          }
        },
        () => {
          const info = EditorBridgeService.getActiveFileInfo();
          return !!info && info.hasSelection;
        }
      );

      contextMenu.add(
        'Google Antigravity: Generate Tests',
        async () => {
          const res = await AgentBridgeService.executeTask({ action: 'test' });
          const alertApi = acode.require('alert');
          if (alertApi) {
            await alertApi('Antigravity Generated Tests', res.resultText);
          } else {
            alert(res.resultText);
          }
        },
        () => {
          const info = EditorBridgeService.getActiveFileInfo();
          return !!info && info.hasSelection;
        }
      );
    } catch (e) {
      console.warn('Could not register context menu items:', e);
    }
  }

  public static unregister(): void {
    const contextMenu = acode.require('contextMenu');
    if (!contextMenu) return;
    for (const item of this.items) {
      try {
        contextMenu.remove(item);
      } catch (e) {
        // ignore
      }
    }
  }
}
