//Frontend user
var socket = new WebSocket("ws://localhost:3000");
socket.onmessage = function(e) {
    document.getElementById("display").innerHTML += "<p>" + e.data + "</p>";
};
socket.onopen = function(e) {
    socket.send("User Connected");
};
socket.onerror = function(error) {
console.log('WebSocket Error: ' + error);
};
function sendMessage() {
    var input = document.getElementById("input");
    if(input.value.replace(/\s/g, "")) {
        socket.send(input.value);
        input.value = "";
    }
}
document.getElementById("send").addEventListener("click", sendMessage);

document.getElementById("input").addEventListener("keydown", function (e) {
    if(e.keyCode === 13){
        sendMessage();
    }
});