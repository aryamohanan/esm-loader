export * from 'import-in-the-middle/hook.mjs';
import { isMainThread } from 'worker_threads';
console.log('this is the instana tracer- loader.mjs', isMainThread);
