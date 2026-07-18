import { connectionPool } from "./database";

const initFetchAmount = 20;
export let currUser;
export let fetchReqAmount = initFetchAmount; // session-specific to current user

// check if password matches the user id, if true, allow login
export async function loginUser(id, pass) {
    const match = await connectionPool.query('CALL fetchUser(?)', [id]);
    const matchuser = match[0];
    if (matchuser.length != 0) {
        if (matchuser[0].password == pass) {
            currUser = new User(matchuser[0].username, matchuser[0].password, matchuser[0].role);
            currUser.id = matchuser[0].id;
            fetchReqAmount = initFetchAmount;
            // successful login, refresh page
        } else {
            // tell user the password is incorrect
        }
    } else {
        // tell user there is no user by that id
    }
}

// check if user has permission to view ids of users
export function canSeeIdentity() {
    if (currUser === undefined) return false;
    if (currUser.role == 'member') return false;
    return true;
}

// check if user has permission to view promotion/demotion function
export function canProDemote() {
    if (currUser === undefined) return false;
    if (currUser.role == 'member') return false;
    return true;
}

// check if user can delete comment
export function canDelCom(comment) {
    if (currUser === undefined) return false;
    if (currUser.role == 'mod') return true;
    if (currUser.id == comment.author) return true;
    return false;
}

// check if user can delete post
export function canDelCom(post) {
    if (currUser === undefined) return false;
    if (currUser.role == 'mod') return true;
    if (currUser.id == post.author) return true;
    return false;
}