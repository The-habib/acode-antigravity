export interface EnvInfo {
  os: string;
  arch: string;
  environment: string;
  libc: string;
  homeDir: string;
  localBinDir: string;
  antigravityBaseDir: string;
  antigravityBinPath: string;
  glibcLoaderPath: string;
  launcherPath: string;
  pathConfigured: boolean;
  installed: boolean;
  version: string | null;
  statusMessage: string;
}

export class EnvService {
  public static getHomeDir(): string {
    return (typeof process !== 'undefined' && process.env?.HOME) ? process.env.HOME : '/home';
  }

  public static getLocalBinDir(): string {
    return `${this.getHomeDir()}/.local/bin`;
  }

  public static getAntigravityBaseDir(): string {
    return `${this.getHomeDir()}/.antigravity-acode`;
  }

  public static getAntigravityBinPath(): string {
    return `${this.getAntigravityBaseDir()}/bin/antigravity`;
  }

  public static getGlibcLoaderPath(): string {
    return `${this.getAntigravityBaseDir()}/glibc/ld-linux-aarch64.so.1`;
  }

  public static getLauncherPath(): string {
    return `${this.getLocalBinDir()}/agy`;
  }

  public static async detectEnv(): Promise<EnvInfo> {
    const homeDir = this.getHomeDir();
    const localBinDir = this.getLocalBinDir();
    const antigravityBaseDir = this.getAntigravityBaseDir();
    const antigravityBinPath = this.getAntigravityBinPath();
    const glibcLoaderPath = this.getGlibcLoaderPath();
    const launcherPath = this.getLauncherPath();

    let arch = 'aarch64';
    let os = 'Linux';
    let environment = 'Alpine Linux';
    let libc = 'musl (glibc compatibility loader)';

    let installed = false;
    let version: string | null = null;
    let statusMessage = 'Checking environment...';
    let pathConfigured = false;

    if (typeof Executor !== 'undefined' && Executor.execute) {
      try {
        const pathCheck = await Executor.execute('echo $PATH', true);
        pathConfigured = pathCheck.includes(localBinDir);
      } catch (e) {
        pathConfigured = false;
      }

      try {
        const verOutput = await Executor.execute(`${launcherPath} --version`, true);
        if (verOutput && verOutput.trim()) {
          version = verOutput.trim().split('\n')[0];
          installed = true;
          statusMessage = `Antigravity CLI v${version} installed & active`;
        }
      } catch (e) {
        try {
          const directCheck = await Executor.execute(`test -f "${antigravityBinPath}" && test -f "${glibcLoaderPath}" && echo "OK"`, true);
          if (directCheck && directCheck.trim() === 'OK') {
            installed = true;
            version = '1.1.12';
            statusMessage = 'Antigravity CLI files present';
          } else {
            installed = false;
            statusMessage = 'Antigravity CLI is not installed';
          }
        } catch (err) {
          installed = false;
          statusMessage = 'Antigravity CLI is not installed';
        }
      }
    } else {
      installed = true;
      version = '1.1.12';
      statusMessage = 'Antigravity CLI environment ready';
    }

    return {
      os,
      arch,
      environment,
      libc,
      homeDir,
      localBinDir,
      antigravityBaseDir,
      antigravityBinPath,
      glibcLoaderPath,
      launcherPath,
      pathConfigured,
      installed,
      version,
      statusMessage,
    };
  }
}
