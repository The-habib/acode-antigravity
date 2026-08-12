import { EditorBridgeService } from './editorBridge';

export interface AgentTaskRequest {
  action: 'refactor' | 'explain' | 'fix' | 'test' | 'create' | 'custom';
  prompt?: string;
  codeContext?: string;
  fileName?: string;
}

export interface AgentTaskResponse {
  success: boolean;
  resultText: string;
  error?: string;
}

export class AgentBridgeService {
  public static async executeTask(request: AgentTaskRequest): Promise<AgentTaskResponse> {
    const fileInfo = EditorBridgeService.getActiveFileInfo();
    const contextCode = request.codeContext || (fileInfo ? (fileInfo.hasSelection ? fileInfo.selectedText : fileInfo.content) : '');
    const filename = request.fileName || (fileInfo ? fileInfo.name : 'workspace');

    let fullPrompt = '';

    switch (request.action) {
      case 'refactor':
        fullPrompt = `Refactor the following code snippet from file "${filename}" for maximum clarity, performance, and clean code standards. Return only the refactored code block:\n\n\`\`\`\n${contextCode}\n\`\`\``;
        break;

      case 'explain':
        fullPrompt = `Explain in clean Markdown how the following code from "${filename}" works:\n\n\`\`\`\n${contextCode}\n\`\`\``;
        break;

      case 'fix':
        fullPrompt = `Identify and fix any syntax errors, logic bugs, or vulnerabilities in the following code from "${filename}". Return the fixed code block and a concise summary:\n\n\`\`\`\n${contextCode}\n\`\`\``;
        break;

      case 'test':
        fullPrompt = `Write complete unit tests for the following code snippet from "${filename}":\n\n\`\`\`\n${contextCode}\n\`\`\``;
        break;

      case 'create':
        fullPrompt = `Create a new file based on prompt: "${request.prompt || 'Generate code'}". Return complete source code inside a code block.`;
        break;

      case 'custom':
        fullPrompt = `${request.prompt || 'Analyze and assist with code'}\n\nContext File: ${filename}\n\`\`\`\n${contextCode}\n\`\`\``;
        break;
    }

    if (typeof Executor !== 'undefined' && Executor.execute) {
      try {
        const b64Prompt = typeof btoa !== 'undefined' ? btoa(fullPrompt) : Buffer.from(fullPrompt).toString('base64');
        const cmd = `agy -p "$(echo '${b64Prompt}' | base64 -d)" 2>&1 || agy 2>&1`;
        const output = await Executor.execute(cmd, true);
        return {
          success: true,
          resultText: output || 'Agent finished task execution.',
        };
      } catch (e: any) {
        return {
          success: false,
          resultText: '',
          error: e?.message || String(e),
        };
      }
    }

    return {
      success: true,
      resultText: `[Google Antigravity Native Engine]\n\nTask: ${request.action.toUpperCase()}\nFile: ${filename}\n\nAntigravity is ready in your Acode workspace! Run 'agy' in terminal for interactive sessions.`,
    };
  }
}
