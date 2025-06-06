const http = require("http");
const net = require("net");
const url = require("url");
const { initializeApp } = require("firebase/app");
const {
  getDatabase,
  ref,
  onValue,
  set,
  update
} = require("firebase/database");
const {
  getAuth,
  signInWithEmailAndPassword
} = require("firebase/auth");
const { firebaseConfig, hostCredentials } = require("./firebaseConfig");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const LOCAL_PORT = 8080;
const PUBLIC_PORT = 8081;

// Login to Firebase using host credentials from firebaseConfig.js
signInWithEmailAndPassword(auth, hostCredentials.email, hostCredentials.password)
  .then((userCredential) => {
    const user = userCredential.user;
    const HOST_ID = user.uid;
    console.log("✅ Firebase Logged in as Host:", HOST_ID);

    // Create HTTP Proxy Server
    const proxyServer = http.createServer((req, res) => {
      const clientIP = req.socket.remoteAddress;
      const clientID = clientIP.replace(/[:.]/g, "_");
      const parsedUrl = url.parse(req.url);

      const clientRef = ref(db, `hosts/${HOST_ID}/clients/${clientID}`);

      onValue(clientRef, (snapshot) => {
        const data = snapshot.val();

        if (data && data.status === "approved" && !data.blocked) {
          const limitMB = data.limitMB;
          const usedMB = data.usedMB || 0;
          const unlimited = data.unlimited;

          if (!unlimited && usedMB >= limitMB) {
            res.writeHead(403);
            res.end("Usage limit exceeded");
            return;
          }

          const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 80,
            path: parsedUrl.path,
            method: req.method,
            headers: req.headers
          };

          const proxyReq = http.request(options, (proxyRes) => {
            let totalBytes = 0;

            res.writeHead(proxyRes.statusCode, proxyRes.headers);

            proxyRes.on("data", (chunk) => {
              totalBytes += chunk.length;
              res.write(chunk);
            });

            proxyRes.on("end", () => {
              res.end();

              const newUsedMB = usedMB + totalBytes / (1024 * 1024);
              update(clientRef, { usedMB: newUsedMB });

              if (!unlimited && newUsedMB >= limitMB) {
                update(clientRef, { blocked: true });
              }
            });
          });

          proxyReq.on("error", (err) => {
            res.writeHead(500);
            res.end("Proxy Error");
          });

          req.pipe(proxyReq);
        } else {
          res.writeHead(403);
          res.end("Access Denied");
        }
      }, { onlyOnce: true });
    });

    proxyServer.listen(LOCAL_PORT, () => {
      console.log(`🚀 Local Proxy Server running on port ${LOCAL_PORT}`);
    });

    // Create Public Proxy Server (for mobile data or internet share)
    const publicProxyServer = net.createServer((clientSocket) => {
      const clientIP = clientSocket.remoteAddress;
      const clientID = clientIP.replace(/[:.]/g, "_");
      const clientRef = ref(db, `hosts/${HOST_ID}/clients/${clientID}`);

      onValue(clientRef, (snapshot) => {
        const data = snapshot.val();

        if (data && data.status === "approved" && !data.blocked) {
          const limitMB = data.limitMB;
          const usedMB = data.usedMB || 0;
          const unlimited = data.unlimited;

          if (!unlimited && usedMB >= limitMB) {
            clientSocket.end("Usage limit exceeded");
            return;
          }

          const serverSocket = net.connect(80, "example.com", () => {
            clientSocket.pipe(serverSocket);
            serverSocket.pipe(clientSocket);
          });

          let totalBytes = 0;

          clientSocket.on("data", (chunk) => {
            totalBytes += chunk.length;
          });

          clientSocket.on("end", () => {
            const newUsedMB = usedMB + totalBytes / (1024 * 1024);
            update(clientRef, { usedMB: newUsedMB });

            if (!unlimited && newUsedMB >= limitMB) {
              update(clientRef, { blocked: true });
            }
          });

          serverSocket.on("error", () => {
            clientSocket.end("Server Error");
          });
        } else {
          clientSocket.end("Access Denied");
        }
      }, { onlyOnce: true });
    });

    publicProxyServer.listen(PUBLIC_PORT, () => {
      console.log(`🌐 Public Proxy Server running on port ${PUBLIC_PORT}`);
    });

  })
  .catch((error) => {
    console.error("❌ Firebase Login Failed:", error.message);
  });
