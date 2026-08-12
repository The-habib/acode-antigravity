import { EnvService, EnvInfo } from '../services/env';
import { InstallerService } from '../services/installer';
import { TerminalService } from '../services/terminal';

export class StatusDialog {
  public static async show(): Promise<void> {
    const alertApi = acode.require('alert');
    const selectApi = acode.require('select');
    const loaderApi = acode.require('loader');

    if (loaderApi) loaderApi.show();
    const env: EnvInfo = await EnvService.detectEnv();
    if (loaderApi) loaderApi.hide();

    const title = 'Antigravity CLI Status';
    const message = `
=================================
  ACODE ANTIGRAVITY CLI STATUS
=================================
Status: ${env.statusMessage}
Version: ${env.version || 'Not Installed'}
Architecture: ${env.arch}
OS / Runtime: ${env.os} (${env.environment})
Launcher Path: ${env.launcherPath}
PATH Status: ${env.pathConfigured ? 'Configured' : 'Will be set on setup'}
    `.trim();

    if (!selectApi) {
      if (alertApi) {
        await alertApi(title, message);
      } else {
        alert(`${title}\n\n${message}`);
      }
      return;
    }

    const action = await selectApi(title, [
      ['launch', '🚀 Launch Antigravity in Terminal'],
      ['setup', '⚙️ Run Setup'],
      ['check', '🔍 Run Check Diagnostics'],
      ['repair', '🛠️ Run Repair'],
      ['update', '🔄 Run Update'],
      ['info', 'ℹ️ View Environment Details'],
    ]);

    if (!action) return;

    switch (action) {
      case 'launch':
        await TerminalService.launchInTerminal();
        break;

      case 'setup':
        if (loaderApi) loaderApi.show();
        const setupRes = await InstallerService.runSetup();
        if (loaderApi) loaderApi.hide();
        if (alertApi) {
          await alertApi('Antigravity Setup', setupRes.message);
        } else {
          alert(setupRes.message);
        }
        break;

      case 'check':
        if (loaderApi) loaderApi.show();
        const checkReport = await InstallerService.runCheck();
        if (loaderApi) loaderApi.hide();
        if (alertApi) {
          await alertApi('Antigravity Check', checkReport);
        } else {
          alert(checkReport);
        }
        break;

      case 'repair':
        if (loaderApi) loaderApi.show();
        const repairRes = await InstallerService.runRepair();
        if (loaderApi) loaderApi.hide();
        if (alertApi) {
          await alertApi('Antigravity Repair', repairRes.message);
        } else {
          alert(repairRes.message);
        }
        break;

      case 'update':
        if (loaderApi) loaderApi.show();
        const updateRes = await InstallerService.runUpdate();
        if (loaderApi) loaderApi.hide();
        if (alertApi) {
          await alertApi('Antigravity Update', updateRes.message);
        } else {
          alert(updateRes.message);
        }
        break;

      case 'info':
        if (alertApi) {
          await alertApi(title, message);
        } else {
          alert(`${title}\n\n${message}`);
        }
        break;
    }
  }
}
