/*
  Note:This file is a copy of tracer.js
  Usecase: To automatically invoke the init function when the module is required.
  command: node -r ./src/tracerAuto.js app.js
*/

'use strict';

const requireHook = require('./requireHook.js');
const iitmHook = require('./iitmHook.js');
const { instrument: gotInstrumentation } = require('./instrumentations/got.js');
const {
  instrument: superagentInstrumentation,
} = require('./instrumentations/superagent.js');

const mainThread = require('worker_threads').isMainThread;
if (!mainThread) {
  console.log('Not Main thread');
  module.exports = { init: function () {} };
  return;
}

const instrumentedModules = [
  { moduleName: 'got', hookFn: gotInstrumentation },
  { moduleName: 'superagent', hookFn: superagentInstrumentation },
];

function init() {
  for (let instrumentedModule of instrumentedModules) {
    requireHook.loadInstrumentations(
      instrumentedModule.moduleName,
      instrumentedModule.hookFn
    );
    iitmHook.init(instrumentedModule.moduleName, instrumentedModule.hookFn);
  }
}
(function () {
  init();
})();

module.exports = { init };
