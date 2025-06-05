const http = require('http');
const net = require('net');
const url = require('url');
const admin = require('firebase-admin');

// Firebase init
const serviceAccount = require('./firebaseServiceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://<YOUR_FIREBASE_PROJECT>.firebaseio.com"
});

const db = admin.database();

// CONFIG
const PORT = 8080;
const HOST_UID = 'your-host-uid'; // Replace this with actual Host UID

const server = http.createServer();

server.on('connect', (req, clientSocket, head) => {
  const { port, hostname } = url.parse(`http://${req.url}`);
  const clientIP = clientSocket.remoteAddress;

  const proxySocket = net.connect(port || 80, hostname, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    proxySocket.write(head);
    proxySocket.pipe(clientSocket);
    clientSocket.pipe(proxySocket);

    let bytesUsed = 0;

    clientSocket.on('data', chunk => {
      bytesUsed += chunk.length;
    });

    clientSocket.on('end', () => {
      // Log data usage to Firebase
      const clientRef = db.ref(`clients/${HOST_UID}/${clientIP}`);
      clientRef.once('value', snapshot => {
        const currentUsage = snapshot.val()?.usage || 0;
        clientRef.update({
          usage: currentUsage + bytesUsed
        });
      });
    });
  });

  proxySocket.on('error', () => {
    clientSocket.end('HTTP/1.1 500 Internal Server Error\r\n');
  });
});

server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
