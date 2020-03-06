require("dotenv").config();
const bcrypt = require('bcrypt-nodejs');
const fs = require('fs');
const uNav = require("../util/u_nav");
const lNav = require("../util/l_nav");
const schema = require("../db/db.js");
const path = require('path');
//Put theme in session, every time a page is rendered check if user is logged, if so use theme from session else deafult dark
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

const makeImage = user => {
    if(!fs.existsSync(path.join(__dirname, '../public/.img'))){
        fs.mkdirSync(path.join(__dirname, '../public/.img'));
    }
    if(user.icon !== 'null') {
        let buff = Buffer.from(user.icon, 'base64');
        fs.writeFileSync(path.join(__dirname, `../public/.img/${user.id}.png`), buff);
    }
        
}

const viewUsers = (req, res) => {
    schema.getAllUsers().then(users => {
        users.forEach(user => makeImage(user));
        if(req.session.user) {
            if(req.session.user.isAuthenicated) {
                _render(res, 'viewUsers', 'View All Users', uNav, req.session.user.theme, { "userData": users });
            }
            else {
                _render(res, 'viewUsers', 'View All Users',uNav, 'dark', { "userData": users });
            }
        }
        else {
            _render(res, 'viewUsers', 'View All Users',uNav, 'dark', { "userData": users });
        }   
    });
};

const createUserPage = (req, res) => {
    if(req.session.user) {
        if(req.session.user.isAuthenicated) {
            _render(res, 'createUser', 'Create a User', uNav, req.session.user.theme);
        }
        else {
            _render(res, 'createUser', "Create a User", uNav, "dark");
        }
    }
    else {
        _render(res, 'createUser', "Create a User", uNav, "dark");
    }
};

const createAUser = (req, res) => {
    let uniqueEmail = true;
    schema.getAllUsers().then(allUsers => {
        allUsers.forEach(existingUser => {
            if (existingUser.email == req.body.email) {
                uniqueEmail = false;
            }
        });
    });
    if (uniqueEmail) {
        bcrypt.hash(req.body.password, null, null, (err, hash) => {
            var myHash = hash;
            let user = {
                name: req.body.username,
                password: myHash,
                email: req.body.email,
                icon: null
            };
            schema.addUser(user);
            res.redirect('/seeUsers');
        });
    } else {
        res.redirect('/createUser');
    }
};

const updateUserPage = (req, res) => { //taking user to user creation form
    schema.getUser(req.params.id).then(user => {
        if(req.session.user) {
            if(req.session.user.isAuthenicated) {
                _render(res, 'updateUser', 'Update a User', uNav, req.session.user.theme, { "account": user });
            }
            else {
                _render(res, 'updateUser', 'Update a User', uNav, "dark", { "account": user });
            }
        }
        else {
            _render(res, 'updateUser', 'Update a User', uNav, "dark", { "account": user });
        }   
    });
};

const updateUserDetails = (req, res) => { //after user fills out user creation form
    schema.getUser(req.params.id).then(user => {

    // https://stackoverflow.com/questions/15772394/how-to-upload-display-and-save-images-using-node-js-and-express
    if(!fs.existsSync(path.join(__dirname, '/temp'))) fs.mkdirSync(path.join(__dirname, '/temp')); // check folder existence, create one ifn't exist
    const tempPath = req.file.path; /* name of the input field */
    const targetPath = path.join(__dirname, 'temp/avatar.png'); // new path for temp file
    fs.renameSync(tempPath, targetPath) // "moves" the file
    let file = fs.readFileSync(targetPath); // reads the new file
    let b64String = file.toString('base64'); // gets the base64 string representation 
    fs.unlink(targetPath, err => console.log(err)); // deletes the new file
    req.session.user.theme = req.body.theme;
        bcrypt.hash(req.body.password, null, null, (err, hash) => {
            var myHash = hash;
            let updatedUser = {
                name: req.body.username,
                password: myHash,
                email: req.body.email,
                icon: b64String,
                theme: req.body.theme
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
};

const signIn = (req, res) => {
    if(req.session.user) {
        if(req.session.user.isAuthenicated) {
            _render(res, 'signIn', 'Sign In', uNav, req.session.user.theme);
        }
        else {
            _render(res, 'signIn', 'Sign In', uNav, "dark");
        }
    }
    else {
        _render(res, 'signIn', 'Sign In', uNav, "dark");
    }
};

const signUserIn = (req, res) => {
    let foundUser = false;
    schema.getAllUsers().then(allUsers => {
        for (let thisUser of allUsers) {
            if (thisUser.email == req.body.email) {
                var response = bcrypt.compareSync(`${req.body.password}`, thisUser.password);
                if (response) {
                    req.session.user = {
                        isAuthenicated: true,
                        username: thisUser.name,
                        email: thisUser.email,
                        id: thisUser.id,
                        icon: thisUser.icon,
                        theme: thisUser.theme
                    };
                    // _render(res, 'viewUsers', 'View All Users', uNav, {"userData": allUsers});
                    foundUser = true;
                    res.redirect('/seeUsers');
                }
            }
        }
        if (!foundUser) {
            res.redirect('/signIn');
        }
    });
};

const signUserOut = (req, res) => {
    try {
        if (req.params.id == req.session.user.id) {
            req.session.destroy(err => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/seeUsers');
                    console.log("User signed out");
                }
            });
        } else {
            console.log("You are not the signed-in user");
            res.redirect('/seeUsers');
        }
    } catch (error) {
        console.log("No one is logged in right now");
        res.redirect('/seeUsers');
    }
};

const getIndex = (req, res) => {
    if(req.session.user) {
        if(req.session.user.isAuthenicated) {
            _render(res, 'landingPage', 'Helium', uNav, req.session.user.theme);
        }
        else {
            _render(res, "landingPage", "Helium", uNav, "dark");
        }
    }
    else {
        _render(res, "landingPage", "Helium", uNav, "dark");
    }
};

const makeConnection = (ws, head) => {
    console.log(head.session.user);
    if (head.session.user) {
        console.log("Connection made");
        websocketList.push(ws);
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
            websocketList.forEach(ws => {
                ws.send(`<section class="message"><img class="msg-icon" src=/.img/${head.session.user.id}.png><span class="username">${head.session.user.username}</span><span class="message-text">${message}</span></section>`);
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
    } else {
        ws.send("Please log in to use the chat feature.");
    }
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