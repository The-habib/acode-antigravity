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
let notificationLog = [];

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
        remove: (id) => {
          sidebarAppsRegistered = sidebarAppsRegistered.filter(s => s.id !== id);
        }
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
    if (module === 'page') {
      return (title) => ({
        body: { innerHTML: '', querySelector: () => null, addEventListener: () => {} },
        show: () => { console.log(`[MOCK PAGE SHOW] ${title}`); },
        hide: () => {}
      });
    }
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

global.editorManager = {
  activeFile: {
    name: 'test.js',
    location: '/home/test.js',
    content: activeFileContent,
    setText: (t) => { activeFileContent = t; }
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

  assert.ok(commandsRegistered.length >= 6, `Must register at least 6 commands! Found: ${commandsRegistered.length}`);
  assert.ok(sidebarAppsRegistered.length >= 1, 'Must register sidebar app!');
  assert.strictEqual(sidebarAppsRegistered[0].icon, 'icon build icon-antigravity', 'Sidebar app icon must be valid Acode class string!');
  assert.ok(contextMenuItemsRegistered.length >= 4, 'Must register 4 context menu items!');

  // 4. Test Native Editor Control Execution
  console.log('\n[STEP 4/5] Simulating End-to-End Native Editor Refactoring...');
  const refactorCmd = commandsRegistered.find(c => c.name === 'Antigravity: Refactor Selection');
  assert.ok(refactorCmd, 'Refactor selection command missing!');

  console.log(`  Initial Editor Content:\n${activeFileContent}`);
  await refactorCmd.exec();
  console.log(`  Updated Editor Content After Antigravity Refactor:\n${activeFileContent}`);

  assert.ok(activeFileContent.includes('Refactored by Antigravity Native Engine'), 'Active file content must be updated by Antigravity!');
  console.log('  ✓ End-to-End Editor Control Verified!');

  // 5. Test Unmount Teardown
  console.log('\n[STEP 5/5] Testing Plugin Unmount & Resource Teardown...');
  global.__pluginUnmountFn();
  assert.strictEqual(commandsRegistered.length, 0, 'Commands must be cleaned up on unmount!');
  console.log('  ✓ Plugin unmounted cleanly!');

  console.log('\n====================================================');
  console.log('  ALL END-TO-END AUTONOMOUS VERIFICATION TESTS PASSED!');
  console.log('====================================================\n');
})();
