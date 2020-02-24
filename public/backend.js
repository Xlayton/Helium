//User Creation Page
const idCreation = document.getElementById('IdCreation');
const usernameCreation = document.getElementById('usernameCreation');
const passwordCreation = document.getElementById('passwordCreation');
const emailCreation = document.getElementById('emailCreation');
//User Update Page
const idUpdate = document.getElementById('IdUpdate');
const usernameUpdate = document.getElementById('usernameUpdate');
const passwordUpdate = document.getElementById('passwordUpdate');
const emailUpdate = document.getElementById('emailUpdate');
const iconUpdate = document.getElementById('iconUpdate');

const checkCreation = () => {
    if(usernameCreation.value.trim() === "" || passwordCreation.value.trim() === "" || emailCreation.value.trim() === "" || idCreation.value.trim() === ""){
        return false;
    }
    else{
        return true;
    }
};

const checkUpdate = () => {
    if(usernameUpdate.value.trim() === "" || passwordUpdate.value.trim() === "" || emailUpdate.value.trim() === "" || idUpdate.value.trim() === ""){
        return false;
    }
    else{
        return true;
    }
};