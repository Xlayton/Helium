const WebSocket = require('ws');
require('dotenv').config();
const PORT = process.env.WSPORT;

//To Run server use "node ws_server.js"
//Create the websocket
const wss = new WebSocket.Server({ port: PORT });

//Where the user data is stored
var websocketList = [];
 
wss.on('connection', function connection(ws) {
    console.log("Connection made");
    websocketList.push(ws);
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    websocketList.forEach(ws => {
      ws.send(message);
    });
  ws.on('close', function close() {
    console.log("closed");
  });
  });
});


//on button click send information from text box to whole server
//Server will send back to all clients