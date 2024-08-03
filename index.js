const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket setup
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    clients.push(ws);

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('message', (message) => {
        console.log('Received message from client:', message);
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