const bcrypt = require('bcrypt-nodejs'),
    pg = require('pg');

// var connectionString = "postgres://postgres:pa55w0rd@'PostgreSQL 12'/ip:8815/testDatabase";
// var pgClient = new pg.Client(connectionString);
// pgClient.connect();

// var query = pgClient.query("Select * from 'Users'");
// query.on("row", function(row, result){
//     result.addRow("row");
// })

exports.viewUsers = (req, res) => {
    res.render('viewUsers', {
        title: 'See All Users'
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
            username: req.body.username,
            password: myHash,
            email: req.body.email
        };
        res.redirect('/seeUsers');
    })
}

exports.updateUserPage = (req, res) => { //taking user to user creation form
    res.render('updateUser', {
        title: 'Update a User'
    });
}

exports.updateUserDetails = (req, res) => { //after user fills out user creation form
    //update user schema
    res.redirect('/seeUsers');
}

exports.deleteUser = (req, res) => {
    //end user session
    //delete user
    res.redirect('/seeUsers');
}