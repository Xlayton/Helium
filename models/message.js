class Message {

    /**
     * 
     * @param {Number} id 
     * @param {String} text 
     * @param {User} user 
     * @param {Reaction[]} reactions 
     */
    constructor(id,text,user,reactions) {
        this.id = id;
        this.text = text;
        this.user = user;
        this.reactions = reactions;
    }
}