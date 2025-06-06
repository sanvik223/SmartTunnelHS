// server.js
const http = require('http');
const net = require('net');
const url = require('url');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, get, update } = require('firebase/database');
const { firebaseConfig } = require('./firebaseConfig');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase();

const HOST_EMAIL = 'your-host-email@example.com'; // 🔁 Change this
const HOST_PASSWORD = 'your-password'; // 🔁 Change this
const PORT = 8080;

// 🔐 Login the Host before starting the server
signInWithEmailAndPassword(auth, HOST_EMAIL, HOST_PASSWORD)
  .then((userCredential) => {
    const user = userCredential.user;
    const HOST_ID = user.uid;
    console.log(`✅ Authenticated as Host: ${HOST_ID}`);
    startProxyServer(HOST_ID);
  })
  .catch((error) => {
    console.error('❌ Login failed:', error.message);
    process.exit(1);
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
      console.log(`❌ Unknown client IP: ${clientIP}`);
      return;
    }

    const clientData = snap.val();
    const allowed = clientData.approved;
    const limitMB = clientData.mbLimit || 0;
    const usedMB = clientData.mbUsed || 0;
    const unlimited = clientData.unlimited || false;
    const blocked = clientData.blocked || false;
    const maxSpeedKBps = clientData.speedKBps || 0;

    if (!allowed || blocked) {
      clientSocket.end('HTTP/1.1 403 Forbidden\r\n\r\n');
      console.log(`❌ Access denied for ${clientIP}`);
      return;
    }

    if (!unlimited && usedMB >= limitMB * 1024 * 1024) {
      await update(clientRef, { blocked: true });
      clientSocket.end('HTTP/1.1 403 Limit Exceeded\r\n\r\n');
      console.log(`🚫 MB limit exceeded for ${clientIP}`);
      return;
    }

    const serverSocket = net.connect(port || 80, hostname, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);

      let bytesTransferred = 0;
      const startTime = Date.now();

      const interval = setInterval(async () => {
        const seconds = (Date.now() - startTime) / 1000;
        const speed = (bytesTransferred / 1024) / seconds;

        if (maxSpeedKBps > 0 && speed > maxSpeedKBps) {
          clientSocket.end();
          serverSocket.end();
          clearInterval(interval);
          console.log(`🐢 Speed limit exceeded for ${clientIP}`);
          return;
        }

        await update(clientRef, {
          mbUsed: usedMB + bytesTransferred,
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
    console.log(`🚀 Proxy server running on port ${PORT}`);
  });
}
