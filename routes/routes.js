const bcrypt = require('bcrypt-nodejs');
const pg = require('pg');
const fs= require('fs');
const schema = require('../db/createSchema.js');

// var connectionString = "postgres://postgres:pa55w0rd@'PostgreSQL 12'/ip:8815/testDatabase";
// var pgClient = new pg.Client(connectionString);
// pgClient.connect();

// var query = pgClient.query("Select * from 'Users'");
// query.on("row", function(row, result){
//     result.addRow("row");
// })

exports.viewUsers = (req, res) => {
    schema.getAllUsers().then(users => {
        res.render('viewUsers', {
            "title": 'View All Users',
            "userData": users
        })
    });
}

exports.createUserPage = (req, res) => { //taking user to user creation form
    res.render('createUser', {
        title: 'Create a User'
    });
}

exports.createAUser = (req, res) => { //after user fills out user creation form
    bcrypt.hash(req.body.password, null, null, (err, hash) => {
        var myHash = hash;
        let user = {
            id: req.body.userId,
            name: req.body.username,
            password: myHash,
            email: req.body.email,
            icon: null
        };
        schema.addUser(user);
        res.redirect('/seeUsers');
    })
}

exports.updateUserPage = (req, res) => { //taking user to user creation form
    schema.getUser(req.params.id).then(user => {
        res.render('updateUser', {
            "title": "Update a User",
            "account": user
        })
    });
}

exports.updateUserDetails = (req, res) => { //after user fills out user creation form
    schema.getUser(req.params.id).then(user => {
        bcrypt.hash(req.body.password, null, null, (err, hash) =>{
            var myHash = hash;
            let updatedUser = {
                id: req.body.userId,
                name: req.body.username,
                password: myHash,
                email: req.body.email,
                icon: req.body.icon
            };
            schema.updateUser(user, updatedUser);
            res.redirect('/seeUsers');
        });
    });
}

exports.deleteUser = (req, res) => { //deletes user with id parameter
    //end user session
    schema.getUser(req.params.id).then(user => {
        schema.removeUser(user);
        res.redirect('/seeUsers')
    });
}