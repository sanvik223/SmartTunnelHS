// nodejs-assets/main.js

const http = require('http');
const net = require('net');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Node.js Server is running inside the app!");
});

server.listen(8080, () => {
  console.log("HTTP server running on port 8080");
});
