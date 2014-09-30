var url = require("url");
var qs = require('querystring');
var fs = require("fs");
var messages = [];
var rooms = [];

fs.readFile('./messages', "utf8", function(error, data){
  if(error){
    console.log('LOADING OLD MESSAGES ERROR', error);
  } else {
    messages = JSON.parse(data);
    console.log(messages);
  }
});
exports.handler = function(request, response){
  var statusCode = 404;

  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "text/plain";
  if(request.url === '/classes/room1'){
    statusCode = 200;
    if(request.method === "GET"){
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify({"results": rooms}));
    } else if (request.method === "POST"){
      statusCode = 201;

      var body = "";
      request.on('data', function(data){
        body+=data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        for(var key in post){
          post = key;
          post = JSON.parse(post);
          post.createdAt = new Date().toJSON().toString();
        }
        rooms.push(post);
      });
      response.end('true');
    }
  }

  response.writeHead(statusCode, headers);
},

exports.handleRequest = function(request, response) {
  var statusCode = 404;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";

  if(request.url !== '/classes/messages' && request.url!=='/classes/messages?order=-createdAt'){
    statusCode = 404;
  } else if(request.method === "GET"){
    statusCode = 200;
    response.end(JSON.stringify({'results':messages}));
  } else if (request.method === "POST"){
    statusCode = 201;
    var body = "";
    request.on('data', function(data){
      body+=data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      for(var key in post){
        post = key;
        post = JSON.parse(post);
        post.createdAt = new Date().toJSON().toString();
      }
      messages.push(post);

      var toSave = JSON.stringify(messages);
      fs.writeFile("./messages", toSave, function(error){
        if(error){
          console.log(error);
        } else {
          console.log("Messages are stored");
        }
      });
    });
  }

  if(request.url === '/classes/room'){
    console.log('room check');
    statusCode = 200;
    if(request.method === "GET"){
      response.end(JSON.stringify({'results': rooms}));
    }
  }
  response.writeHead(statusCode, headers);
  response.end("Default");
};

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
