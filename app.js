// Note we can also use the command: node -r ./src/tracerAuto.js app.js to enable instumentation
// instead of the following lines.
const tracer = require('./src/tracerHook.js');
tracer.init();
const superagent = require('superagent');
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.send('Hello World, I am CJS module');
});

app.get('/status', async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  try {
    await superagent.get('https://example.com/?random=100');
    const spans = global.spans;
    global.spans = [];
    res.send(spans);
  } catch (error) {
    console.error('Error retrieving collected spans:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/status/error', async (req, res) => {
  try {
    const response = await superagent.get('https://examplecom');
    res.send('Hello World, I am healthy');
  } catch (error) {
    console.error('Error retrieving collected spans:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3001, () => {
  console.log('Welcome to CJS module express app');
});
