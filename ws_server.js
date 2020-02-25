const WebSocket = require('ws');
require('dotenv').config();
const PORT = process.env.WSPORT;

//To Run server use "node ws_server.js" but be sure to use the correct WSPORT on ur end
//Create the websocket
const wss = new WebSocket.Server({ port: PORT });

//Where the user data is stored
var websocketList = [];
 
wss.on('connection', function connection(ws) {
    console.log("Connection made")
    websocketList.push(ws);
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    websocketList.forEach(ws => {
      ws.send(message);
    });
  //Removes that a user has disconnected, should display name when users are added
  ws.on('close', function close() {
    if(websocketList.includes(ws)) {
      websocketList = websocketList.filter((cli) => cli !== ws)
      websocketList.forEach(bye => {
        bye.send("User Disconnected");
      });
      console.log(websocketList.length);
    }
  });
  });
});


//on button click send information from text box to whole server
//Server will send back to all clients