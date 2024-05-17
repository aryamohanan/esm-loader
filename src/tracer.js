'use strict';

const requireHook = require('./requireHook.js');
const { instrument: gotInstrumentation } = require('./instrumentations/got.js');
const {
  instrument: superagentInstrumentation,
} = require('./instrumentations/superagent.js');
const importInTheMiddle = require('import-in-the-middle');
const mainThread = require('worker_threads').isMainThread;
if (!mainThread) {
  console.log('Not Main thread');
  module.exports = { init: function () {} };
  return;
}

const instrumentedModules = [
  {
    moduleName: 'got',
    hookFn: gotInstrumentation,
  },
  { moduleName: 'superagent', hookFn: superagentInstrumentation },
];

function init() {
  for (let instrumentedModule of instrumentedModules) {
    requireHook.loadInstrumentations(
      instrumentedModule.moduleName,
      instrumentedModule.hookFn
    );

    importInTheMiddle(
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
