/* Import node's http module: */
var http = require("http");
var requestHandler = require("./request-handler");
var fs = require("fs");
var paperboy = require('node-static');
var file = new paperboy.Server('../client');


require('http').createServer(function(request, response){
  request.addListener('end', function(){
    file.serve(request, response);
  }).resume();
}).listen(8080);

var port = 3000;
var ip = "127.0.0.1";
var server = http.createServer(requestHandler.handleRequest);
server.listen(port, ip);
