// to hold all of the posts in the forum
export const forumStore = new Map();

// check if ID is valid (does not already exist in map)
const validID = function(id) {
    return !forumStore.has(id);
}

// generate a unique ID for a post
const generateID = function() {
    // Code credits (1 line): https://www.codemzy.com/blog/random-unique-id-javascript
    let id =  Math.random().toString(36).substring(2, 10);
    return validID(id)? id : generateID();
}

export class Comment {
    constructor(contents, author, timestamp) {
        this.contents = contents;
        this.author = author;
        this.timestamp = new Date();
        this.status = "active";
        this.replies = [];
    }

    delete() {
        this.status = "deleted";
    }

    reply(comment) { // nested
        this.replies.push(comment);
    }
}

export class Post {
    constructor(contents, author, timestamp) {
        this.contents = contents;
        this.author = author;
        this.timestamp = new Date();
        this.status = "active";
        this.replies = [];
    }

    delete() {
        this.status = "deleted";
    }

    reply(comment) { // top level
        this.replies.push(comment);
    }
}

export class User {
    constructor(username, password, role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    promote() {
        this.role = "mod";
    }

    demote() {
        this.role = "member";
    }
}