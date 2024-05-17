const hook = require('import-in-the-middle');
const requireHook = require('./requireHook.js');
/**
 * This function initializes import-in-the-middle hook for the specified module.
 * The provided callback function will be executed whenever this module is imported.
 *
 * @param {object} module - The target module to be instrumented.
 * @param {function} hookFn - The function to be applied to the module's exports.
 *                             This function receives the original exports and
 *                              modifies them.
 
 */
function init(module, hookFn) {
  hook([module], (moduleExports, name, basedir) => {
    console.log(
      `Hooking enabled for module ${name} and base directory ${basedir}`
    );
    if (requireHook.isModuleHooked(module)) {
      return;
    }
    //  See the handling of the `default` property at
    //  https://nodejs.org/api/esm.html#commonjs-namespaces
    if (moduleExports && moduleExports.default) {
      // If the module has a 'default' export
      // Apply the hook function to the 'default' export
      // Return the modified module exports
      moduleExports.default = hookFn(moduleExports.default);
      return moduleExports;
    } else {
      return hookFn(moduleExports);
    }
  });
}

module.exports = { init };
