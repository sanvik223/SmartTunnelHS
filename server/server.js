// server/server.js

const http = require('http');
const net = require('net');
const url = require('url');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Firebase Init
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-firebase-project.firebaseio.com"
});
const db = admin.database();

const PORT = 8080;

const server = http.createServer();

server.on('connect', (req, clientSocket, head) => {
  const { port, hostname } = url.parse(`//${req.url}`, false, true);

  if (!hostname || !port) {
    clientSocket.end('HTTP/1.1 400 Bad Request\r\n');
    return;
  }

  const serverSocket = net.connect(port, hostname, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  // Track data usage
  let clientIP = clientSocket.remoteAddress.replace(/^.*:/, '');
  let dataUsed = 0;

  clientSocket.on('data', chunk => {
    dataUsed += chunk.length;
  });

  clientSocket.on('end', () => {
    // Convert bytes to MB
    const usedMB = dataUsed / (1024 * 1024);
    const userRef = db.ref(`clients/${clientIP}/usage`);
    userRef.once('value', snapshot => {
      const previous = snapshot.val() || 0;
      userRef.set(parseFloat((previous + usedMB).toFixed(2)));
    });
  });

  serverSocket.on('error', () => clientSocket.end());
  clientSocket.on('error', () => serverSocket.end());
});

server.on('request', (req, res) => {
  res.writeHead(200);
  res.end('Proxy server is running');
});

server.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
