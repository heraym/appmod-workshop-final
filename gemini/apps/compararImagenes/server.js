const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyASWLTqhytgNmZ-bbzJDJXIRB--XpONhuc");

const model = genAI.getGenerativeModel({ model: "gemini-pro"});
const modelVision = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

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

var imagen1 = "images/imagen1.jpg";
var imagen2 = "images/imagen2.jpg";

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType
      },
    };
  }
  
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
  
  app.get('/compare-images', function(req,res,next) {
      res.render("compare-images",{ imagen1: "images/imagen1.jpg", imagen2: "images/imagen2.jpg"});
  });

  app.get('/compare-images-query', async function(req,res,next) {
 
    // For text-and-image input (multimodal), use the gemini-pro-vision model
   
    const prompt = "What's different between these pictures?";
  
    const imageParts = [
      fileToGenerativePart(imagen1, "image/jpeg"),
      fileToGenerativePart(imagen2, "image/jpeg"),
    ];
  
    const result = await modelVision.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    res.send(text);
  });
  
  app.post('/fileupload1', function(req,res,next) {
      var form = new formidable.IncomingForm();
      form.parse(req, function (err, fields, files) {
          var oldpath = files.filetoupload1[0].filepath;
          var newpath = 'images/' + files.filetoupload1[0].originalFilename;
          imagen1 = newpath;
        fs.copyFile(oldpath, newpath, function (err) {
          if (err) throw err;
          res.render("compare-images",{ imagen1: imagen1, imagen2: imagen2});
        }); 
    });
  });
  app.post('/fileupload2', function(req,res,next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload2[0].filepath;
        var newpath = 'images/' + files.filetoupload2[0].originalFilename;
        imagen2 = newpath;
      fs.copyFile(oldpath, newpath, function (err) {
        if (err) throw err;
        res.render("compare-images",{ imagen1: imagen1, imagen2: imagen2});
      }); 
  });
});

  server.listen(port, hostname, () => {
    console.log('Server running at http://%s:%s/', hostname, port);
});
