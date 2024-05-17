/*
  Note: This tracerHook uses both ritm and iitm hooks.
  - If the app is an ESM, the iitmhook is triggered.
  - If the app is a CJS, the ritm hook is triggered.
*/

'use strict';

const ritmHook = require('require-in-the-middle');
const iitmHook = require('import-in-the-middle');
const { instrument: gotInstrumentation } = require('./instrumentations/got.js');
const {
  instrument: superagentInstrumentation,
} = require('./instrumentations/superagent.js');

const instrumentedModules = [
  {
    moduleName: 'got',
    hookFn: gotInstrumentation,
  },
  { moduleName: 'superagent', hookFn: superagentInstrumentation },
];

function init() {
  for (const instrumentedModule of instrumentedModules) {
    ritmHook(
      [instrumentedModule.moduleName],
      function (exports, name) {
        return instrumentedModule.hookFn(exports, name);
      }
    );
    iitmHook(
      [instrumentedModule.moduleName],
      function (exports, name, basedir) {
        console.log(
          `Hooking enabled for module ${name} and base directory ${basedir}`
        );
        if (exports && exports.default) {
          // If the module has a 'default' export
          // Apply the hook function to the 'default' export
          // Return the modified module exports
          exports.default = instrumentedModule.hookFn(exports.default, name);
          return exports;
        } else {
          return instrumentedModule.hookFn(exports, name);
        }
      }
    );
  }
}

module.exports = { init };
