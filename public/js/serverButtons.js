for (let btn of document.getElementsByClassName("server")) {
    if (btn.id !== "addServer" && btn.id !== "editAccount") {
        btn.addEventListener("click", function(e) {
            location.href = "http://" + location.host + "/chat/" + e.target.name;
        });
    }
}
document.getElementById("editAccount").addEventListener("click", function(e) {
    location.href = "http://" + location.host + "/updateUser/" + e.target.name;
});
let editStyle = document.head.appendChild(document.createElement("style"))
switch(document.getElementById("editAccount").getAttribute("tag")) {
    case "online":
        editStyle.innerHTML = "#editAccount::after {background-color: #006400}"
        break
    case "idle":
        editStyle.innerHTML = "#editAccount::after {background-color: #cc0}"
        break;
    case "busy":
        editStyle.innerHTML = "#editAccount::after {background-color: #640000}"
        break;
}

var inviteLink = "http://" + location.host + "/join/" + document.getElementById("copy-invite-code").name;
document.getElementById("invitelink").value = inviteLink;

document.getElementById("copy-invite-code").addEventListener('click', function(e) {
    document.getElementById("invitelink").select();
    document.execCommand("copy");
});
