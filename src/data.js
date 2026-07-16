import fs from 'fs';
import path from 'path';


// -------- Data containers --------

const forumStore = new Map(); // to hold all of the posts in the forum
const userMap = new Map(); // loading existing users


// -------- Loading & writing --------

const userFile = path.resolve('users.tsv');
let userWrite;


// -------- ID generation --------
// check if ID is valid (does not already exist in map)
const validID = function (type, id) {
    if (type == p) return !forumStore.has(id);
    if (type == u) return !userMap.has(id);

    console.log('Invalid type! Please report this error.');
    return true; // infinite loop probably worse...
}

// generate a unique ID for a post
const generateID = function(type) {
    // Code credits (1 line): https://www.codemzy.com/blog/random-unique-id-javascript
    let id =  Math.random().toString(36).substring(2, 10);
    return validID(type, id)? type + id : generateID();
}


// -------- Classes --------

class Comment {
    constructor(contents, author) {
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

class Post {
    constructor(contents, author) {
        this.contents = contents;
        this.author = author;
        this.timestamp = new Date();
        this.id = generateID('p');
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


// -------- User-related functions --------

// Code Credits (async & trycatch template): https://nodejs.org/learn/manipulating-files/reading-files-with-nodejs
// readfile and not readstream because users.tsv only needs to be loaded once per session

// self note: function() becomes defined in order of read, funtion = function() {} becomes defined when called
// function1(); function1 = function() { definition } => invalid || function expression
// function2(); funtion2() { definition } => (call position before define position) valid || function declaration
export async function loadUsers() {
    try {
        const userData = await fs.readFile(userFile, 'utf8');
        console.log('users.tsv loaded successfully.');

        const userList = userData.split('\n'); // array where each entry is one row

        while (userList.length > 1) { // iterate through rows, ignoring the first (column labels)
            let userInfo = userList.pop();
            userInfo = userInfo.split('\t');
            userMap.set(userInfo[2], new User(userInfo[0], userInfo[1], userInfo[3]));
            userMap.get(userInfo[2]).id = userInfo[2];
        }
    } catch (err) {
        console.error('Error occurred while reading users.tsv.', err);
    }
}

// create writestream to enable writing additions to the user list
// writestream and not writefile because multiple users may register per session
// for personal future reference: https://nodejs.org/api/fs.html#file-system-flags
export function connectUserStream() {
    userWrite = fs.createWriteStream(userFile, 'utf8', { flags: 'r+', start: Number.MAX_SAFE_INTEGER });

    userWrite.on('ready', () => {
        console.log('writeStream connection with users.tsv secured.');
    });

    userWrite.on('error', err => {
        userWrite.destroy(); // since previous writestream is faulty (don't keep it)
        if (err.code == 'ENOENT') {
            console.error('users.tsv is misplaced or has been deleted. Creating another...');
            fs.writeFile(userFile, 'username\tpassword\tuuid\tpermissions', 'utf8', err => {
                if (err) {
                    console.error('users.tsv errors could not be resolved.', err);
                    process.exit(1);
                } else {
                    console.log('Successfully created users.tsv. Attempting to reconnect write stream to users.tsv...');
                    connectUserStream(); // recurse back now that users.tsv exists and is correctly set up with labels
                }
            });
        } else {
            console.error('writeStream connection with users.tsv could not be secured.', err);
            process.exit(1);
        }
    });
}

export function userCheck(id) {
    return (userMap.has(id))? userMap.get(id) : false;
}

// register new user
export function registerUser(user, pass) {
    const newser = new User(user, pass, 'member');
    userMap.set(newser.id, newser);
    userWrite.write(`\n${user}\t${pass}\t${newser.id}\t${newser.role}`);
}


// -------- Post-related functions --------

export async function loadPosts() {
    // stub
}

export function connectPostStream() {
    // stub
}

// add new post
export function addNewPost(contents, author) {
    const newst = new Post(contents, author);
    forumStore.set(newst.id, newst);
}