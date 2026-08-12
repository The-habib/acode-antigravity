import { TerminalService } from './services/terminal';
import { InstallerService } from './services/installer';
import { ScriptService } from './services/scripts';
import { StatusDialog } from './ui/statusDialog';

const PLUGIN_ID = 'com.acode.antigravity';

const COMMAND_NAMES = [
  'Antigravity: Launch',
  'Antigravity: Setup',
  'Antigravity: Check Installation',
  'Antigravity: Repair',
  'Antigravity: Update',
  'Antigravity: Show Environment',
  'Antigravity: Open Terminal',
];

class AcodeAntigravityPlugin {
  private baseUrl: string = '';
  private $page: any = null;

  public async init(baseUrl: string, $page: any, cache: any): Promise<void> {
    this.baseUrl = baseUrl;
    this.$page = $page;

    // Install shell scripts on first load
    await ScriptService.installShellScripts();

    // Register Acode Commands
    const commandsApi = acode.require('commands');
    if (commandsApi) {
      commandsApi.addCommand({
        name: 'Antigravity: Launch',
        description: 'Launch Google Antigravity CLI in Acode Terminal',
        bindKey: { win: 'Ctrl-Alt-A', mac: 'Command-Alt-A' },
        exec: () => {
          TerminalService.launchInTerminal();
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Setup',
        description: 'Run setup and configuration for Antigravity CLI',
        exec: async () => {
          const res = await InstallerService.runSetup();
          if (typeof acode.pushNotification === 'function') {
            acode.pushNotification('Antigravity Setup', res.message, { type: res.success ? 'success' : 'error' });
          }
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Check Installation',
        description: 'Check status and integrity of Antigravity CLI',
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
        description: 'Repair permissions and binary links for Antigravity CLI',
        exec: async () => {
          const res = await InstallerService.runRepair();
          if (typeof acode.pushNotification === 'function') {
            acode.pushNotification('Antigravity Repair', res.message, { type: res.success ? 'success' : 'error' });
          }
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Update',
        description: 'Check and install updates for Antigravity CLI',
        exec: async () => {
          const res = await InstallerService.runUpdate();
          if (typeof acode.pushNotification === 'function') {
            acode.pushNotification('Antigravity Update', res.message, { type: res.success ? 'success' : 'error' });
          }
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Show Environment',
        description: 'Show Antigravity status dialog and actions',
        exec: () => {
          StatusDialog.show();
        },
      });

      commandsApi.addCommand({
        name: 'Antigravity: Open Terminal',
        description: 'Open a new terminal tab in Acode',
        exec: () => {
          TerminalService.openTerminalSession();
        },
      });
    }

    if (typeof acode.pushNotification === 'function') {
      acode.pushNotification('Acode Antigravity', 'Plugin loaded. Run "agy" in terminal to start!', {
        type: 'info',
        autoClose: true,
      });
    }
  }

  public unmount(): void {
    const commandsApi = acode.require('commands');
    if (commandsApi) {
      for (const cmdName of COMMAND_NAMES) {
        try {
          commandsApi.removeCommand(cmdName);
        } catch (e) {
          // ignore if command not registered
        }
      }
    }
  }
}

const pluginInstance = new AcodeAntigravityPlugin();

acode.setPluginInit(
  PLUGIN_ID,
  (baseUrl: string, $page: any, cache: any) => {
    pluginInstance.init(baseUrl, $page, cache);
  },
  {
    list: [
      {
        key: 'autoSetup',
        text: 'Auto-run setup on plugin load',
        checkbox: true,
        value: true,
        cb: (key: string, value: any) => {
          console.log(`Setting changed: ${key} = ${value}`);
        },
      },
    ],
  }
);

acode.setPluginUnmount(PLUGIN_ID, () => {
  pluginInstance.unmount();
});
