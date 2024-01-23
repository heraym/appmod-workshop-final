const fs = require("fs");
const {VertexAI} = require('@google-cloud/vertexai');

var projectId = 'projectodemos';
var location = 'us-central1';
var model = 'gemini-pro-vision';
var image = 'gs://generativeai-downloads/images/scones.jpg';


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

var imagen = "./images/imagen1.jpg";
var mimeType = 'image/jpeg';
var prompt = "what is shown in this image?";
  
  app.get('/analizar-imagen', function(req,res,next) {
      res.render("analizar-imagen",{ imagen: imagen, prompt: prompt});
  });

  app.get('/analizar-imagen-query', async function(req,res,next) {

   prompt = req.query.prompt;
   const contenidoImagen = await fs.readFileSync(imagen, {encoding: 'base64'});
   // console.log(contenidoImagen);
    
    // For images, the SDK supports both Google Cloud Storage URI and base64 strings
   const filePart = {
     inlineData: {
       data: contenidoImagen,
       mimeType: mimeType,
     },
   };

  const textPart = {
     text: prompt
  };

  const request = {
    contents: [{role: 'user', parts: [filePart, textPart]}],
  };
   
  // Initialize Vertex with your Cloud project and location
const vertexAI = new VertexAI({project: projectId, location: location});

// Instantiate the model
const generativeVisionModel = vertexAI.preview.getGenerativeModel({
  model: model,
});

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
          mimeType = files.filetoupload[0].mimetype;
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
