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
/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
exports.handler = function(request, response){
  var statusCode = 404;

  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "text/plain";
  console.log(request.url);
  if(request.url === '/classes/room1'){
    console.log('room check');
    statusCode = 200;
    if(request.method === "GET"){
      console.log("Get IS working");
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify({"results": rooms}));
    } else if (request.method === "POST"){
      statusCode = 201;

      var body = "";
      // console.log("TEST: ", messages);
      request.on('data', function(data){
        // console.log('data');
        // console.log(data);
        body+=data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        for(var key in post){
          post = key;
          post = JSON.parse(post);
          post.createdAt = new Date().toJSON().toString();
       /*   console.log(post);*/
        }
        rooms.push(post);
      });
      response.end('true');
    }
  }
  console.log(statusCode);

  /* .writeHead() tells our server what HTTP status code to send back */
  response.writeHead(statusCode, headers);

  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
},

exports.handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at ??? */

  var statusCode = 404;

  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "text/plain";

  // console.log("Serving request type " + request.method + " for url " + request.url);
  // console.log(request);
  // console.log(url.parse(request.url));

  //console.log(request.method);

  console.log(request.url);
  if(request.url !== '/classes/messages' && request.url!=='/classes/messages?order=-createdAt'){
    statusCode = 404;
  } else if(request.method === "GET"){
    statusCode = 200;
    // create messages array and return array
    response.end(JSON.stringify({'results':messages}));
  } else if (request.method === "POST"){
    statusCode = 201;
    //console.log('POSTING')
    //console.log(request.message);
    var body = "";
    // console.log("TEST: ", messages);
    request.on('data', function(data){
      // console.log('data');
      // console.log(data);
      body+=data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      for(var key in post){
        post = key;
        post = JSON.parse(post);
        post.createdAt = new Date().toJSON().toString();
     /*   console.log(post);*/
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


    // console.log(body);
    //messages.push(url.parse(request.message));
  }

  if(request.url === '/classes/room'){
    console.log('room check');
    statusCode = 200;
    if(request.method === "GET"){
      response.end(JSON.stringify({'results': rooms}));
    }
  }
  console.log(statusCode);

  /* .writeHead() tells our server what HTTP status code to send back */
  response.writeHead(statusCode, headers);

  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
  response.end("Hello, World!");
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
