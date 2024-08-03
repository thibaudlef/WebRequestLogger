const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to log requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WebSocket setup
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
    clients.push(ws);

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });
});

app.use((req, res, next) => {
    const requestDetails = {
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body,
        url: req.url,
        ip: req.ip,
        timestamp: new Date().toISOString()
    };
    console.log('Request received:', requestDetails);

    // Send the request details to all connected WebSocket clients
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(requestDetails));
        }
    });

    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});