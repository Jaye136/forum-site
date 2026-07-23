import { fetchReqAmount, setFetchReq } from "./auth.js";
import { connectionPool } from "./database.js";

// -------- ID generation --------

// check if ID is valid (does not already exist)
const validID = async function (type, id) {
    if (type == c) {
        const [match] = await connectionPool.query('SELECT * FROM comments WHERE ID = ?', [id]);
    } else if (type == p) {
        const [match] = await connectionPool.query('SELECT * FROM posts WHERE ID = ?', [id]);
    } else { // if (type == u)
        const [match] = await connectionPool.query('SELECT * FROM users WHERE ID = ?', [id]);
    }
    return match.length == 0;
}

// generate a unique ID for a post
const generateID = function (type) {
    // Code credits (1 line): https://www.codemzy.com/blog/random-unique-id-javascript
    let id = Math.random().toString(36).substring(2, 10);
    return validID(type, id) ? id : generateID();
}


// -------- Comment-related functions --------

// add a top level comment (reply to post)
export async function addTopComment(contents, author, post) {
    await connectionPool.query('CALL addCommentTop(?, ?, ?, ?, ?, ?)',
        [contents, author, NOW(), 'active', 'p' + generateID('c'), post]);
}

// add a nested comment (reply to comment)
export async function addNestComment(contents, author, comment) {
    await connectionPool.query('CALL addCommentNest(?, ?, ?, ?, ?, ?)',
        [contents, author, NOW(), 'active', 'c' + generateID('c'), comment]);
}

// load top level comments on this post
async function loadTopComments(post) {
    const [topcoms] = await connectionPool.query('CALL fetchTopComment(?)', ['p' + post]);
    return topcoms[0];
}

// load nested comments for this comment
async function loadNestComments(comment) {
    const [nestcoms] = await connectionPool.query('CALL fetchNestedComment(?)', ['c' + comment]);
    return nestcoms[0];
}

// load comments & users in the format below
// [ {{comment, username}, {{comment, username}, {comment, username}}}, {{comment, poster}, {{}}} ]
export async function loadAllComments(post) {
    const topComments = await loadTopComments(post.id);
    const commentChunks = [];
    for (const comment of topComments) {
        const [topPosterRow] = await connectionPool.query('CALL fetchUser(?)', [comment.author]);
        const topPoster = topPosterRow[0][0];
        const topChunk = [comment, topPoster.username];

        const nestComments = await loadNestComments(comment.id);
        const nestChunks = [];
        for (const nestComment of nestComments) {
            const [nestPosterRow] = await connectionPool.query('CALL fetchUser(?)', [nestComment.author]);
            const nestPoster = nestPosterRow[0][0];
            nestChunks.push([nestComment, nestPoster.username]);
        }
        commentChunks.push([topChunk, nestChunks]);
    }

    return commentChunks;
}


// -------- User-related functions --------

// register new user
// NOTE: make reject if user & pass are longer than 12 characters, also reject if length = 0
export async function registerUser(user, pass) {
    if (user.length < 1) throw new Error('Username invalid: must at least be one character');
    if (pass.length < 1) throw new Error('Password invalid: must at least be one character');
    if (user.length > 12) throw new Error('Username invalid: exceeded 12 characters');
    if (pass.length > 12) throw new Error('Password invalid: exceeded 12 characters');

    await connectionPool.query('CALL registerUser(?, ?, ?, ?)', [user, pass, generateID('u'), 'member']);
    // stops injection attacks, like someone doing "\t\tmod" as a password and becoming a mod
    // (?, ?, ?, ?) 'reads literal', aka flattens input into text & does not allow regex (?) operations
}


// -------- Post-related functions --------

// add new post
// should be in order (load from top
export async function addNewPost(title, contents, author) {
    await connectionPool.query('CALL addPost(?, ?, ?, ?, ?, ?)',
        [title, contents, author, NOW(), generateID('p'), 'active']);
}

export async function loadPost(id) {
    const [match] = await connectionPool.query('CALL fetchPost(?)', [id]);
    return match[0];
}

// load posts
// should start out 30, load 10 more posts every time user requests loading older posts
// if posts are less than fetchReqAmount, fetchReqAmount shrinks appropriately
export async function loadPosts() {
    // for checking how many posts there are in the db (no need to increment
    // fetchReqAmount if we've already loaded the entire forum into our feed)
    const [totalPosts] = await connectionPool.query('SELECT COUNT(*) AS total FROM posts');
    const totalNum = totalPosts[0].total;
    if (totalNum >= fetchReqAmount + 10) {
        setFetchReq(fetchReqAmount + 10);
    } else {
        setFetchReq(totalNum);
    }
    const [posts] = await connectionPool.query('CALL fetchPosts(?)', [fetchReqAmount]);
    return posts[0];
}

// refresh posts
// loads the same amount of posts, without adding more
export async function refreshPosts() {
    const [posts] = await connectionPool.query('CALL fetchPosts(?)', [fetchReqAmount]);
    return posts[0];
}