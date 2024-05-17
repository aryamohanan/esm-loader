import { register } from 'node:module';
// Relative resolution handled ('./loader.mjs', import.meta.url).
// https://nodejs.org/api/esm.html#no-requireresolve
// TypeError [ERR_INVALID_URL]: Invalid URL when running with 20.6 and above

// initializes the trace here, because this is the main thread, as soon as we enter thr register its off threaded.
import instana from './src/tracer.js';
instana.init();

// import.meta.url is the absolute module path

register('./loader.mjs', import.meta.url);
