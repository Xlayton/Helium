for (let btn of document.getElementsByClassName("server")) {
    if (btn.id !== "addServer") {
        btn.addEventListener("click", function(e) {
            location.href = "http://" + location.host + "/chat/" + e.target.name;
        });
    }
}