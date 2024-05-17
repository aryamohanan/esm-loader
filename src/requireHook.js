const Module = require('module');
const path = require('path');
const originalLoad = Module._load;

let instrumentedModules = [];

function loadInstrumentations(moduleName, instrument) {
  if (typeof moduleName !== 'string' || typeof instrument !== 'function') {
    throw new Error(
      `moduleName must be a string and instrument must be a function`
    );
  }
  instrumentedModules.push({ moduleName, instrument });
}

function hookModuleLoad(moduleName, parent) {

  // handle ESM modules with absPath, may be we can return early, but still check what really happenes without the following logic
  const orgModuleName = moduleName;
  // Extracting the module name from the path for ESM modules
  // Ignore this part, so require won't instrument ESM modules.
  // if (
  //   path.isAbsolute(moduleName) &&
  //   ['.node', '.json', '.ts'].indexOf(path.extname(moduleName)) === -1
  // ) {
  //   //  Note: Replaced   moduleName.match(/node_modules\/((@.*?\/.*?)|(.*?))(?=\/|$)/);
  //   // While using that the sub modules instrumnetaed as the name of main module
  //   // node_modules/got/node_modules/http2-wrapper/source/index.js
  //   // node_modules/got/node_modules/cacheable-request/node_modules/get-stream/index.js
  //   // such cases the got module name resolved, but its a pure ESM.

  //   match = moduleName.match(/node_modules\/(.*?(?=\/))/);
  //   if (match && match[1]) {
  //     moduleName = match[1];
  //   }
  //   // const moduleInfo = moduleFromPath(moduleName);
  //   // moduleName = moduleInfo.name;
  // }
  for (const {
    moduleName: targetModuleName,
    instrument,
  } of instrumentedModules) {
    if (moduleName === targetModuleName) {
      // Load the module via the original Module._load implementation.
      const originalModule = originalLoad.call(Module, orgModuleName, parent);

      return instrument(originalModule);
    }
  }

  // Forward the call to the original module loading implementation if this is not the targeted module.
  return originalLoad.call(Module, orgModuleName, parent);
}

// reference https://github.com/watson/module-details-from-path/blob/master/index.js
// resolve modulename from the absolute path ritm uses this, so simpley copied the code
// function moduleFromPath(file) {
//   var segments = file.split(path.sep);
//   var index = segments.lastIndexOf('node_modules');
//   if (index === -1) return;
//   if (!segments[index + 1]) return;
//   var scoped = segments[index + 1][0] === '@';
//   var name = scoped
//     ? segments[index + 1] + '/' + segments[index + 2]
//     : segments[index + 1];
//   var offset = scoped ? 3 : 2;
//   return {
//     name: name,
//     basedir: segments.slice(0, index + offset).join(path.sep),
//     path: segments.slice(index + offset).join(path.sep),
//   };
// }
exports.loadInstrumentations = loadInstrumentations;
Module._load = hookModuleLoad;
