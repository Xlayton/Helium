//Frontend user
var socket = new WebSocket("ws://" + window.location.origin.substring(5) + "/makeConnection", ("" + serverID));
socket.onmessage = function(e) {
    document.getElementById("display").innerHTML += "<p>" + e.data + "</p>";
};
socket.onopen = function(e) {
    socket.send("Connected");
};
socket.onerror = function(error) {
    console.log('WebSocket Error: ' + error);
};

function sendMessage() {
    var input = document.getElementById("input");
    if (input.value.replace(/\s/g, "")) {
        socket.send(input.value);
        input.value = "";
    }
}
document.getElementById("send").addEventListener("click", sendMessage);

document.getElementById("input").addEventListener("keydown", function(e) {
    if (e.keyCode === 13) {
        sendMessage();
    }
});