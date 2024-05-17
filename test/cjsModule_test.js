const cp = require('child_process');
const { expect } = require('chai');
const fetch = require('node-fetch');

describe('CommonJS Test', () => {
  let child;

  before(function (done) {
    child = cp.spawn('node', ['app.js']);

    child.stdout.on('data', (data) => {
      if (data.includes('Welcome to CJS module express app')) {
        console.log('Server started');
        done();
      }
    });
    child.on('error', (err) => {
      console.error('Error starting server:', err);
      done(err);
    });
  });
  after(function (done) {
    child.kill();
    child.on('close', () => {
      console.log('Server stopped');
      done();
    });
  });

  it('should collect trace data when calling the CJS endpoint', async function () {
    this.timeout(10000);
    const response = await fetch('http://localhost:3001/status').catch(
      (err) => {
        console.error('Fetch error:', err);
        throw err;
      }
    );
    expect(response.status).to.equal(200);
    const spans = await response.json();
    expect(spans).to.be.an('array').with.lengthOf(1);
    expect(spans[0].module).to.equal('superagent');
    expect(spans[0].data.url).to.equal('https://example.com/?random=100');
  });
  it('should return an error when calling a non-existing endpoint', async function () {
    const response = await fetch('http://localhost:3001/error').catch((err) => {
      console.error('Fetch error:', err);
      throw err;
    });
    expect(response.status).to.equal(404);
  });
});
