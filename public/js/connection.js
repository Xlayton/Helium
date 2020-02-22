//Frontend user
var socket = new WebSocket("ws://localhost:3000");
        socket.onmessage = function(e) {
            document.getElementById("display").innerHTML += "<p>" + e.data + "</p>";
        }
        
        socket.onopen = function(e) {
            socket.send("Connection")
        }

        socket.onerror = function(error) {
        console.log('WebSocket Error: ' + error);
        };

document.getElementById("send").addEventListener("click", function sendMessage() {
    socket.send(document.getElementById("input").value);
});