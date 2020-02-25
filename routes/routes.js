const bcrypt = require('bcrypt-nodejs');
const fs= require('fs');

const _render = (res, fileName, title, opts) => {

};

const viewUsers = (req, res) => {
    fs.readFile("config.json", (err, data) => {
        if(err){
            console.log(err);
        }
        var jsonData = data;
        var jsonParsed = JSON.parse(jsonData);
        res.render('viewUsers', {
            "title": 'See All Users',
            "userData": jsonParsed
        });
    });
};

const createUserPage = (req, res) => { //taking user to user creation form
    res.render('createUser', {
        title: 'Create a User'
    });
};

const createAUser = (req, res) => { //after user fills out user creation form
    bcrypt.hash(req.body.password, null, null, (err, hash) => {
        var myHash = hash;
        let user = {
            id: req.body.userId,
            username: req.body.username,
            password: myHash,
            email: req.body.email,
            icon: null
        };
        fs.readFile('config.json', (err, data) => {
            var jsonData = data;
            var jsonParsed = JSON.parse(jsonData);
            jsonParsed.users.push(user);
            var jsonContent = JSON.stringify(jsonParsed);
            fs.writeFile('config.json', jsonContent, (err) => {
                if(err){
                    console.log(err);
                }
                res.redirect('/seeUsers');
            });
        });
    });
};

const updateUserPage = (req, res) => { //taking user to user creation form
    var validCheck = false;
    fs.readFile('config.json', (err, data) => {
        var jsonData = JSON.parse(data);
        jsonData.users.forEach(user => {
            if(user.id == req.params.id){
                validCheck = true;
                res.render('updateUser', {
                    "title": 'Update a User',
                    "account": user
                });
            }
        });
        if(validCheck == false){
            res.redirect('/seeUsers');
        }
    });
};

const updateUserDetails = (req, res) => { //after user fills out user creation form
    fs.readFile('config.json', (err, data) => {
        var jsonData = JSON.parse(data);
        jsonData.users.forEach(user => {
            if(user.id == req.params.id){
                bcrypt.hash(req.body.password, null, null, (err, hash) =>{
                    var myHash = hash;
                    user.id = req.body.userId;
                    user.username = req.body.username;
                    user.password = myHash;
                    user.email = req.body.email;
                    user.icon = req.body.icon;
                    var jsonContent = JSON.stringify(jsonData);
                    fs.writeFile('config.json', jsonContent, (err) => {
                        if(err){
                            console.log(err);
                        }
                        res.redirect('/seeUsers');
                    });
                });
            }
        });
    });
};

const deleteUser = (req, res) => { //deletes user with id parameter
    //end user session
    fs.readFile('config.json', (err, data) => {
        var jsonData = JSON.parse(data);
        jsonData.users.forEach(user => {
            if(user.id == req.params.id){
                jsonData.users.splice(jsonData.users.indexOf(user), 1);
                var jsonContent = JSON.stringify(jsonData);
                fs.writeFile('config.json', jsonContent, (err) => {
                    if(err){
                        console.log(err);
                    }
                    res.redirect('/seeUsers');

                });
            }
        });
    });
};

const getIndex = (req, res) => {
    res.render("landingPage");
};

exports = {
    viewUsers: viewUsers,
    createUserPage: createUserPage,
    createAUser: createAUser,
    updateUserPage: updateUserPage,
    updateUserDetails: updateUserDetails,
    deleteUser: deleteUser,
    getIndex: getIndex
};