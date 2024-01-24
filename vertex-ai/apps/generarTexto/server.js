/**
 * TODO(developer): Uncomment these variables before running the sample.\
 * (Not necessary if passing values as arguments)
 */
const project = 'projectodemos';
const location = 'us-central1';
const aiplatform = require('@google-cloud/aiplatform');

// Imports the Google Cloud Prediction service client
const {PredictionServiceClient} = aiplatform.v1;

// Import the helper module for converting arbitrary protobuf.Value objects.
const {helpers} = aiplatform;

// Specifies the location of the api endpoint
const clientOptions = {
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
};

const publisher = 'google';
const model = 'text-bison@001';

const http = require('http');
const hostname = '0.0.0.0';
const port = process.env.PORT ||3000; 
var express = require('express');
const cors = require('cors');

const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('.'));

app.set("view engine", "ejs");

const server = http.createServer(app);

var textoPrompt = "Give me ten interview questions for the role of program manager.";

app.get('/', function(req,res,next) {
  res.render("generar-texto",{ prompt: textoPrompt});
});

app.get('/generar-texto', function(req,res,next) {
    res.render("generar-texto",{ prompt: textoPrompt});
});

app.get('/generar-texto-query', async function(req,res,next) {

textoPrompt = req.query.prompt;

// Instantiates a client
const predictionServiceClient = new PredictionServiceClient(clientOptions);

  // Configure the parent resource
  const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;

  const prompt = {
    prompt: textoPrompt,
  };
  const instanceValue = helpers.toValue(prompt);
  const instances = [instanceValue];

  const parameter = {
    temperature: 0.2,
    maxOutputTokens: 256,
    topP: 0.95,
    topK: 40,
  };
  const parameters = helpers.toValue(parameter);

  const request = {
    endpoint,
    instances,
    parameters,
  };

  // Predict request
  const response = await predictionServiceClient.predict(request);
  console.log('Get text prompt response');
  console.log(JSON.stringify(response[0].predictions[0].structValue.fields.content));
  res.send(JSON.stringify(response[0].predictions[0].structValue.fields.content));
});

server.listen(port, hostname, () => {
    console.log('Server running at http://%s:%s/', hostname, port);
});
 