import { fetchReqAmount } from "./auth";
import { connectionPool } from "./database";



// -------- ID generation --------

// check if ID is valid (does not already exist)
const validID = function (type, id) {
    // if (type == p) return !forumStore.has(id);
    // if (type == u) return !userMap.has(id);

    // console.log('Invalid type! Please report this error.');
    // return true; // infinite loop probably worse...

    // NOTE: change to check with mysql if the id is valid instead
}

// generate a unique ID for a post
const generateID = function (type) {
    // Code credits (1 line): https://www.codemzy.com/blog/random-unique-id-javascript
    let id = Math.random().toString(36).substring(2, 10);
    return validID(type, id) ? id : generateID();
}


// -------- Classes --------

class Comment {
    constructor(contents, author, parent) {
        this.contents = contents;
        this.author = author;
        this.timestamp = new Date().getTime();
        this.status = "active";
        this.id = generateID('c');
        this.parent = parent; // can either be comment or post id
    }

    delete() {
        this.status = "deleted";
    }
}

class Post {
    constructor(contents, author) {
        this.contents = contents;
        this.author = author;
        this.timestamp = new Date().getTime();
        this.id = generateID('p');
        this.status = "active";
    }

    delete() {
        this.status = "deleted";
    }
}

class User {
    constructor(username, password, role) {
        this.username = username; // not unique, more of like a display name
        this.password = password;
        this.id = generateID('u'); // keep id secure!! like secondary password
        this.role = role;
    }

    promote() {
        this.role = "mod";
    }

    demote() {
        this.role = "member";
    }
}


// -------- Comment-related functions --------

// add a top level comment (reply to post)
export async function addTopComment(contents, author, post) {
    const newcom = new Comment(contents, author, post);
    return connectionPool.query('CALL addCommentTop(?, ?, ?, ?, ?, ?)',
        [contents, author, newcom.timestamp, newcom.status, newcom.id, post]);
}

// add a nested comment (reply to comment)
export async function addNestComment(contents, author, comment) {
    const newcom = new Comment(contents, author, comment);
    return connectionPool.query('CALL addCommentNest(?, ?, ?, ?, ?, ?)',
        [contents, author, newcom.timestamp, newcom.status, newcom.id, comment]);
}

// load top level comments on this post
export async function loadTopComment(post) {
    return connectionPool.query('CALL fetchTopComments(?)', [post]);
}

// load nested comments for this comment
export async function loadNestComment(comment) {
    return connectionPool.query('CALL fetchNestedComments(?)', [comment]);
}


// -------- User-related functions --------

// register new user
// NOTE: make reject if user & pass are longer than 12 characters, also reject if length = 0
export async function registerUser(user, pass) {
    if (user.length < 1) throw new Error('Username invalid: must at least be one character');
    if (pass.length < 1) throw new Error('Password invalid: must at least be one character');
    if (user.length > 12) throw new Error('Username invalid: exceeded 12 characters');
    if (pass.length > 12) throw new Error('Password invalid: exceeded 12 characters');

    const newser = new User(user, pass, 'member');
    return connectionPool.query('CALL registerUser(?, ?, ?, ?)', [user, pass, newser.role, newser.id]);
    // stops injection attacks, like someone doing "\t\tmod" as a password and becoming a mod
    // (?, ?, ?, ?) 'reads literal', aka flattens input into text & does not allow regex (?) operations
}

// dont need loadUsers because I'm not currently planning any functions that would allow people to view a list of users


// -------- Post-related functions --------

// add new post
// should be in order (load from top
export async function addNewPost(contents, author) {
    const newst = new Post(contents, author);
    // NOTE: put it in the SQL db
}

// load posts
// should start out 30, load 10 more posts every time user requests loading older posts
// if posts are less than fetchReqAmount, fetchReqAmount shrinks appropriately
export async function loadPosts() {
    // for checking how many posts there are in the db (no need to increment
    // fetchReqAmount if we've already loaded the entire forum into our feed)
    const totalPosts = await connectionPool.query('SELECT COUNT(*) FROM posts');
    if (totalPosts >= fetchReqAmount + 10) {
        fetchReqAmount += 10;
    } else {
        fetchReqAmount = totalPosts;
    }
    return connectionPool.execute('CALL fetchPosts(?)', [fetchReqAmount]);
}

// refresh posts
// loads the same amount of posts, without adding more
export async function refreshPosts() {
    const totalPosts = await connectionPool.query('SELECT COUNT(*) FROM posts');
    return connectionPool.execute('CALL fetchPosts(?)', [fetchReqAmount]);
}