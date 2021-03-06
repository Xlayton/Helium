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
        fs.writeFileSync(path.join(__dirname, `../public/.img/servers/${server.id}.png`), buff);
    }
};

const viewUsers = (req, res) => {
    schema.getAllUsers().then(users => {
        users.forEach(user => makeImage(user));
        if (req.session.user) {
            if (req.session.user.isAuthenicated) {
                _render(res, 'viewUsers', 'View All Users', uNav, req.session.user.theme, {
                    "userData": users
                });
            } else {
                _render(res, 'viewUsers', 'View All Users', uNav, 'dark', {
                    "userData": users
                });
            }
        } else {
            _render(res, 'viewUsers', 'View All Users', uNav, 'dark', {
                "userData": users
            });
        }
    });
};

const createUserPage = (req, res) => {
    if (req.session.user) {
        if (req.session.user.isAuthenicated) {
            _render(res, 'createUser', 'Create a User', uNav, req.session.user.theme);
        } else {
            _render(res, 'createUser', "Create a User", uNav, "dark");
        }
    } else {
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
        if (!fs.existsSync(path.join(__dirname, '/temp'))) fs.mkdirSync(path.join(__dirname, '/temp')); // check folder existence, create one ifn't exist
        const tempPath = req.file.path; /* name of the input field */
        const targetPath = path.join(__dirname, 'temp/avatar.png'); // new path for temp file
        fs.renameSync(tempPath, targetPath) // "moves" the file
        let file = fs.readFileSync(targetPath); // reads the new file
        let b64String = file.toString('base64'); // gets the base64 string representation 
        fs.unlink(targetPath, err => console.log(err)); // deletes the new file
        bcrypt.hash(req.body.password, null, null, (err, hash) => {
            var myHash = hash;
            let user = {
                name: req.body.username,
                password: myHash,
                email: req.body.email,
                icon: b64String
            };
            schema.addUser(user);
            res.redirect('/signin');
        });
    } else {
        res.redirect('/createUser');
    }
};

const updateUserPage = (req, res) => { //taking user to user creation form
    schema.getUserById(req.params.id).then(user => {
        if (req.session.user) {
            if (req.session.user.isAuthenicated && parseInt(req.session.user.id) === parseInt(req.params.id)) {
                _render(res, 'updateUser', 'Update a User', uNav, req.session.user.theme, {
                    "account": user
                });
            } else {
                res.redirect("/signin");
            }
        } else {
            res.redirect("/signin");
        }
    });
};

const updateUserDetails = (req, res) => { //after user fills out user creation form
    schema.getUserById(req.params.id).then(user => {
        // https://stackoverflow.com/questions/15772394/how-to-upload-display-and-save-images-using-node-js-and-express
        let b64String;
        if (req.file) {
            if (!fs.existsSync(path.join(__dirname, '/temp'))) fs.mkdirSync(path.join(__dirname, '/temp')); // check folder existence, create one ifn't exist
            const tempPath = req.file.path; /* name of the input field */
            const targetPath = path.join(__dirname, 'temp/avatar.png'); // new path for temp file
            fs.renameSync(tempPath, targetPath) // "moves" the file
            let file = fs.readFileSync(targetPath); // reads the new file
            b64String = file.toString('base64'); // gets the base64 string representation 
            fs.unlink(targetPath, err => console.log(err)); // deletes the new file
        }
        req.session.user = {
            isAuthenicated: true,
            username: req.body.username,
            email: req.body.email,
            id: req.session.user.id,
            icon: (req.file ? b64String : req.session.user.icon),
            theme: req.body.theme,
            status: req.body.status
        }
        bcrypt.hash(req.body.password, null, null, (err, hash) => {
            var myHash = hash;
            let updatedUser = {
                name: req.body.username,
                password: myHash,
                email: req.body.email,
                icon: (req.file ? b64String : req.session.user.icon),
                theme: req.body.theme,
                status: req.body.status
            };
            schema.updateUser(user, updatedUser);
            res.redirect('/signin');
        });
    });
};

const deleteUser = (req, res) => { //deletes user with id parameter
    schema.getUserById(req.params.id).then(user => {
        schema.removeUser(user);
        res.redirect('/seeUsers');
    });
};

const signIn = (req, res) => {
    if (req.session.user) {
        if (req.session.user.isAuthenicated) {
            res.redirect("/homepage")
        } else {
            _render(res, 'signIn', 'Sign In', uNav, "dark");
        }
    } else {
        _render(res, 'signIn', 'Sign In', uNav, "dark");
    }
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
                            theme: thisUser.theme,
                            status: thisUser.status
                        };
                        // _render(res, 'viewUsers', 'View All Users', uNav, {"userData": allUsers});
                        foundUser = true;
                        res.redirect('/signin');
                    }
                }
            }
            if (!foundUser) {
                res.redirect('/signIn');
            }
        });
    } else {
        res.redirect("/homepage");
    }
};

const signUserOut = (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/signin');
            }
        });
    } catch (error) {
        res.redirect('/signin');
    }
};

const getIndex = (req, res) => {
    if (req.session.user) {
        if (req.session.user.isAuthenicated) {
            _render(res, 'landingPage', 'Helium', uNav, req.session.user.theme);
        } else {
            _render(res, "landingPage", "Helium", uNav, "dark");
        }
    } else {
        _render(res, "landingPage", "Helium", uNav, "dark");
    }
};

const makeConnection = (ws, head) => {
    if (head.session.user) {
        let conn = {
            roomID: head.ws.protocol,
            ws: ws
        };
        if (!websocketList.includes(conn)) websocketList.push(conn);
        makeImage(head.session.user);
        ws.on('message', function incoming(message) {
            websocketList.forEach(con => {
                try {
                    if (con.roomID === conn.roomID) {
                        con.ws.send(`<section class="message"><section class="msg-top"><img class="msg-icon" src="/.img/${head.session.user.id}.png"><span class="username">${head.session.user.username}</span></section><span class="message-text">${message}</span></section>`);
                    }
                } catch (err) {}
            });
            ws.on('close', function close() {
                if (websocketList.includes(conn)) {
                    websocketList = websocketList.filter((cli) => cli !== conn);
                    websocketList.forEach(con => {
                        if (con.roomID === conn.roomID) {
                            try {
                                con.ws.send(`${head.session.user.username} Disconnected`);
                            } catch (err) {}
                        }
                    });
                }
            });
        });
    } else {
        ws.send("Please log in to use the chat feature.");
    }
};

const friendRequests = (req, res) => {
    schema.getUserById(req.session.user.id).then(thisUser => {
        schema.getUsersFromFriendRequests(thisUser).then(users => {
            _render(res, "friendRequests", "Friend Requests", uNav, "dark", {
                "requests": users,
                "loggedInUser": thisUser
            });
        })
    });
}

const sendFriendRequest = (req, res) => {
    schema.getUserByEmail(req.body.email).then(searchedUser => { //user whose email was entered
        schema.getUserById(req.session.user.id).then(currentUser => { //user who is signed in
            schema.addUserToFriendRequests(currentUser, searchedUser)
            res.redirect('/homepage');
        })
    });
}

const acceptRequest = (req, res) => {
    schema.getUserById(req.params.id).then(searchedUser => { //user whose email was entered
        schema.getUserById(req.session.user.id).then(currentUser => { //user who is signed in
            schema.removeUserFromFriendRequests(currentUser, searchedUser);
            schema.addUserToFriendList(currentUser, searchedUser);
            schema.addUserToFriendList(searchedUser, currentUser);
            res.redirect('/friendRequests');
        });
    })
}

const rejectRequest = (req, res) => {
    schema.getUserById(req.params.id).then(searchedUser => { //user whose email was entered
        schema.getUserById(req.session.user.id).then(currentUser => { //user who is signed in
            schema.removeUserFromFriendRequests(currentUser, searchedUser);
            res.redirect('/friendRequests');
        });
    })
};

const homepage = (req, res) => {
    if (req.session.user) {
        schema.getUsersChatRooms(req.session.user.id)
            .then(servers => {
                makeImage(req.session.user);
                for (let server of servers) {
                    makeServerImage(server);
                    server.icon = `/.img/servers/${server.id}.png`;
                }
                schema.getFriendsByUserId(req.session.user.id)
                    .then(friends => {
                        friends.forEach(f => {
                            makeImage(f)
                            f.icon = `/.img/${f.id}.png`
                        })
                        _render(res, "homepage", "Homepage", lNav, req.session.user.theme, {
                            username: req.session.user.username,
                            servers: servers,
                            userImg: `/.img/${req.session.user.id}.png`,
                            userId: req.session.user.id,
                            status: req.session.user.status,
                            friends: friends,
                        });
                    })
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
                                status: req.session.user.status,
                                servers: servers,
                                invitecode: server.invitecode,
                                userImg: `/.img/${req.session.user.id}.png`,
                                userId: req.session.user.id
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

const filterRooms = (req, res) => {
    schema.getPublicServers()
        .then(servers => {
            let filtered = []
            for (let server of servers) {
                makeServerImage(server);
                server.icon = `/.img/servers/${server.id}.png`;
                if (server.name.toLowerCase().includes(req.query.filterText.toLowerCase())) filtered.push(server);
            }
            if (req.session.user) {
                _render(res, "servers", "Public Servers", lNav, req.session.user.theme, {
                    servers: filtered
                })
            } else {
                _render(res, "servers", "Public Servers", uNav, "dark", {
                    servers: filtered
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
    friendRequests: friendRequests,
    sendFriendRequest: sendFriendRequest,
    acceptRequest: acceptRequest,
    rejectRequest: rejectRequest,
    homepage: homepage,
    chat: chat,
    makeRoom: makeRoom,
    joinRoom: joinRoom,
    publicServers: publicServers,
    filterRooms: filterRooms,
};