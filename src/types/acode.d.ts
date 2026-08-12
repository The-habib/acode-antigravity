export interface AcodeCommand {
  name: string;
  description?: string;
  bindKey?: { win?: string; mac?: string };
  exec: () => void;
}

export interface TerminalInstance {
  id: string;
  name: string;
  component: any;
  file: any;
  container: HTMLElement;
}

export interface TerminalAPI {
  create(options?: any): Promise<TerminalInstance>;
  createLocal(options?: any): Promise<TerminalInstance>;
  createServer(options?: any): Promise<TerminalInstance>;
  get(id: string): TerminalInstance | null;
  getAll(): Map<string, TerminalInstance>;
  write(id: string, data: string): void;
  clear(id: string): void;
  close(id: string): void;
  themes: any;
}

export interface CommandsAPI {
  addCommand(cmd: AcodeCommand): void;
  removeCommand(name: string): void;
}

export interface SidebarAppsAPI {
  add(
    icon: string,
    id: string,
    title: string,
    initFn: (container: HTMLElement) => void,
    prepend?: boolean,
    onSelected?: (container: HTMLElement) => void
  ): void;
  get(id: string): HTMLElement | null;
  remove(id: string): void;
}

export interface ContextMenuAPI {
  add(
    text: string,
    action: () => void,
    condition?: () => boolean,
    icon?: string
  ): void;
  remove(text: string): void;
}

export interface AcodeNotificationOptions {
  icon?: string;
  autoClose?: boolean;
  action?: () => void;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export interface AcodeSettingsItem {
  key: string;
  text: string;
  icon?: string;
  iconColor?: string;
  info?: string;
  value?: any;
  valueText?: (val: any) => string;
  checkbox?: boolean;
  select?: Array<Array<string> | string>;
  prompt?: boolean;
  promptType?: string;
  cb?: (key: string, value: any) => void;
}

export interface AcodeSettings {
  list: AcodeSettingsItem[];
}

export interface AcodeAPI {
  setPluginInit(pluginId: string, initFn: (baseUrl: string, $page: any, cache: any) => void, settings?: AcodeSettings): void;
  setPluginUnmount(pluginId: string, unmountFn: () => void): void;
  require(moduleName: 'terminal'): TerminalAPI;
  require(moduleName: 'commands'): CommandsAPI;
  require(moduleName: 'sidebarApps'): SidebarAppsAPI;
  require(moduleName: 'contextMenu'): ContextMenuAPI;
  require(moduleName: 'alert'): (title: string, message: string) => Promise<void>;
  require(moduleName: 'confirm'): (title: string, message: string) => Promise<boolean>;
  require(moduleName: 'prompt'): (title: string, defaultValue?: string, type?: string) => Promise<string | null>;
  require(moduleName: 'select'): (title: string, options: Array<[string, string] | string>) => Promise<string | null>;
  require(moduleName: 'loader'): { showTitleLoader(): void; hideTitleLoader(): void; show(): void; hide(): void; destroy(): void };
  require(moduleName: string): any;
  exec(commandName: string, val?: any): void;
  pushNotification(title: string, message: string, options?: AcodeNotificationOptions): void;
}

export interface ActiveFile {
  name: string;
  filename: string;
  location: string;
  uri: string;
  content: string;
  isUnsaved: boolean;
  session: any;
  setText(text: string): void;
  write(text: string): void;
  save(): Promise<void>;
}

export interface EditorManager {
  editor: any;
  activeFile: ActiveFile;
  files: ActiveFile[];
  openFile(uri: string, options?: any): Promise<ActiveFile>;
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
}

declare global {
  var acode: AcodeAPI;
  var editorManager: EditorManager;
  var Terminal: {
    isInstalled(): Promise<boolean>;
  };
  var Executor: {
    execute(command: string, alpine?: boolean): Promise<string>;
  };
  function toast(message: string): void;
}
