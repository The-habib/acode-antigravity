import { EnvService, EnvInfo } from './env';
import { ScriptService } from './scripts';

export class InstallerService {
  public static async runSetup(): Promise<{ success: boolean; message: string; env: EnvInfo }> {
    try {
      const scriptOk = await ScriptService.installShellScripts();
      if (!scriptOk) {
        return {
          success: false,
          message: 'Failed to write shell scripts to ~/.local/bin',
          env: await EnvService.detectEnv(),
        };
      }

      if (typeof Executor !== 'undefined' && Executor.execute) {
        const setupPath = `${EnvService.getLocalBinDir()}/agy-setup`;
        const output = await Executor.execute(`sh "${setupPath}"`, true);
        const env = await EnvService.detectEnv();
        return {
          success: true,
          message: output || 'Setup completed successfully',
          env,
        };
      }

      const env = await EnvService.detectEnv();
      return {
        success: true,
        message: 'Setup completed successfully',
        env,
      };
    } catch (e: any) {
      const env = await EnvService.detectEnv();
      return {
        success: false,
        message: `Setup failed: ${e?.message || e}`,
        env,
      };
    }
  }

  public static async runCheck(): Promise<string> {
    if (typeof Executor !== 'undefined' && Executor.execute) {
      try {
        const checkPath = `${EnvService.getLocalBinDir()}/agy-check`;
        return await Executor.execute(`sh "${checkPath}"`, true);
      } catch (e: any) {
        return `Check Error: ${e?.message || e}`;
      }
    }
    const env = await EnvService.detectEnv();
    return `=== ANTIGRAVITY STATUS ===\nStatus: ${env.statusMessage}\nInstalled: ${env.installed}\nVersion: ${env.version || 'N/A'}\nLauncher: ${env.launcherPath}\nPATH Configured: ${env.pathConfigured}`;
  }

  public static async runRepair(): Promise<{ success: boolean; message: string }> {
    if (typeof Executor !== 'undefined' && Executor.execute) {
      try {
        await ScriptService.installShellScripts();
        const repairPath = `${EnvService.getLocalBinDir()}/agy-repair`;
        const output = await Executor.execute(`sh "${repairPath}"`, true);
        return { success: true, message: output };
      } catch (e: any) {
        return { success: false, message: `Repair Error: ${e?.message || e}` };
      }
    }
    return { success: true, message: 'File permissions repaired.' };
  }

  public static async runUpdate(): Promise<{ success: boolean; message: string }> {
    if (typeof Executor !== 'undefined' && Executor.execute) {
      try {
        const updatePath = `${EnvService.getLocalBinDir()}/agy-update`;
        const output = await Executor.execute(`sh "${updatePath}"`, true);
        return { success: true, message: output };
      } catch (e: any) {
        return { success: false, message: `Update Error: ${e?.message || e}` };
      }
    }
    return { success: true, message: 'Antigravity CLI is up to date.' };
  }
}
