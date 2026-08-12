import { ScriptService } from './scripts';

export class TerminalService {
  public static async launchInTerminal(workingDir?: string): Promise<boolean> {
    try {
      // Ensure launcher scripts are installed
      await ScriptService.installShellScripts();

      const terminalAPI = acode.require('terminal');
      if (!terminalAPI) {
        if (typeof acode.pushNotification === 'function') {
          acode.pushNotification('Antigravity', 'Acode Terminal API is unavailable', { type: 'error' });
        } else if (typeof toast === 'function') {
          toast('Acode Terminal API unavailable');
        }
        return false;
      }

      // Determine active project directory if not specified
      let dir = workingDir;
      if (!dir && typeof editorManager !== 'undefined' && editorManager?.activeFile?.location) {
        dir = editorManager.activeFile.location;
      }

      // Create a new server terminal session (connects to Alpine backend)
      let termInst = null;
      if (typeof terminalAPI.createServer === 'function') {
        termInst = await terminalAPI.createServer({ name: 'Antigravity CLI' });
      } else if (typeof terminalAPI.create === 'function') {
        termInst = await terminalAPI.create({ name: 'Antigravity CLI', serverMode: true });
      }

      if (!termInst || !termInst.id) {
        if (typeof acode.pushNotification === 'function') {
          acode.pushNotification('Antigravity', 'Could not open terminal tab', { type: 'error' });
        }
        return false;
      }

      // Give terminal a brief moment to initialize shell input buffer
      await new Promise((res) => setTimeout(res, 500));

      let cmd = 'agy\r';
      if (dir) {
        cmd = `cd "${dir}" && agy\r`;
      }

      terminalAPI.write(termInst.id, cmd);

      if (typeof acode.pushNotification === 'function') {
        acode.pushNotification('Antigravity', 'Antigravity CLI started in terminal', { type: 'success' });
      }
      return true;
    } catch (e: any) {
      console.error('Antigravity terminal launch error:', e);
      if (typeof acode.pushNotification === 'function') {
        acode.pushNotification('Antigravity', `Terminal Launch Error: ${e?.message || e}`, { type: 'error' });
      }
      return false;
    }
  }

  public static async openTerminalSession(): Promise<boolean> {
    try {
      const terminalAPI = acode.require('terminal');
      if (!terminalAPI) return false;

      let termInst = null;
      if (typeof terminalAPI.createServer === 'function') {
        termInst = await terminalAPI.createServer({ name: 'Terminal' });
      } else if (typeof terminalAPI.create === 'function') {
        termInst = await terminalAPI.create({ name: 'Terminal', serverMode: true });
      }
      return !!termInst;
    } catch (e) {
      return false;
    }
  }
}
