const fs = require("fs");
const {VertexAI} = require('@google-cloud/vertexai');

var projectId = 'PROJECT_ID';
var location = 'us-central1';
var model = 'gemini-pro-vision';
var image = 'gs://generativeai-downloads/images/scones.jpg';
var mimeType = 'image/jpeg';


// Initialize Vertex with your Cloud project and location
const vertexAI = new VertexAI({project: projectId, location: location});

// Instantiate the model
const generativeVisionModel = vertexAI.preview.getGenerativeModel({
  model: model,
});


const http = require('http');
const hostname = '0.0.0.0';
const port = process.env.PORT ||3000; 
var express = require('express');
const cors = require('cors');
var formidable = require('formidable');

const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('.'));

app.set("view engine", "ejs");

const server = http.createServer(app);

var imagen = "images/imagen1.jpg";



  
  app.get('/text-only', function(req,res,next) {
      res.render("text-only",{ prompt: "Escribe una historia sobre una mochila magica."});
  }); 
  app.get('/text-only-query', async function(req,res,next) {
    // For text-only input, use the gemini-pro model
   
    const prompt = req.query.prompt;
  
   
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    console.log(text);
    res.send(text);
  }); 
  
  app.get('/analizar-imagen', function(req,res,next) {
      res.render("analizar-imagen",{ imagen: "images/imagen1.jpg"});
  });

  app.get('/analizar-imagen-query', async function(req,res,next) {
 
    // For images, the SDK supports both Google Cloud Storage URI and base64 strings
   const filePart = {
     fileData: {
       fileUri: imagen,
       mimeType: mimeType,
     },
   };

  const textPart = {
     text: 'what is shown in this image?',
  };

  const request = {
    contents: [{role: 'user', parts: [filePart, textPart]}],
  };
   
   // Create the response stream
  const responseStream =
    await generativeVisionModel.generateContentStream(request);
  
    // Wait for the response stream to complete
  const aggregatedResponse = await responseStream.response;

  // Select the text from the response
  const fullTextResponse =
    aggregatedResponse.candidates[0].content.parts[0].text;

    console.log(fullTextResponse);
    
    res.send(fullTextResponse);
  });
  
  app.post('/fileupload', function(req,res,next) {
      var form = new formidable.IncomingForm();
      form.parse(req, function (err, fields, files) {
          var oldpath = files.filetoupload[0].filepath;
          var newpath = 'images/' + files.filetoupload[0].originalFilename;
          imagen = newpath;
        fs.copyFile(oldpath, newpath, function (err) {
          if (err) throw err;
          res.render("analizar-imagen",{ imagen: imagen});
        }); 
    });
  });
   

  server.listen(port, hostname, () => {
    console.log('Server running at http://%s:%s/', hostname, port);
});
