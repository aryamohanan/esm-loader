# Instrumentation for Node.js Libraries

This application simulates module tracing within Node.js applications. It enables capturing and logging of trace data for libraries in both CommonJS and ESM formats.

## Requirements 

- The application should trace both CommonJS and ESM libraries.

- Implement tracing of modules via the [import-in-the-middle](https://www.npmjs.com/package/import-in-the-middle) library.

- Should support tracing modules across all versions of Node.js, from v14 to the latest release.


## How to run

- For Node.js versions greater than or equal to 18.19:

        npm run start

- For Node.js versions less than 18.19

        npm run start-v18

## How to tests

- npm test

## Instrumented Libraries 

- got (latest version is pure esm)
- superagent (commonjs)

## Special Notes

- --loader (aka --experimental-loader) is deprecated and using --import and register is the officially recommended way by Node.js (from 18.19 and above)


## Challenges for solving ESM for all node versions:

- loaders are off threaded! https://instana.slack.com/archives/G0118PFNN20/p1708556683665099

        GitHub isssue https://github.com/nodejs/node/pull/44710

- customers are using experimental-loader flag already (deprecated)

- we do not want to add the native ESM support yet, but we need to know how we are adding it with the new change.
- Add Native ESM support to the collector
        - Disable the import-in-the-middle hook for cjs instrumentation if we already hooked with requirehook.
        - Only support native ESM support with import-in-the-middle hook.


## Suggested Approch

node --import ./esm-register entry-point

Inside the register  module would be code that calls module.register() to register our loader hooks(import-in-the-middle) and also do the initializations that we wanted to do on the main thread (which is our collector initialization)

See https://github.com/nodejs/loaders/issues/147#issuecomment-1654094413

## Native ESM Support

### Why?

Many libraries, such as `got` and `node-fetch`, have already transitioned to ESM.

### How?

Utilize `import-in-the-middle`.

### Why We Need to Use `import-in-the-middle`

Many APM vendors like Datadog, New Relic, and Elastic,  and OpenTelemetry already using `import-in-the-middle`. Although Datadog currently owns this package, they are in the process of donating it to the Node.js organization. This transfer aims to place the project in a neutral environment where various contributors can get involved. You can follow the discussions about this transition here:
- [Node.js Diagnostics Issue #634](https://github.com/nodejs/diagnostics/issues/634)
- [Node.js Admin Issue #858](https://github.com/nodejs/admin/issues/858)

This makes it advantageous to use `iitm`.

### Challenges

- **Native ESM Modules Registration**: Native ESM modules need to register with the `import-in-the-middle` mechanism.
- **CJS Modules Compatibility**: All CJS modules must continue to function with the existing `requirehook`.

### Available Options

1. **Our `requireHook` and `iitm`**

   **Pros:**
   - Requires less work, allowing us to maintain our existing instrumentation with minimal fixes.
   - Supports hooking the root for CJS modules in ESM applications.
   - The Node.js team is developing an improved hook system: [Node.js Issue #52219](https://github.com/nodejs/node/issues/52219).

2. **`ritm` and `iitm`**

   **Pros:**
   - Most APM vendors use https://www.npmjs.com/package/require-in-the-middle for require support. import-in-the-middle is basically an adapted version of that so they fit well together.

    **Cons:**
    - More work
    - Testing effort , can't guarantee everything works 
    - The Node.js team is developing an improved hook system: [Node.js Issue #52219](https://github.com/nodejs/node/issues/52219), we might need to adapt this later.

### Use Cases for Testing

1. ESM app with a native ESM library (e.g., `got@14`).
2. ESM app with a CJS library (e.g., `got@11` or `superagent`).
3. CJS app with a CJS library (e.g., `got@11` or `superagent`) using `require`.
4. CJS app with a native ESM library (e.g., `got@14`) using `require`.
5. CJS app with a CJS library using `--import`.
6. CJS app with a native ESM library using `--import` (latest update in [Node 22](https://nodejs.org/en/blog/announcements/v22-release-announce#support-requireing-synchronous-esm-graphs)).
7. Test applications with different Node.js versions.
8. Test different versions of the same package supporting both CJS and ESM.
9. Hybrid cjs/esm (https://www.npmjs.com/package/@smithy/smithy-client)

### Note

`require-in-the-middle` hooks into and overrides the `Module.prototype.require` function to intercept calls to `require`. Once the module is loaded, the intercepted `require` function returns the modified exports. However, this hook does not work with imports, meaning it does not function with CommonJS modules in ESM applications.