require("dotenv").config();
const bcrypt = require('bcrypt-nodejs');
const fs = require('fs');
const uNav = require("../util/u_nav");
const lNav = require("../util/l_nav");
const schema = require("../db/createSchema.js");

var websocketList = [];
/**
 * Renders a page to a response
 * @param {Object} res - Response to render to
 * @param {String} fileName - Name of view to render
 * @param {String} title - Title of page
 * @param {String} style - Theme to use
 * @param {Object} opts - Any additional options to pass into render
 */
const _render = (res, fileName, title, nav, style, opts) => {
    let options = {
        title: title,
        nav: nav,
        style: style,
        ...opts
    };
    // console.log(options);
    res.render(fileName, options);
};

const viewUsers = (req, res) => {
    schema.getAllUsers().then(users => {
        // console.log(users);
        _render(res, 'viewUsers', 'View All Users', uNav, { "userData": users });
    });
};

const createUserPage = (req, res) => {
    _render(res, 'createUser', "Create a User", uNav);
};

const createAUser = (req, res) => {
    let uniqueEmail = true;
    schema.getAllUsers().then(allUsers => {
        allusers.forEach(existingUser => {
            if(existingUser.email == req.body.email){
                uniqueEmail = false;
            }
        });
    });
    if(uniqueEmail){
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
    else{
        res.redirect('/createUser');
    }
}

const updateUserPage = (req, res) => { //taking user to user creation form
    schema.getUser(req.params.id).then(user => {
        _render(res, 'updateUser', 'Update a User', uNav, {"account": user});

    });
};

const updateUserDetails = (req, res) => { //after user fills out user creation form
    schema.getUser(req.params.id).then(user => {
        bcrypt.hash(req.body.password, null, null, (err, hash) => {
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
};

const deleteUser = (req, res) => { //deletes user with id parameter
    //end user session
    schema.getUser(req.params.id).then(user => {
        schema.removeUser(user);
        res.redirect('/seeUsers');
    });
}

const signIn = (req,res) => {
    _render(res, 'signIn', 'Sign In', uNav);
}

const signUserIn = (req, res) => {
    let foundUser = false;
    schema.getAllUsers().then(allUsers => {
        for(let thisUser of allUsers){
            if(thisUser.email == req.body.email){
                var response = bcrypt.compareSync(`${req.body.password}`, thisUser.password);
                if(response){
                    req.session.user = {
                        isAuthenicated: true,
                        username: thisUser.username,
                        email: thisUser.email,
                        id: thisUser.id,
                        icon: thisUser.icon
                    };
                    // _render(res, 'viewUsers', 'View All Users', uNav, {"userData": allUsers});
                    foundUser = true;
                    res.redirect('/seeUsers');
                }
            }
        }
        if(!foundUser){
            res.redirect('/signIn');
        }
    });
}

const signUserOut = (req, res) => {
    try {   
        if(req.params.id == req.session.user.id){
            req.session.destroy(err => {
                if(err){
                    console.log(err)
                }
                else{
                    res.redirect('/seeUsers')
                    console.log("User signed out")
                }
            })
        }
        else{
            console.log("You are not the signed-in user");
            res.redirect('/seeUsers');
        }
    } catch (error) {
        console.log("No one is logged in right now");
        res.redirect('/seeUsers');
    }
}

const getIndex = (req, res) => {
    _render(res, "landingPage", "Helium", uNav, "dark");
};

const makeConnection = (ws, head) => {
    console.log("Connection made");
    websocketList.push(ws);
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        websocketList.forEach(ws => {
            ws.send(message);
        });
        //Removes that a user has disconnected, should display name when users are added
        ws.on('close', function close() {
            if (websocketList.includes(ws)) {
                websocketList = websocketList.filter((cli) => cli !== ws);
                websocketList.forEach(bye => {
                    bye.send("User Disconnected");
                });
            }
        });
    });
};
module.exports = {
    viewUsers: viewUsers,
    createUserPage: createUserPage,
    createAUser: createAUser,
    updateUserPage: updateUserPage,
    updateUserDetails: updateUserDetails,
    deleteUser: deleteUser,
    signIn: signIn,
    signUserIn: signUserIn,
    signUserOut: signUserOut,
    getIndex: getIndex,
    makeConnection: makeConnection
};