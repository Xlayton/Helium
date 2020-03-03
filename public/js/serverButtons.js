for (let btn of document.getElementsByClassName("server-btn")) {
    btn.addEventListener("click", function(e) {
        location.href = "" + location.host + "/chat/" + e.target.name;
    });
}