require("dotenv").config();
const bcrypt = require('bcrypt-nodejs');
const fs = require('fs');
const uNav = require("../util/u_nav");
const lNav = require("../util/l_nav");
const schema = require("../db/db.js");
const path = require('path');

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
    if (!fs.existsSync(path.join(__dirname, '../public/.img'))) {
        fs.mkdirSync(path.join(__dirname, '../public/.img'));
    }
    if (user.icon !== 'null') {
        let buff = Buffer.from(user.icon, 'base64');
        fs.writeFileSync(path.join(__dirname, `../public/.img/${user.id}.png`), buff);
    }

};

const makeServerImage = server => {
    if (!fs.existsSync(path.join(__dirname, '../public/.img'))) {
        fs.mkdirSync(path.join(__dirname, '../public/.img'));
    }
    if (!fs.existsSync(path.join(__dirname, '../public/.img/servers'))) {
        fs.mkdirSync(path.join(__dirname, '../public/.img/servers'));
    }
    if (server.icon !== 'null') {
        let buff = Buffer.from(server.icon, 'base64');
        if (!fs.existsSync(path.join(__dirname, `../public/.img/servers/${server.id}.png`))) {
            fs.writeFileSync(path.join(__dirname, `../public/.img/servers/${server.id}.png`), buff);
        }
    }
};

const viewUsers = (req, res) => {
    schema.getAllUsers().then(users => {
        users.forEach(user => makeImage(user));
        _render(res, 'viewUsers', 'View All Users', uNav, "dark", {
            "userData": users
        });
    });
};

const createUserPage = (req, res) => {
    _render(res, 'createUser', "Create a User", uNav, "dark");
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
        _render(res, 'updateUser', 'Update a User', uNav, "dark", {
            "account": user
        });

    });
};

const updateUserDetails = (req, res) => { //after user fills out user creation form
    schema.getUser(req.params.id).then(user => {

        // https://stackoverflow.com/questions/15772394/how-to-upload-display-and-save-images-using-node-js-and-express
        if (!fs.existsSync(path.join(__dirname, '/temp'))) fs.mkdirSync(path.join(__dirname, '/temp')); // check folder existence, create one ifn't exist
        const tempPath = req.file.path; /* name of the input field */
        const targetPath = path.join(__dirname, 'temp/avatar.png'); // new path for temp file
        fs.renameSync(tempPath, targetPath); // "moves" the file
        let file = fs.readFileSync(targetPath); // reads the new file
        let b64String = file.toString('base64'); // gets the base64 string representation 
        fs.unlink(targetPath, err => console.log(err)); // deletes the new file

        bcrypt.hash(req.body.password, null, null, (err, hash) => {
            var myHash = hash;
            let updatedUser = {
                name: req.body.username,
                password: myHash,
                email: req.body.email,
                icon: b64String
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
    _render(res, 'signIn', 'Sign In', uNav, "dark");
};

const signUserIn = (req, res) => {
    if (!req.session.user) {
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
                            theme: "dark"
                        };
                        // _render(res, 'viewUsers', 'View All Users', uNav, {"userData": allUsers});
                        foundUser = true;
                        res.redirect('/homepage');
                    }
                }
            }
            if (!foundUser) {
                res.redirect('/signIn');
            }
        });
    } else {
        res.redirect("homepage");
    }
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
    _render(res, "landingPage", "Helium", uNav, "dark");
};

const makeConnection = (ws, head) => {
    if (head.session.user) {
        console.log("Connection made");
        let conn = {
            roomID: head.ws.protocol,
            ws: ws
        };
        websocketList.push(conn);
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
            websocketList.forEach(con => {
                if (con.roomID === conn.roomID) {
                    con.ws.send(`${head.session.user.username}: ${message}`);
                }
            });
            ws.on('close', function close() {
                if (websocketList.includes(conn)) {
                    websocketList = websocketList.filter((cli) => cli !== conn);
                    websocketList.forEach(con => {
                        if (con.roomID === conn.roomID) {
                            con.ws.send("User Disconnected");
                        }
                    });
                }
            });
        });
    } else {
        ws.send("Please log in to use the chat feature.");
    }
};

const homepage = (req, res) => {
    if (req.session.user) {
        schema.getUsersChatRooms(req.session.user.id)
            .then(servers => {
                for (let server of servers) {
                    makeServerImage(server);
                    server.icon = `/.img/servers/${server.id}.png`;
                }
                _render(res, "homepage", "Homepage", lNav, req.session.user.theme, {
                    username: req.session.user.username,
                    servers: servers
                });
            });
    } else {
        res.redirect("/signin");
    }
};

const chat = (req, res) => {
    if (req.session.user) {
        schema.getUsersChatRooms(req.session.user.id)
            .then(servers => {
                let roomIds = [];
                for (let server of servers) {
                    makeServerImage(server);
                    server.icon = `/.img/servers/${server.id}.png`;
                    roomIds.push(server.id);
                }
                if (roomIds.includes(parseInt(req.params.id))) {
                    schema.getChatRoomInviteCodeById(req.params.id)
                        .then(server => {
                            _render(res, "chat", "Chat", lNav, req.session.user.theme, {
                                serverID: req.params.id,
                                servers: servers,
                                invitecode: server.invitecode
                            });
                        })
                } else {
                    res.redirect("/homepage");
                }
            });
    } else {
        res.redirect("/signin");
    }
};

const makeRoom = (req, res) => {
    if (req.session.user) {
        if (!fs.existsSync(path.join(__dirname, '/temp'))) fs.mkdirSync(path.join(__dirname, '/temp')); // check folder existence, create one ifn't exist
        const tempPath = req.file.path; /* name of the input field */
        const targetPath = path.join(__dirname, 'temp/avatar.png'); // new path for temp file
        fs.renameSync(tempPath, targetPath); // "moves" the file
        let file = fs.readFileSync(targetPath); // reads the new file
        let b64String = file.toString('base64'); // gets the base64 string representation 
        fs.unlink(targetPath, err => console.log(err)); // deletes the new file
        schema.addChatRoom({
                name: req.body.name,
                icon: b64String,
                visibility: (req.body.visibility === "0" ? true : false),
                creatorID: req.session.user.id
            })
            .then(() => {
                res.redirect("/homepage");
            });
    } else {
        res.redirect("/signin");
    }
};

const joinRoom = (req, res) => {
    if (req.session.user) {
        schema.getChatRoomByInviteCode(parseInt(req.params.inviteCode))
            .then(server => {
                schema.addUserToChatRoom(server.id, req.session.user.id);
                res.redirect("/homepage");
            })
            .catch(err => {
                console.error(err);
                res.redirect("/homepage");
            });
    } else {
        res.redirect("/signin");
    }
};

const publicServers = (req, res) => {
    schema.getPublicServers()
        .then(servers => {
            for (let server of servers) {
                makeServerImage(server);
                server.icon = `/.img/servers/${server.id}.png`;
            }
            if (req.session.user) {
                _render(res, "servers", "Public Servers", lNav, req.session.user.theme, {
                    servers: servers
                })
            } else {
                _render(res, "servers", "Public Servers", uNav, "dark", {
                    servers: servers
                })
            }
        });
}

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
    makeConnection: makeConnection,
    homepage: homepage,
    chat: chat,
    makeRoom: makeRoom,
    joinRoom: joinRoom,
    publicServers: publicServers,
};