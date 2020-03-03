class ChatRoom {

    /**
     * 
     * @param {Number} id 
     * @param {String} name 
     * @param {String} icon 
     * @param {Boolean} visibility 
     * @param {Channel[]} channels 
     * @param {User[]} users 
     * @param {Role[]} roles 
     * @param {Emoji[]} emojis 
     */
    constructor(id, name, icon, visibility, channels, users, roles, emojis) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.visibility = visibility;
        this.channels = channels;
        this.users = users;
        this.roles = roles;
        this.emojis = emojis;
    }
}