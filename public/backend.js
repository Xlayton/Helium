const usernameCreation = document.getElementById('usernameCreation');
const passwordCreation = document.getElementById('passwordCreation');
const emailCreation = document.getElementById('emailCreation');

const checkCreation = () => {
    if(usernameCreation.value.trim() === "" || passwordCreation.value.trim() === "" || emailCreation.value.trim() === ""){
        return false;
    }
    else{
        return true;
    }
};