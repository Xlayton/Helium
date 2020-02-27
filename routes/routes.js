require("dotenv").config();
const bcrypt = require('bcrypt-nodejs');
const fs = require('fs');
const uNav = require("../util/u_nav");
const lNav = require("../util/l_nav");

var websocketList = [];
/**
 * Renders a page to a response
 * @param {Object} res - Response to render to
 * @param {String} fileName - Name of view to render
 * @param {String} title - Title of page
 * @param {Object} opts - Any additional options to pass into render
 */
const _render = (res, fileName, title, nav, opts) => {
    let options = {
        title: title,
        nav: nav,
        ...opts
    };
    res.render(fileName, options);
};

const viewUsers = (req, res) => {
    schema.getAllUsers().then(users => {
        _render(res, 'viewUsers', 'View All Users', { "userData": users });
    });
};

const createUserPage = (req, res) => {
    _render(res, 'createUser', "Create a User");
};

const createAUser = (req, res) => {
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

const updateUserPage = (req, res) => { //taking user to user creation form
    schema.getUser(req.params.id).then(user => {
        _render(res, 'updateUser', 'Update a User', {"account": user});
    });
}

const updateUserDetails = (req, res) => { //after user fills out user creation form
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

const deleteUser = (req, res) => { //deletes user with id parameter
    //end user session
    schema.getUser(req.params.id).then(user => {
        schema.removeUser(user);
        res.redirect('/seeUsers')
    });
}
