import got from 'got';
import superagent from 'superagent';
import express from 'express';
import gotCjs from 'got-cjs';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.send('Hello World, I am an ES module');
});

app.get('/esm', async (req, res) => {
  try {
    await got.get('https://example.com/?random=1000');
    const spans = global.spans;
    console.log('Collected trace data:', spans);
    global.spans = []; // Clear global spans
    res.send(spans);
  } catch (error) {
    console.error('Error retrieving spans:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/cjs', async (req, res) => {
  try {
    await superagent.get('https://example.com/?random=1000');
    const spans = global.spans;
    console.log('Collected trace data:', spans);
    global.spans = []; // Clear global spans
    res.send(spans);
  } catch (error) {
    console.error('Error retrieving spans:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/multiple', async (req, res) => {
  try {
    await superagent.get('https://example.com/?random=1000');
    await got.get('https://example.com/?random=10');
    const spans = global.spans;
    console.log('Collected trace data:', spans);
    global.spans = []; // Clear global spans
    res.send(spans);
  } catch (error) {
    console.error('Error retrieving spans:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/versions', async (req, res) => {
  try {
    await gotCjs.get('https://example.com/?random=1000');
    // await got.get('https://example.com/?random=10');
    const spans = global.spans;
    console.log('Collected trace data:', spans);
    global.spans = []; // Clear global spans
    res.send(spans);
  } catch (error) {
    console.error('Error retrieving spans:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3003, () => {
  console.log('Welcome to ES module express app');
});
