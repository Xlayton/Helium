for (let btn of document.getElementsByClassName("server")) {
    if (btn.id !== "addServer") {
        btn.addEventListener("click", function(e) {
            location.href = "http://" + location.host + "/chat/" + e.target.name;
        });
    }
}
var inviteLink = "http://" + location.host + "/join/" + document.getElementById("copy-invite-code").name
document.getElementById("invitelink").value = inviteLink;

document.getElementById("copy-invite-code").addEventListener('click', function(e) {
    document.getElementById("invitelink").select();
    document.execCommand("copy");
});