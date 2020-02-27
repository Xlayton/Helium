//Frontend user
var socket = new WebSocket("ws://localhost:1000");
        socket.onmessage = function(e) {
            document.getElementById("display").innerHTML += "<p>" + e.data + "</p>";
        }
        //Shows when user has connected
        socket.onopen = function(e) {
            socket.send("User Connected")
        }

        socket.onerror = function(error) {
        console.log('WebSocket Error: ' + error);
        };

document.getElementById("send").addEventListener("click", function sendMessage() {
    socket.send(document.getElementById("input").value);
});