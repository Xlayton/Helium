class Message {

    /**
     * 
     * @param {Number} id 
     * @param {String} msg 
     * @param {User} user 
     * @param {Reaction[]} reactions 
     */
    constructor(id,msg,user,reactions) {
        this.id = id;
        this.msg = msg;
        this.user = user;
        this.reactions = reactions;
    }
}