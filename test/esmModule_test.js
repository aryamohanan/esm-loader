const { spawn } = require('child_process');
const { expect } = require('chai');
const fetch = require('node-fetch');
const semver = require('semver');

describe('ESM Test', () => {
  let child;

  before(function (done) {
    const startScript = semver.lt(process.version, '18.19.0')
      ? ['--loader', './esm-loader.mjs', 'app.mjs']
      : ['--import', './register.mjs', 'app.mjs'];

    child = spawn('node', startScript);

    child.stdout.on('data', (data) => {
      if (data.includes('Welcome to ES module express app')) {
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

  it('should collect trace data when calling the ESM Module', async function () {
    const response = await fetch('http://localhost:3003/esm').catch((err) => {
      console.error('Fetch error:', err);
      throw err;
    });

    expect(response.status).to.equal(200);
    const spans = await response.json();
    expect(spans).to.be.an('array').with.lengthOf(1);
    expect(spans[0].module).to.equal('got');
    expect(spans[0].data.url).to.equal('https://example.com/?random=1000');
  });
  it('should collect trace data when calling the CJS module', async function () {
    this.timeout(10000);
    const response = await fetch('http://localhost:3003/cjs').catch((err) => {
      console.error('Fetch error:', err);
      throw err;
    });

    expect(response.status).to.equal(200);
    const spans = await response.json();
    expect(spans).to.be.an('array').with.lengthOf(1);
    expect(spans[0].module).to.equal('superagent');
    expect(spans[0].data.url).to.equal('https://example.com/?random=1000');
  });
  it('should collect multile traces when calling multiple modules', async function () {
    const response = await fetch('http://localhost:3003/multiple').catch(
      (err) => {
        console.error('Fetch error:', err);
        throw err;
      }
    );

    expect(response.status).to.equal(200);
    const spans = await response.json();
    expect(spans).to.be.an('array').with.lengthOf(2);
    expect(spans[0].module).to.equal('superagent');
    expect(spans[0].data.url).to.equal('https://example.com/?random=1000');
    expect(spans[1].module).to.equal('got');
    expect(spans[1].data.url).to.equal('https://example.com/?random=10');
  });
  it('should return an error when calling a non-existing endpoint', async function () {
    const response = await fetch('http://localhost:3003/error').catch((err) => {
      console.error('Fetch error:', err);
      throw err;
    });

    expect(response.status).to.equal(404);
  });
});
