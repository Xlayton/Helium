const WebSocket = require('ws');
require('dotenv').config();
const PORT = process.env.WSPORT;

const wss = new WebSocket.Server({ port: PORT });
 
wss.on('connection', function connection(ws) {
    console.log("Connection made")
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
 
  ws.send('You can see this :)');
});


//on button click send information from text box to whole server
//Server will send back to all clients