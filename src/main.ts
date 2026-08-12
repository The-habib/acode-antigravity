import { TerminalService } from './services/terminal';
import { InstallerService } from './services/installer';
import { ScriptService } from './services/scripts';
import { SidebarPanel } from './ui/sidebarPanel';
import { ControlPage } from './ui/controlPage';
import { ContextMenuService } from './services/contextMenu';
import { EditorBridgeService } from './services/editorBridge';
import { AgentBridgeService } from './services/agentBridge';
import { StatusDialog } from './ui/statusDialog';

const PLUGIN_ID = 'com.acode.antigravity';

const COMMAND_NAMES = [
  'Antigravity: Open Control Window',
  'Antigravity: Sidebar Control Panel',
  'Antigravity: Refactor Selection',
  'Antigravity: Fix Code Bugs',
  'Antigravity: Explain Code',
  'Antigravity: Write Unit Tests',
  'Antigravity: Launch TUI Terminal',
  'Antigravity: Setup',
  'Antigravity: Check Installation',
  'Antigravity: Repair',
  'Antigravity: Update',
  'Antigravity: Show Environment',
];

class AcodeAntigravityPlugin {
  private baseUrl: string = '';
  private $page: any = null;

  public async init(baseUrl: string, $page: any, cache: any): Promise<void> {
    this.baseUrl = baseUrl;
    this.$page = $page;

    await ScriptService.installShellScripts();

    SidebarPanel.register();

    ContextMenuService.register();

    const commandsApi = acode.require('commands');
    if (commandsApi) {
      commandsApi.addCommand({
        name: 'Antigravity: Open Control Window',
        description: 'Open Google Antigravity Full Native Control Window',
        bindKey: { win: 'Ctrl-Alt-A', mac: 'Command-Alt-A' },
        exec: () => {
          ControlPage.show();
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Sidebar Control Panel',
        description: 'Open Google Antigravity Control Panel in Sidebar',
        exec: () => {
          const sideBarApps = acode.require('sidebarApps');
          if (sideBarApps && typeof sideBarApps.get === 'function') {
            const el = sideBarApps.get('acode_antigravity_control');
            if (el && el.parentElement) {
              el.parentElement.click();
            } else {
              ControlPage.show();
            }
          } else {
            ControlPage.show();
          }
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Refactor Selection',
        description: 'Ask Antigravity to refactor selected code',
        exec: async () => {
          if (typeof acode.pushNotification === 'function') {
            acode.pushNotification('Antigravity', 'Refactoring active code selection...', { type: 'info' });
          }
          const res = await AgentBridgeService.executeTask({ action: 'refactor' });
          if (res.success && res.resultText) {
            const match = res.resultText.match(/```(?:\w+)?\n([\s\S]*?)```/);
            const code = match ? match[1].trim() : res.resultText;
            EditorBridgeService.replaceSelection(code);
            if (typeof acode.pushNotification === 'function') {
              acode.pushNotification('Antigravity', 'Refactoring applied to editor!', { type: 'success' });
            }
          }
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Fix Code Bugs',
        description: 'Ask Antigravity to fix bugs in selected code',
        exec: async () => {
          if (typeof acode.pushNotification === 'function') {
            acode.pushNotification('Antigravity', 'Analyzing & fixing bugs...', { type: 'info' });
          }
          const res = await AgentBridgeService.executeTask({ action: 'fix' });
          if (res.success && res.resultText) {
            const match = res.resultText.match(/```(?:\w+)?\n([\s\S]*?)```/);
            const code = match ? match[1].trim() : res.resultText;
            EditorBridgeService.replaceSelection(code);
            if (typeof acode.pushNotification === 'function') {
              acode.pushNotification('Antigravity', 'Fixed code applied to editor!', { type: 'success' });
            }
          }
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Explain Code',
        description: 'Ask Antigravity to explain selected code',
        exec: async () => {
          const res = await AgentBridgeService.executeTask({ action: 'explain' });
          const alertApi = acode.require('alert');
          if (alertApi) {
            await alertApi('Antigravity Explanation', res.resultText);
          } else {
            alert(res.resultText);
          }
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Write Unit Tests',
        description: 'Ask Antigravity to generate unit tests',
        exec: async () => {
          const res = await AgentBridgeService.executeTask({ action: 'test' });
          const alertApi = acode.require('alert');
          if (alertApi) {
            await alertApi('Antigravity Generated Tests', res.resultText);
          } else {
            alert(res.resultText);
          }
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Launch TUI Terminal',
        description: 'Launch Google Antigravity in Acode Terminal',
        exec: () => {
          TerminalService.launchInTerminal();
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Setup',
        description: 'Run initial setup for Google Antigravity',
        exec: async () => {
          const res = await InstallerService.runSetup();
          if (typeof acode.pushNotification === 'function') {
            acode.pushNotification('Antigravity Setup', res.message, { type: res.success ? 'success' : 'error' });
          }
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Check Installation',
        description: 'Check status and integrity of Google Antigravity',
        exec: async () => {
          const report = await InstallerService.runCheck();
          const alertApi = acode.require('alert');
          if (alertApi) {
            await alertApi('Antigravity Status Check', report);
          } else {
            alert(report);
          }
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Repair',
        description: 'Repair dependencies and permissions for Antigravity',
        exec: async () => {
          const res = await InstallerService.runRepair();
          if (typeof acode.pushNotification === 'function') {
            acode.pushNotification('Antigravity Repair', res.message, { type: res.success ? 'success' : 'error' });
          }
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Update',
        description: 'Check and update Google Antigravity CLI',
        exec: async () => {
          const res = await InstallerService.runUpdate();
          if (typeof acode.pushNotification === 'function') {
            acode.pushNotification('Antigravity Update', res.message, { type: res.success ? 'success' : 'error' });
          }
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Show Environment',
        description: 'Show Google Antigravity status dialog and actions',
        exec: () => {
          StatusDialog.show();
        },
      });
    }

    if (typeof acode.pushNotification === 'function') {
      acode.pushNotification('Google Antigravity', 'Full Native Control Engine activated! Press Ctrl+Alt+A or tap Antigravity in sidebar/commands.', {
        type: 'success',
        autoClose: false,
      });
    }
  }

  public unmount(): void {
    SidebarPanel.unregister();

    ContextMenuService.unregister();

    const commandsApi = acode.require('commands');
    if (commandsApi) {
      for (const cmdName of COMMAND_NAMES) {
        try {
          commandsApi.removeCommand(cmdName);
        } catch (e) {
          // ignore
        }
      }
    }
  }
}

const pluginInstance = new AcodeAntigravityPlugin();

acode.setPluginInit(
  PLUGIN_ID,
  async (baseUrl: string, $page: any, cache: any) => {
    await pluginInstance.init(baseUrl, $page, cache);
  }
);

acode.setPluginUnmount(PLUGIN_ID, () => {
  pluginInstance.unmount();
});
