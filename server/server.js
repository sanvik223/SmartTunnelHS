// server.js
const http = require('http');
const net = require('net');
const url = require('url');
const { initializeApp } = require('firebase/app');
const { getAuth, onAuthStateChanged } = require('firebase/auth');
const { getDatabase, ref, get, update } = require('firebase/database');
const { firebaseConfig } = require('./firebaseConfig');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase();

const PORT = 8080;

auth.onAuthStateChanged(auth.currentUser, user => {
  if (!user) {
    console.log('❌ User not authenticated. Please login first.');
    process.exit(1);
  }

  const HOST_ID = user.uid;
  console.log(`✅ Authenticated as Host: ${HOST_ID}`);
  startProxyServer(HOST_ID);
});

function startProxyServer(HOST_ID) {
  const server = http.createServer();

  server.on('connect', async (req, clientSocket, head) => {
    const { port, hostname } = url.parse(`http://${req.url}`);
    const clientIP = clientSocket.remoteAddress.replace('::ffff:', '');

    const clientRef = ref(db, `connections/${HOST_ID}/${clientIP}`);
    const snap = await get(clientRef);

    if (!snap.exists()) {
      clientSocket.end('HTTP/1.1 403 Forbidden\r\n\r\n');
      return;
    }

    const clientData = snap.val();
    const allowed = clientData.approved;
    const limit = clientData.mbLimit || 0;
    const used = clientData.mbUsed || 0;
    const unlimited = clientData.unlimited || false;
    const blocked = clientData.blocked || false;
    const maxSpeedKBps = clientData.speedKBps || 0;

    if (!allowed || blocked) {
      clientSocket.end('HTTP/1.1 403 Forbidden\r\n\r\n');
      return;
    }

    if (!unlimited && used >= limit * 1024 * 1024) {
      await update(clientRef, { blocked: true });
      clientSocket.end('HTTP/1.1 403 Limit Exceeded\r\n\r\n');
      return;
    }

    const serverSocket = net.connect(port || 80, hostname, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);

      let bytesTransferred = 0;
      const start = Date.now();

      const interval = setInterval(async () => {
        const now = Date.now();
        const seconds = (now - start) / 1000;

        if (maxSpeedKBps > 0 && bytesTransferred / seconds > maxSpeedKBps * 1024) {
          clientSocket.end();
          serverSocket.end();
          clearInterval(interval);
        }

        await update(clientRef, {
          mbUsed: used + bytesTransferred,
          lastActive: Date.now()
        });
      }, 5000);

      serverSocket.on('data', chunk => {
        bytesTransferred += chunk.length;
      });

      clientSocket.on('close', () => clearInterval(interval));
      serverSocket.on('close', () => clearInterval(interval));
    });

    serverSocket.on('error', () => {
      clientSocket.end('HTTP/1.1 500 Internal Error\r\n\r\n');
    });
  });

  server.listen(PORT, () => {
    console.log(`🚀 Proxy server running on port ${PORT} for Host: ${HOST_ID}`);
  });
}
