const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('  AUTONOMOUS END-TO-END VERIFICATION TEST SUITE     ');
console.log('  FOR ACODE GOOGLE ANTIGRAVITY NATIVE APP ENGINE   ');
console.log('====================================================');

let commandsRegistered = [];
let sidebarAppsRegistered = [];
let contextMenuItemsRegistered = [];
let sideButtonsRegistered = [];
let notificationLog = [];
const elements = new Map();

global.document = {
  getElementById: (id) => elements.get(id) || null,
  createElement: (tag) => {
    const el = {
      id: '',
      textContent: '',
      parentNode: {
        removeChild: (child) => elements.delete(child.id)
      }
    };
    return el;
  },
  head: {
    appendChild: (el) => {
      elements.set(el.id, el);
    }
  }
};

const mockAcode = {
  setPluginInit: (id, fn) => {
    global.__pluginInitFn = fn;
  },
  setPluginUnmount: (id, fn) => {
    global.__pluginUnmountFn = fn;
  },
  require: (module) => {
    if (module === 'commands') {
      return {
        addCommand: (cmd) => { commandsRegistered.push(cmd); },
        removeCommand: (name) => {
          commandsRegistered = commandsRegistered.filter(c => c.name !== name);
        }
      };
    }
    if (module === 'sidebarApps') {
      return {
        add: (icon, id, title, initFn, prepend, onSelected) => {
          sidebarAppsRegistered.push({ icon, id, title, initFn, onSelected });
        },
        get: (id) => {
          const app = sidebarAppsRegistered.find(s => s.id === id);
          if (!app) return null;
          return {
            parentElement: { click: () => app.onSelected && app.onSelected({ innerHTML: '', firstElementChild: null }) },
            click: () => app.onSelected && app.onSelected({ innerHTML: '', firstElementChild: null })
          };
        },
        remove: (id) => {
          sidebarAppsRegistered = sidebarAppsRegistered.filter(s => s.id !== id);
        }
      };
    }
    if (module === 'sideButton') {
      return (opts) => {
        sideButtonsRegistered.push(opts);
      };
    }
    if (module === 'contextMenu') {
      return {
        add: (text, action, condition) => {
          contextMenuItemsRegistered.push({ text, action, condition });
        },
        remove: (text) => {
          contextMenuItemsRegistered = contextMenuItemsRegistered.filter(c => c.text !== text);
        }
      };
    }
    if (module === 'alert') return async (t, m) => { console.log(`[MOCK ALERT] ${t}: ${m}`); };
    if (module === 'loader') return { show: () => {}, hide: () => {} };
    return null;
  },
  pushNotification: (t, m, opt) => {
    notificationLog.push({ title: t, message: m, options: opt });
    console.log(`[MOCK NOTIF] ${t}: ${m}`);
  }
};

global.acode = mockAcode;

let activeFileContent = 'function add(a, b) {\n  return a + b;\n}';
let activeSelection = 'return a + b;';

let createdFiles = [];

global.editorManager = {
  activeFile: {
    name: 'test.js',
    location: '/home/test.js',
    content: activeFileContent,
    setText: (t) => { activeFileContent = t; }
  },
  newFile: async (name, opts) => {
    createdFiles.push({ name, text: opts ? opts.text : '' });
  },
  editor: {
    getCopyText: () => activeSelection,
    insert: (t) => {
      activeFileContent = activeFileContent.replace(activeSelection, t);
      activeSelection = t;
    }
  }
};

global.Executor = {
  execute: async (cmd) => {
    console.log(`[MOCK EXECUTOR] Shell command: ${cmd.substring(0, 50)}...`);
    return '```js\nfunction add(a, b) {\n  // Refactored by Antigravity Native Engine\n  return Number(a) + Number(b);\n}\n```';
  }
};

(async () => {
  // 1. Verify Native agy CLI Binary Execution in Alpine
  console.log('\n[STEP 1/5] Testing Native agy CLI Binary Execution...');
  try {
    const agyVer = execSync('/home/.local/bin/agy --version || /home/.antigravity-acode/bin/antigravity --version').toString().trim();
    console.log(`  ✓ Native Antigravity Version: ${agyVer}`);
  } catch (e) {
    console.error(`  ✗ agy execution failed: ${e.message}`);
    process.exit(1);
  }

  // 2. Load Plugin Bundle & Initialize
  console.log('\n[STEP 2/5] Testing Acode Plugin Bundle Initialization...');
  const bundlePath = path.join(__dirname, '../dist/main.js');
  assert.ok(fs.existsSync(bundlePath), 'dist/main.js must exist!');
  require(bundlePath);

  assert.strictEqual(typeof global.__pluginInitFn, 'function', 'Plugin init function must be registered!');
  await global.__pluginInitFn('http://localhost', {}, {});
  console.log('  ✓ Plugin initialized & async tasks resolved successfully!');

  // 3. Verify Registered Commands, Sidebar Apps & Context Menus
  console.log('\n[STEP 3/5] Verifying Registered Hooks & Controls...');
  console.log(`  ✓ Commands Registered (${commandsRegistered.length}):`, commandsRegistered.map(c => c.name));
  console.log(`  ✓ Sidebar Apps Registered (${sidebarAppsRegistered.length}):`, sidebarAppsRegistered.map(s => s.title));
  console.log(`  ✓ Context Menus Registered (${contextMenuItemsRegistered.length}):`, contextMenuItemsRegistered.map(m => m.text));
  console.log(`  ✓ Side Buttons Registered (${sideButtonsRegistered.length}):`, sideButtonsRegistered.map(b => b.text));

  assert.ok(commandsRegistered.length >= 6, `Must register at least 6 commands! Found: ${commandsRegistered.length}`);
  assert.ok(sidebarAppsRegistered.length >= 1, 'Must register sidebar app!');
  assert.strictEqual(sidebarAppsRegistered[0].icon, 'icon antigravity', 'Sidebar app icon must be valid Acode class string!');
  assert.ok(contextMenuItemsRegistered.length >= 4, 'Must register 4 context menu items!');
  assert.ok(sideButtonsRegistered.length >= 1, 'Must register side button fallback!');

  const styleEl = global.document.getElementById('acode-antigravity-sidebar-style');
  assert.ok(styleEl, 'Icon CSS style element must be injected into document head!');
  assert.ok(styleEl.textContent.includes('.icon.antigravity'), 'CSS style content must define .icon.antigravity selector!');
  console.log('  ✓ Injected icon CSS style verified in document head!');

  // 4. Test Native Editor Control Execution
  console.log('\n[STEP 4/5] Simulating End-to-End Native Editor Control...');
  const refactorCmd = commandsRegistered.find(c => c.name === 'Antigravity: Refactor Selection');
  assert.ok(refactorCmd, 'Refactor selection command missing!');

  console.log(`  Initial Editor Content:\n${activeFileContent}`);
  await refactorCmd.exec();
  console.log(`  Updated Editor Content After Antigravity Refactor:\n${activeFileContent}`);

  assert.ok(activeFileContent.includes('Refactored by Antigravity Native Engine'), 'Active file content must be updated by Antigravity!');

  const createFileCmd = commandsRegistered.find(c => c.name === 'Antigravity: Create New File');
  assert.ok(createFileCmd, 'Create new file command missing!');
  await createFileCmd.exec();
  assert.ok(createdFiles.length > 0, 'New file should have been created!');
  console.log(`  ✓ Created new file in Acode editor: ${createdFiles[0].name}`);

  console.log('  ✓ End-to-End Editor Control Verified!');

  // 5. Test Unmount Teardown
  console.log('\n[STEP 5/5] Testing Plugin Unmount & Resource Teardown...');
  global.__pluginUnmountFn();
  assert.strictEqual(commandsRegistered.length, 0, 'Commands must be cleaned up on unmount!');
  assert.strictEqual(global.document.getElementById('acode-antigravity-sidebar-style'), null, 'Style element must be removed on unmount!');
  console.log('  ✓ Plugin unmounted cleanly!');

  console.log('\n====================================================');
  console.log('  ALL END-TO-END AUTONOMOUS VERIFICATION TESTS PASSED!');
  console.log('====================================================\n');
})();
