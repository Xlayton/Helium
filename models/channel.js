class Channel {

    /**
     * 
     * @param {Number} id 
     * @param {String} name 
     * @param {Message[]} messages 
     * @param {User[]} users 
     * @param {Role[]} roles 
     * @param {*} permission 
     */
    constructor(id, name, messages, users, roles, permission) {
        this.id = id;
        this.name = name;
        this.messages = messages;
        this.users = users;
        this.roles = roles;
        this.permission = permission;
    }
}