document.getElementById("addServer").addEventListener('click', function(e) {
    document.getElementById("makeServer").style.display = "block";
    document.getElementById("makeServerBack").style.display = "block";
});

document.getElementById("makeServerBack").addEventListener('click', function(e) {
    document.getElementById("makeServer").style.display = "none";
    document.getElementById("makeServerBack").style.display = "none";
});